const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs-extra');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from parent directory (frontend)
app.use(express.static(path.join(__dirname, '..')));

// Data directory
const DATA_DIR = path.join(__dirname, 'data');
const MENU_FILE = path.join(DATA_DIR, 'menu.json');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Ensure data directory exists
fs.ensureDirSync(DATA_DIR);

// Initialize data files if they don't exist
if (!fs.existsSync(MENU_FILE)) {
    const initialMenu = [
        {
            id: 1,
            name: "Pizza",
            price: 1200,
            image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
            description: "Delicious pizza with fresh ingredients"
        },
        {
            id: 2,
            name: "Burger",
            price: 600,
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
            description: "Juicy burger with special sauce"
        },
        {
            id: 3,
            name: "Pasta",
            price: 900,
            image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop",
            description: "Creamy pasta with authentic flavors"
        }
    ];
    fs.writeJsonSync(MENU_FILE, initialMenu, { spaces: 2 });
}

if (!fs.existsSync(ORDERS_FILE)) {
    fs.writeJsonSync(ORDERS_FILE, [], { spaces: 2 });
}

// Helper function to read JSON file
const readJsonFile = (filePath) => {
    try {
        return fs.readJsonSync(filePath);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return [];
    }
};

// Helper function to write JSON file
const writeJsonFile = (filePath, data) => {
    try {
        fs.writeJsonSync(filePath, data, { spaces: 2 });
        return true;
    } catch (error) {
        console.error(`Error writing ${filePath}:`, error);
        return false;
    }
};

// ==================== API ROUTES ====================

// Get all menu items
app.get('/api/menu', (req, res) => {
    try {
        const menu = readJsonFile(MENU_FILE);
        res.json({ success: true, data: menu });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch menu' });
    }
});

// Get single menu item by ID
app.get('/api/menu/:id', (req, res) => {
    try {
        const menu = readJsonFile(MENU_FILE);
        const item = menu.find(m => m.id === parseInt(req.params.id));
        if (item) {
            res.json({ success: true, data: item });
        } else {
            res.status(404).json({ success: false, error: 'Menu item not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch menu item' });
    }
});

// Create new order
app.post('/api/orders', (req, res) => {
    try {
        const { item, quantity, name, phone, address, payment } = req.body;

        // Validation
        if (!item || !quantity || !name || !phone || !address || !payment) {
            return res.status(400).json({ 
                success: false, 
                error: 'All fields are required' 
            });
        }

        // Server-side validation: Name should contain only letters and spaces
        const nameValue = String(name || '').trim();
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(nameValue)) {
            return res.status(400).json({
                success: false,
                error: 'Name should contain only letters.'
            });
        }

        // Get menu to calculate price
        const menu = readJsonFile(MENU_FILE);
        const menuItem = menu.find(m => m.name === item);
        
        if (!menuItem) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid menu item' 
            });
        }

        // Quantity validation
        const qty = parseInt(quantity, 10);
        if (!Number.isInteger(qty) || qty < 1) {
            return res.status(400).json({ success: false, error: 'Quantity must be at least 1' });
        }

        // Phone validation: allow common formatting but require 7-15 digits
        const phoneRaw = String(phone || '').trim();
        const phoneDigits = phoneRaw.replace(/[^0-9]/g, '');
        if (phoneDigits.length < 7 || phoneDigits.length > 15) {
            return res.status(400).json({ success: false, error: 'Enter a valid phone number (7-15 digits)' });
        }

        // Address validation
        const addressStr = String(address || '').trim();
        if (addressStr.length < 5) {
            return res.status(400).json({ success: false, error: 'Address must be at least 5 characters' });
        }

        const totalPrice = menuItem.price * qty;

        // Create order object
        const order = {
            id: Date.now(), // Simple ID generation
            item: item,
            itemId: menuItem.id,
            quantity: parseInt(quantity),
            price: menuItem.price,
            totalPrice: totalPrice,
            customerName: name,
            customerPhone: phone,
            deliveryAddress: address,
            paymentMethod: payment,
            status: 'pending', // pending, confirmed, preparing, out_for_delivery, delivered, cancelled
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // Read existing orders
        const orders = readJsonFile(ORDERS_FILE);
        orders.push(order);

        // Write back to file
        if (writeJsonFile(ORDERS_FILE, orders)) {
            res.status(201).json({ 
                success: true, 
                message: 'Order placed successfully',
                data: order 
            });
        } else {
            res.status(500).json({ success: false, error: 'Failed to save order' });
        }
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ success: false, error: 'Failed to create order' });
    }
});

// Get all orders
app.get('/api/orders', (req, res) => {
    try {
        const orders = readJsonFile(ORDERS_FILE);
        res.json({ success: true, data: orders });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch orders' });
    }
});

// Get single order by ID
app.get('/api/orders/:id', (req, res) => {
    try {
        const orders = readJsonFile(ORDERS_FILE);
        const order = orders.find(o => o.id === parseInt(req.params.id));
        if (order) {
            res.json({ success: true, data: order });
        } else {
            res.status(404).json({ success: false, error: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch order' });
    }
});

// Update order status
app.patch('/api/orders/:id', (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];
        
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Valid status is required' 
            });
        }

        const orders = readJsonFile(ORDERS_FILE);
        const orderIndex = orders.findIndex(o => o.id === parseInt(req.params.id));
        
        if (orderIndex === -1) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        orders[orderIndex].status = status;
        orders[orderIndex].updatedAt = new Date().toISOString();

        if (writeJsonFile(ORDERS_FILE, orders)) {
            res.json({ 
                success: true, 
                message: 'Order status updated',
                data: orders[orderIndex] 
            });
        } else {
            res.status(500).json({ success: false, error: 'Failed to update order' });
        }
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ success: false, error: 'Failed to update order' });
    }
});

// Delete order
app.delete('/api/orders/:id', (req, res) => {
    try {
        const orders = readJsonFile(ORDERS_FILE);
        const filteredOrders = orders.filter(o => o.id !== parseInt(req.params.id));
        
        if (orders.length === filteredOrders.length) {
            return res.status(404).json({ success: false, error: 'Order not found' });
        }

        if (writeJsonFile(ORDERS_FILE, filteredOrders)) {
            res.json({ success: true, message: 'Order deleted successfully' });
        } else {
            res.status(500).json({ success: false, error: 'Failed to delete order' });
        }
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ success: false, error: 'Failed to delete order' });
    }
});

// Get order statistics
app.get('/api/stats', (req, res) => {
    try {
        const orders = readJsonFile(ORDERS_FILE);
        const menu = readJsonFile(MENU_FILE);
        
        const stats = {
            totalOrders: orders.length,
            totalRevenue: orders.reduce((sum, order) => sum + order.totalPrice, 0),
            ordersByStatus: {
                pending: orders.filter(o => o.status === 'pending').length,
                confirmed: orders.filter(o => o.status === 'confirmed').length,
                preparing: orders.filter(o => o.status === 'preparing').length,
                out_for_delivery: orders.filter(o => o.status === 'out_for_delivery').length,
                delivered: orders.filter(o => o.status === 'delivered').length,
                cancelled: orders.filter(o => o.status === 'cancelled').length
            },
            popularItems: menu.map(item => {
                const itemOrders = orders.filter(o => o.itemId === item.id);
                return {
                    name: item.name,
                    orders: itemOrders.length,
                    revenue: itemOrders.reduce((sum, order) => sum + order.totalPrice, 0)
                };
            }).sort((a, b) => b.orders - a.orders)
        };

        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Foods for you Backend Server running on http://localhost:${PORT}`);
    console.log(`📋 API endpoints available at http://localhost:${PORT}/api`);
    console.log(`🌐 Frontend available at http://localhost:${PORT}`);
});

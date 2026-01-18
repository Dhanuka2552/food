# 🍔 Foods for you - Food Delivery System

A complete food delivery web application with frontend and backend integration.

## Features

- 🏠 **Home Page** - Attractive landing page with hero section
- 📋 **Menu Page** - Dynamic menu display with food images
- 🛒 **Order Placement** - Easy order form with validation
- 📊 **Admin Dashboard** - Order management and statistics
- 🔄 **RESTful API** - Complete backend API for all operations

## Project Structure

```
food delivery/
├── index.html          # Home page
├── menu.html          # Menu page
├── place-order.html   # Order placement page
├── admin.html         # Admin dashboard
├── style.css          # Main stylesheet
└── backend/
   ├── server.js      # Express server
    ├── package.json   # Dependencies
    └── data/          # JSON database (auto-created)
        ├── menu.json
        └── orders.json
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)

### Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - API Base URL: http://localhost:3000/api

## API Endpoints

### Menu
 - `GET /api/menu` - Get all menu items
- `GET /api/menu/:id` - Get single menu item

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `PATCH /api/orders/:id` - Update order status
- `DELETE /api/orders/:id` - Delete order

### Statistics
- `GET /api/stats` - Get order statistics

## Order Status Flow

1. **pending** - Order just placed
2. **confirmed** - Order confirmed by restaurant
3. **preparing** - Food is being prepared
4. **out_for_delivery** - Order is on the way
5. **delivered** - Order completed
6. **cancelled** - Order cancelled

## Usage

### For Customers

1. Visit the home page
2. Browse the menu
3. Click "Order" on any item
4. Fill in your details and place order
5. Receive confirmation with order ID

### For Administrators

1. Visit `/admin.html`
2. View order statistics
3. Manage orders - update status, delete orders
4. Monitor total revenue and popular items

## Technologies Used

### Frontend
- HTML5
- CSS3 (with gradients and animations)
- Vanilla JavaScript (ES6+)

### Backend
- Node.js
- Express.js
- fs-extra (for file operations)
- CORS (for cross-origin requests)

## Data Storage

The application uses JSON files for data storage:
- `backend/data/menu.json` - Menu items
- `backend/data/orders.json` - All orders

These files are automatically created when the server starts for the first time.

## Development

### Adding New Menu Items

Edit `backend/data/menu.json` or add them through the API. The menu structure:

```json
{
  "id": 1,
  "name": "Pizza",
  "price": 1200,
  "image": "image-url",
  "description": "Description"
}
```

### Customizing

- **Port**: Change `PORT` in `server.js` or set `PORT` environment variable
- **Styling**: Edit `style.css` for frontend styling
- **API**: Modify routes in `server.js`

## Troubleshooting

### Port Already in Use
If port 3000 is already in use, change it in `server.js`:
```javascript
const PORT = process.env.PORT || 3001; // Change to 3001 or any available port
```

### CORS Issues
CORS is already enabled in the server. If you encounter issues, check the `cors()` middleware in `server.js`.

### Data Not Persisting
Make sure the `backend/data/` directory has write permissions.

## License

This project is open source and available for educational purposes.

## Support

For issues or questions, please check the code comments or create an issue in the repository.

---

**Enjoy your food delivery system! 🚀**

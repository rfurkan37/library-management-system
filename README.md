# 📚 Library Management System

A comprehensive, modern library management system built with Node.js, Express, MongoDB, and EJS. This project combines a robust backend architecture with an AI-enhanced frontend to deliver a complete library management solution.

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![EJS](https://img.shields.io/badge/EJS-B4CA65?style=for-the-badge&logo=ejs&logoColor=black)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## 🎯 Project Overview

This library management system was developed with a unique collaborative approach:
- **Backend & Architecture**: Hand-crafted by the original developer with careful attention to MVC patterns, RESTful API design, and database modeling
- **Frontend & UI/UX**: Enhanced and beautified with AI assistance to create a modern, responsive, and intuitive user interface

*Consider this AI-enhanced frontend as a gift from the future to the past - elevating the solid backend foundation with contemporary design patterns and user experience improvements.*

## ✨ Features

### 📚 Book Management
- **📊 Comprehensive Book Details**: Track title, author, ISBN, quantity, publication info, and more
- **🔍 Smart Search & Filtering**: Advanced search by title, author, ISBN with real-time results
- **📖 Automatic Book Information**: Integration with Open Library API for metadata fetching
- **🖼️ Dynamic Cover Images**: Automatic book cover display from Open Library
- **📝 Full CRUD Operations**: Complete Create, Read, Update, Delete functionality
- **✅ ISBN Validation**: Smart validation for both ISBN-10 and ISBN-13 formats

### 🎫 Reservation System
- **📅 Advanced Reservation Management**: Complete reservation lifecycle tracking
- **👥 Customer Profile Management**: Detailed customer information and history
- **⏰ Smart Due Date Tracking**: Automated overdue detection and status updates
- **🔄 Status Management**: Handle active, returned, overdue, and cancelled reservations
- **💰 Automatic Fine Calculation**: Configurable fine system for overdue books
- **📧 Customer Communications**: Track customer interactions and history

### 🎨 Modern UI/UX (AI-Enhanced)
- **📱 Fully Responsive Design**: Mobile-first approach with seamless cross-device experience
- **🎯 Intuitive User Interface**: Clean, modern design with accessibility in mind
- **🔍 Advanced Filtering**: Multi-criteria filtering with instant results
- **📊 Interactive Dashboard**: Visual analytics with statistics and insights
- **⚡ Real-time Updates**: AJAX-powered interactions for smooth user experience
- **🎨 Beautiful Visual Design**: Gradient backgrounds, card layouts, and modern typography
- **💫 Smooth Animations**: Hover effects, transitions, and micro-interactions

### 🔧 Technical Excellence
- **🏗️ MVC Architecture**: Clean separation of concerns with well-organized code structure
- **🗄️ Robust Database Design**: MongoDB with Mongoose ODM and proper indexing
- **🔗 RESTful API**: Well-designed API endpoints following REST principles
- **🎨 Server-Side Rendering**: EJS templating for optimal performance
- **📱 Progressive Enhancement**: Works without JavaScript, enhanced with it
- **🔒 Comprehensive Validation**: Both client-side and server-side validation
- **🌐 External API Integration**: Seamless Open Library API integration
- **🚦 Error Handling**: Graceful error handling and user feedback

## 🛠️ Technologies Used

### Backend (Hand-crafted)
- **Runtime**: Node.js (v14+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Template Engine**: EJS
- **Validation**: Express-validator
- **HTTP Client**: Axios

### Frontend (AI-Enhanced)
- **Markup**: Semantic HTML5
- **Styling**: Modern CSS3 with Grid, Flexbox, and Custom Properties
- **Scripting**: Vanilla JavaScript (ES6+)
- **Design**: Custom CSS with modern design patterns
- **Responsiveness**: Mobile-first responsive design
- **Icons**: Font Awesome integration

### External Services
- **Open Library API**: Book metadata and cover images
- **MongoDB Atlas**: Cloud database (optional)

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rfurkan37/library-management-system.git
   cd library-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start MongoDB**
   ```bash
   # macOS (Homebrew)
   brew services start mongodb/brew/mongodb-community
   
   # Ubuntu/Debian
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

4. **Run the application**
   ```bash
   npm start
   ```

5. **Access the application**
   Navigate to `http://localhost:3000` in your browser

## 📖 Usage Guide

### 📚 Managing Books
1. **Adding Books**: Navigate to "Add Book" → Fill details → System auto-fetches metadata from Open Library
2. **Browsing Books**: Use the books page with search, filter, and sort capabilities
3. **Editing Books**: Click edit on any book to modify details
4. **ISBN Validation**: System validates both ISBN-10 and ISBN-13 formats

### 🎫 Handling Reservations
1. **Creating Reservations**: From books page → Click "Reserve" → Select/add customer → Set due date
2. **Managing Returns**: Track and process book returns with automatic fine calculation
3. **Customer Management**: Add and manage customer profiles with full history

### 📊 Dashboard Analytics
- **Overview Statistics**: Total books, available books, active reservations
- **Status Monitoring**: Track overdue books and fines
- **Visual Insights**: Charts and graphs for library metrics

## 🔌 API Documentation

### Books API
```
GET    /books              # List all books with filtering
POST   /books              # Create new book
GET    /books/:id          # Get specific book
PUT    /books/:id          # Update book
DELETE /books/:id          # Delete book
GET    /books/api/isbn/:isbn # Get book by ISBN from Open Library
```

### Reservations API
```
GET    /reservations           # List reservations
POST   /reservations           # Create reservation
GET    /reservations/:id       # Get reservation details
PUT    /reservations/:id/return # Return book
PUT    /reservations/:id/renew  # Renew reservation
DELETE /reservations/:id       # Cancel reservation
GET    /reservations/status/overdue # Get overdue reservations
```

### Customers API
```
GET    /reservations/customers     # List customers
POST   /reservations/customers     # Create customer
GET    /reservations/customers/:id # Get customer with history
```

## 🗄️ Database Schema

### Book Model
```javascript
{
  title: { type: String, required: true },
  author: { type: String, required: true },
  isbn: { type: String, required: true, unique: true },
  quantity: { type: Number, default: 1 },
  availableQuantity: { type: Number },
  description: String,
  publishedYear: Number,
  genre: String,
  publisher: String,
  pageCount: Number,
  coverUrl: String,
  createdAt: { type: Date, default: Date.now }
}
```

### Customer Model
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: String,
  createdAt: { type: Date, default: Date.now }
}
```

### Reservation Model
```javascript
{
  book: { type: ObjectId, ref: 'Book', required: true },
  customer: { type: ObjectId, ref: 'Customer', required: true },
  reservationDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  returnDate: Date,
  status: { 
    type: String, 
    enum: ['active', 'returned', 'overdue', 'cancelled'],
    default: 'active' 
  },
  fine: { type: Number, default: 0 },
  notes: String
}
```

## 🎨 Design Philosophy

This project showcases the beautiful synergy between human-crafted backend architecture and AI-enhanced frontend design:

- **Backend Excellence**: Clean MVC architecture, robust error handling, and efficient database design
- **Frontend Beauty**: Modern UI/UX principles, responsive design, and delightful user interactions
- **Code Quality**: Well-commented, maintainable code with proper separation of concerns
- **User Experience**: Intuitive workflows and helpful feedback throughout the application

## 🚀 Deployment

### Environment Variables
Create a `.env` file in the root directory:
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/library-management
```

### Production Deployment
1. **Build for production**: `npm run build` (if applicable)
2. **Set environment variables**: Configure your hosting platform
3. **Deploy**: Upload to your preferred hosting service (Heroku, DigitalOcean, AWS, etc.)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Backend Architecture**: Carefully crafted with attention to MVC patterns and REST principles
- **Frontend Enhancement**: AI-assisted design improvements for modern user experience
- **Open Library**: For providing the book metadata API
- **MongoDB**: For the robust database solution
- **Express.js Community**: For the excellent web framework

## 📞 Contact

**Recep Furkan Akin** - [@rfurkan37](https://github.com/rfurkan37)

Project Link: [https://github.com/rfurkan37/library-management-system](https://github.com/rfurkan37/library-management-system)

---

*"A testament to the beautiful collaboration between human engineering excellence and AI-powered design enhancement."*
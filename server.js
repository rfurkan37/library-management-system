/**
 * Library Management System
 * A comprehensive library management system with book cataloging, reservations, and customer management.
 * 
 * Backend Architecture: Hand-crafted with MVC pattern
 * Frontend Enhancement: AI-assisted modern UI/UX design
 * 
 * @author Recep Furkan Akin
 * @version 1.0.0
 */

// Load environment variables
require('dotenv').config();

// Core dependencies
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

// Route modules
const indexRouter = require('./routes/index');
const booksRouter = require('./routes/books');
const reservationsRouter = require('./routes/reservations');

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 3000;

// ===== CONFIGURATION =====

// Template engine configuration
app.set('view engine', 'ejs');

// ===== MIDDLEWARE SETUP =====

// HTTP method override for forms (PUT, DELETE support)
app.use(methodOverride('_method'));

// Body parsing middleware
app.use(express.urlencoded({ extended: true })); // Form data parsing
app.use(express.json()); // JSON parsing

// ===== DATABASE CONNECTION =====

/**
 * Establishes connection to MongoDB database
 * Uses environment variables for configuration
 * Includes comprehensive error handling
 */
const connectDB = async () => {
  const databaseURL = process.env.DATABASE_URL;
  
  if (!databaseURL) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    console.error('💡 Please create a .env file or set DATABASE_URL');
    console.error('📝 Example: DATABASE_URL=mongodb://localhost:27017/library-management');
    process.exit(1);
  }

  try {
    await mongoose.connect(databaseURL);
    console.log('✅ Connected to MongoDB');
    console.log(`🗄️  Database: ${databaseURL}`);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('💡 Make sure MongoDB is running and the connection string is correct');
    process.exit(1);
  }
};

// Initialize database connection
connectDB();

// ===== ROUTE REGISTRATION =====

// Main application routes
app.use('/', indexRouter);           // Dashboard and home routes
app.use('/books', booksRouter);      // Book management routes
app.use('/reservations', reservationsRouter); // Reservation and customer routes

// ===== ERROR HANDLING =====

/**
 * Global error handler middleware
 * Catches and handles all unhandled errors
 */
app.use((err, req, res, next) => {
  console.error('💥 Application Error:', err.stack);
  res.status(500).render('error', { 
    error: 'Something went wrong!',
    title: 'Server Error - Library Management System',
    currentPage: ''
  });
});

/**
 * 404 Not Found handler
 * Handles requests to non-existent routes
 */
app.use((req, res) => {
  res.status(404).render('error', { 
    error: 'Page not found',
    title: 'Page Not Found - Library Management System',
    currentPage: ''
  });
});

// ===== SERVER STARTUP =====

/**
 * Start the Express server
 * Listen on configured port with startup message
 */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 Library Management System is ready!`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

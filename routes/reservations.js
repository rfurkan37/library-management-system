const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Customer = require('../models/customer');
const Reservation = require('../models/reservation');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateReservation = [
  body('customerId').isMongoId().withMessage('Valid customer ID is required'),
  body('bookId').isMongoId().withMessage('Valid book ID is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    next();
  }
];

const validateCustomer = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').matches(/^\+?[\d\s-()]+$/).withMessage('Valid phone number is required'),
  body('address.street').optional().trim().isLength({ max: 200 }),
  body('address.city').optional().trim().isLength({ max: 50 }),
  body('address.state').optional().trim().isLength({ max: 50 }),
  body('address.zipCode').optional().trim().isLength({ max: 20 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }
    next();
  }
];

// GET /reservations - List all reservations (both API and view)
router.get('/', async (req, res) => {
  try {
    const { status, customer, book, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    let filter = {};
    if (status) filter.status = status;
    if (customer) {
      // Search customer by name or email
      const customers = await Customer.find({
        $or: [
          { name: { $regex: customer, $options: 'i' } },
          { email: { $regex: customer, $options: 'i' } }
        ]
      }).select('_id');
      filter.customer = { $in: customers.map(c => c._id) };
    }
    if (book) {
      // Search book by title or author
      const books = await Book.find({
        $or: [
          { title: { $regex: book, $options: 'i' } },
          { author: { $regex: book, $options: 'i' } }
        ]
      }).select('_id');
      filter.book = { $in: books.map(b => b._id) };
    }
    
    const reservations = await Reservation.find(filter)
      .populate('book', 'title author isbn coverUrl')
      .populate('customer', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Reservation.countDocuments(filter);
    
    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    };
    
    // Check if it's an API request
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({ reservations, pagination });
    }
    
    // Render the view
    res.render('reservations', {
      reservations,
      pagination,
      status: status || '',
      customer: customer || '',
      book: book || ''
    });
  } catch (error) {
    console.error('Error fetching reservations:', error);
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(500).json({ error: 'Failed to fetch reservations' });
    }
    res.status(500).render('error', { error: 'Failed to fetch reservations' });
  }
});

// GET /reservations/new - New reservation form
router.get('/new', async (req, res) => {
  try {
    const books = await Book.find({ quantity: { $gt: 0 } }).sort({ title: 1 });
    const customers = await Customer.find().sort({ name: 1 });
    
    res.render('new-reservation', { 
      title: 'New Reservation - Library Management System',
      currentPage: 'reservations',
      books,
      customers,
      selectedBook: req.query.book || null
    });
  } catch (error) {
    console.error('Error loading new reservation form:', error);
    res.status(500).render('error', { error: 'Failed to load reservation form' });
  }
});

// GET /reservations/customers - List customers  
router.get('/customers', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    let filter = {};
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const customers = await Customer.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(parseInt(limit));
      
    const total = await Customer.countDocuments(filter);
    
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.json({
        customers,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          hasNext: skip + customers.length < total,
          hasPrev: page > 1
        }
      });
    }
    
    res.render('customers', {
      title: 'Customers - Library Management System',
      currentPage: 'reservations',
      customers,
      search: search || '',
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        hasNext: skip + customers.length < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    if (req.headers.accept && req.headers.accept.includes('application/json')) {
      return res.status(500).json({ error: 'Failed to fetch customers' });
    }
    res.status(500).render('error', { error: 'Failed to fetch customers' });
  }
});

// GET /reservations/status/overdue - Get overdue reservations
router.get('/status/overdue', async (req, res) => {
  try {
    const overdueReservations = await Reservation.find({
      status: 'active',
      dueDate: { $lt: new Date() }
    })
    .populate('book', 'title author isbn')
    .populate('customer', 'name email phone')
    .sort({ dueDate: 1 });
    
    // Update status to overdue
    const updatePromises = overdueReservations.map(reservation => {
      reservation.status = 'overdue';
      return reservation.save();
    });
    
    await Promise.all(updatePromises);
    
    res.json({
      count: overdueReservations.length,
      reservations: overdueReservations
    });
  } catch (error) {
    console.error('Error fetching overdue reservations:', error);
    res.status(500).json({ error: 'Failed to fetch overdue reservations' });
  }
});

// GET /reservations/:id - Get specific reservation
router.get('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('book')
      .populate('customer');
      
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    res.json(reservation);
  } catch (error) {
    console.error('Error fetching reservation:', error);
    res.status(500).json({ error: 'Failed to fetch reservation' });
  }
});

// POST /reservations - Create new reservation
router.post('/', validateReservation, async (req, res) => {
  try {
    const { customerId, bookId, dueDate } = req.body;
    
    // Check if book exists and is available
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }
    
    const isAvailable = await Reservation.checkBookAvailability(bookId);
    if (!isAvailable) {
      return res.status(400).json({ error: 'Book is not available for reservation' });
    }
    
    // Check if customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Check customer eligibility
    const isEligible = await customer.isEligibleForReservation();
    if (!isEligible) {
      return res.status(400).json({ 
        error: 'Customer is not eligible for reservation (may have overdue books or unpaid fines)' 
      });
    }
    
    // Create reservation
    const reservation = new Reservation({
      customer: customerId,
      book: bookId,
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days default
    });
    
    await reservation.save();
    
    // Populate the reservation for response
    await reservation.populate('book', 'title author isbn coverUrl');
    await reservation.populate('customer', 'name email phone');
    
    res.status(201).json({
      message: 'Reservation created successfully',
      reservation
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ error: 'Failed to create reservation' });
  }
});

// PUT /reservations/:id/return - Return a book
router.put('/:id/return', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    if (reservation.status !== 'active' && reservation.status !== 'overdue') {
      return res.status(400).json({ error: 'Book is not currently borrowed' });
    }
    
    // Calculate fine if overdue
    const fine = reservation.calculateFine();
    
    reservation.status = 'returned';
    reservation.returnDate = new Date();
    if (fine > 0) {
      reservation.fine = fine;
    }
    
    await reservation.save();
    
    await reservation.populate('book', 'title author isbn');
    await reservation.populate('customer', 'name email phone');
    
    res.json({
      message: 'Book returned successfully',
      reservation,
      fine: fine > 0 ? fine : 0
    });
  } catch (error) {
    console.error('Error returning book:', error);
    res.status(500).json({ error: 'Failed to return book' });
  }
});

// PUT /reservations/:id/renew - Renew a reservation
router.put('/:id/renew', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('customer');
      
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    if (reservation.status !== 'active') {
      return res.status(400).json({ error: 'Only active reservations can be renewed' });
    }
    
    // Check if customer is eligible for renewal
    const isEligible = await reservation.customer.isEligibleForReservation();
    if (!isEligible) {
      return res.status(400).json({ 
        error: 'Customer is not eligible for renewal' 
      });
    }
    
    // Extend due date by 14 days
    reservation.dueDate = new Date(reservation.dueDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    reservation.renewalCount = (reservation.renewalCount || 0) + 1;
    
    await reservation.save();
    
    await reservation.populate('book', 'title author isbn');
    
    res.json({
      message: 'Reservation renewed successfully',
      reservation
    });
  } catch (error) {
    console.error('Error renewing reservation:', error);
    res.status(500).json({ error: 'Failed to renew reservation' });
  }
});

// DELETE /reservations/:id - Cancel reservation
router.delete('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }
    
    if (reservation.status === 'returned') {
      return res.status(400).json({ error: 'Cannot cancel a returned reservation' });
    }
    
    reservation.status = 'cancelled';
    await reservation.save();
    
    res.json({ message: 'Reservation cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({ error: 'Failed to cancel reservation' });
  }
});

// Customer routes
// POST /reservations/customers - Create new customer
router.post('/customers', validateCustomer, async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    
    res.status(201).json({
      message: 'Customer created successfully',
      customer
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// GET /reservations/customers/:id - Get customer details
router.get('/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Get customer's reservations
    const reservations = await Reservation.find({ customer: req.params.id })
      .populate('book', 'title author isbn coverUrl')
      .sort({ createdAt: -1 });
    
    res.json({
      customer,
      reservations,
      stats: {
        totalReservations: reservations.length,
        activeReservations: reservations.filter(r => r.status === 'active').length,
        overdueReservations: reservations.filter(r => r.status === 'overdue').length,
        totalFines: reservations.reduce((sum, r) => sum + (r.fine || 0), 0)
      }
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

module.exports = router;
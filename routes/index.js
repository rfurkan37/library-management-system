const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Reservation = require('../models/reservation');

router.get('/', async (req, res) => {
  try {
    // Get dashboard stats
    const totalBooks = await Book.countDocuments();
    const availableBooks = await Book.aggregate([
      {
        $lookup: {
          from: 'reservations',
          localField: '_id',
          foreignField: 'book',
          as: 'activeReservations',
          pipeline: [
            { $match: { status: { $in: ['active', 'overdue'] } } }
          ]
        }
      },
      {
        $addFields: {
          availableQuantity: { $subtract: ['$quantity', { $size: '$activeReservations' }] }
        }
      },
      {
        $match: { availableQuantity: { $gt: 0 } }
      },
      {
        $count: 'available'
      }
    ]);
    
    const activeReservations = await Reservation.countDocuments({ status: 'active' });
    const overdueReservations = await Reservation.countDocuments({ status: 'overdue' });
    
    // Get recent books with covers
    const recentBooks = await Book.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .select('title author coverUrl createdAt');
    
    // Get upcoming due dates
    const upcomingDue = await Reservation.find({
      status: 'active',
      dueDate: { 
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Next 7 days
      }
    })
    .populate('book', 'title author')
    .populate('customer', 'name email')
    .sort({ dueDate: 1 })
    .limit(5);
    
    res.render('index', {
      stats: {
        totalBooks,
        availableBooks: availableBooks[0]?.available || 0,
        activeReservations,
        overdueReservations
      },
      recentBooks,
      upcomingDue
    });
  } catch (error) {
    console.error('Error loading dashboard:', error);
    res.render('index', {
      stats: { totalBooks: 0, availableBooks: 0, activeReservations: 0, overdueReservations: 0 },
      recentBooks: [],
      upcomingDue: []
    });
  }
});

module.exports = router;

const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer is required'],
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book is required'],
    },
    reservationDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    returnDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['reserved', 'borrowed', 'returned', 'overdue'],
      default: 'reserved',
    },
    notes: {
      type: String,
      maxlength: [300, 'Notes cannot exceed 300 characters'],
    },
    renewalCount: {
      type: Number,
      default: 0,
      max: [3, 'Maximum 3 renewals allowed'],
    },
    fine: {
      amount: {
        type: Number,
        default: 0,
        min: [0, 'Fine amount cannot be negative'],
      },
      paid: {
        type: Boolean,
        default: false,
      },
      reason: String,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for days overdue
reservationSchema.virtual('daysOverdue').get(function () {
  if (this.status !== 'overdue' || this.returnDate) return 0;
  
  const today = new Date();
  const diffTime = today - this.dueDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for loan duration
reservationSchema.virtual('loanDuration').get(function () {
  const endDate = this.returnDate || new Date();
  const diffTime = endDate - this.reservationDate;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to set due date (14 days from reservation)
reservationSchema.pre('save', function (next) {
  if (this.isNew && !this.dueDate) {
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
    this.dueDate = twoWeeksFromNow;
  }
  next();
});

// Pre-save middleware to calculate fine for overdue books
reservationSchema.pre('save', function (next) {
  if (this.status === 'overdue' && !this.returnDate && this.daysOverdue > 0) {
    // $1 per day overdue
    this.fine.amount = this.daysOverdue * 1;
    this.fine.reason = `Overdue by ${this.daysOverdue} days`;
  }
  next();
});

// Index for better query performance
reservationSchema.index({ customer: 1, status: 1 });
reservationSchema.index({ book: 1, status: 1 });
reservationSchema.index({ dueDate: 1 });
reservationSchema.index({ status: 1, dueDate: 1 });

// Static method to check if book is available
reservationSchema.statics.isBookAvailable = async function (bookId) {
  const activeReservations = await this.countDocuments({
    book: bookId,
    status: { $in: ['reserved', 'borrowed'] },
  });
  
  const Book = mongoose.model('Book');
  const book = await Book.findById(bookId);
  
  return book && activeReservations < book.quantity;
};

// Static method to get customer's active reservations count
reservationSchema.statics.getCustomerActiveReservationsCount = async function (customerId) {
  return await this.countDocuments({
    customer: customerId,
    status: { $in: ['reserved', 'borrowed'] },
  });
};

// Static method to find overdue reservations
reservationSchema.statics.findOverdueReservations = async function () {
  const today = new Date();
  return await this.find({
    status: 'borrowed',
    dueDate: { $lt: today },
    returnDate: null,
  }).populate('customer book');
};

module.exports = mongoose.model('Reservation', reservationSchema);
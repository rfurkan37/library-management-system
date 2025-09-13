const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      maxlength: [100, 'Author name cannot exceed 100 characters'],
    },
    isbn: {
      type: String,
      required: [true, 'ISBN is required'],
      unique: true,
      trim: true,
      validate: {
        validator(v) {
          const cleanISBN = v.replace(/[-\s]/g, '');
          return /^(97[89])?\d{9}[\dX]$/.test(cleanISBN);
        },
        message: 'Please enter a valid ISBN (10 or 13 digits)',
      },
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    publishedYear: {
      type: Number,
      min: [1000, 'Published year must be after 1000'],
      max: [new Date().getFullYear(), 'Published year cannot be in the future'],
    },
    genre: {
      type: String,
      trim: true,
      maxlength: [50, 'Genre cannot exceed 50 characters'],
    },
    quantity: {
      type: Number,
      default: 1,
      min: [0, 'Quantity cannot be negative'],
    },
    // Open Library integration fields
    coverUrl: {
      type: String,
      trim: true,
    },
    openLibraryId: {
      type: String,
      trim: true,
    },
    subjects: [
      {
        type: String,
        trim: true,
      },
    ],
    publisher: {
      type: String,
      trim: true,
      maxlength: [100, 'Publisher name cannot exceed 100 characters'],
    },
    pageCount: {
      type: Number,
      min: [1, 'Page count must be at least 1'],
    },
    registerDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for available quantity (total - reserved - borrowed)
bookSchema.virtual('availableQuantity').get(function () {
  return this.quantity - (this.reservedCount || 0);
});

// Virtual for reserved count
bookSchema.virtual('reservedCount', {
  ref: 'Reservation',
  localField: '_id',
  foreignField: 'book',
  count: true,
  match: { status: { $in: ['active', 'overdue'] } },
});

// Virtual for reservation list
bookSchema.virtual('reservations', {
  ref: 'Reservation',
  localField: '_id',
  foreignField: 'book',
});

// Method to check if book is available for reservation
bookSchema.methods.isAvailable = function () {
  return this.availableQuantity > 0;
};

// Method to get availability status
bookSchema.methods.getAvailabilityStatus = function () {
  const available = this.availableQuantity;
  if (available === 0) return 'unavailable';
  if (available <= 2) return 'limited';
  return 'available';
};

// Static method to find available books
bookSchema.statics.findAvailable = function () {
  return this.aggregate([
    {
      $lookup: {
        from: 'reservations',
        localField: '_id',
        foreignField: 'book',
        as: 'activeReservations',
        pipeline: [{ $match: { status: { $in: ['active', 'overdue'] } } }],
      },
    },
    {
      $addFields: {
        reservedCount: { $size: '$activeReservations' },
        availableQuantity: {
          $subtract: ['$quantity', { $size: '$activeReservations' }],
        },
      },
    },
    {
      $match: { availableQuantity: { $gt: 0 } },
    },
  ]);
};

// Create text index for search functionality
bookSchema.index({
  title: 'text',
  author: 'text',
  description: 'text',
  genre: 'text',
  subjects: 'text',
});

// Index for Open Library integration
bookSchema.index({ openLibraryId: 1 });

// Ensure virtual fields are included in JSON output
bookSchema.set('toJSON', { virtuals: true });
bookSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Book', bookSchema);

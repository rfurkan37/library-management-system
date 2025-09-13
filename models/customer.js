const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name cannot exceed 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator(email) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },
        message: 'Please enter a valid email address',
      },
    },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator(phone) {
          return /^[\+]?[1-9][\d]{0,15}$/.test(phone);
        },
        message: 'Please enter a valid phone number',
      },
    },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, trim: true, default: 'Turkey' },
    },
    membershipDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'inactive'],
      default: 'active',
    },
    maxReservations: {
      type: Number,
      default: 3,
      min: [1, 'Maximum reservations must be at least 1'],
      max: [10, 'Maximum reservations cannot exceed 10'],
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for full name
customerSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Index for better search performance
customerSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

module.exports = mongoose.model('Customer', customerSchema);
import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please provide a coupon code.'],
    unique: true,
    trim: true,
    uppercase: true, // Standardizes the code to uppercase
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Please specify the discount type.'],
  },
  discountValue: {
    type: Number,
    required: [true, 'Please provide a discount value.'],
  },
  expiresAt: {
    type: Date,
    required: [true, 'Please provide an expiration date.'],
  },
  minPurchase: {
    type: Number,
    default: 0, // Minimum purchase amount to apply the coupon
  },
}, {
  timestamps: true // Adds createdAt and updatedAt
});

/**
 * Prevent Mongoose from recompiling the model.
 */
export default mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
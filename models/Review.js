import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Which product is this review for?
    required: [true, 'Review must belong to a product.'],
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Who wrote this review?
    required: [true, 'Review must belong to a user.'],
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating.'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: [true, 'Please provide a comment.'],
    trim: true,
  },
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Create an index to ensure a user can only write one review per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
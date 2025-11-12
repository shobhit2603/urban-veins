import mongoose from 'mongoose';

// --- NEW: Sub-schema for Product Variants (Size, Color, Stock) ---
const VariantSchema = new mongoose.Schema({
  color: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
});

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a product name.'],
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description.'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price.'],
  },
  // 'images' is an array of strings, where each string is a URL
  images: [{
    type: String,
    required: true,
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category', // Reference to the Category model
    required: [true, 'Please provide a category.'],
  },
  // --- UPDATED: 'stock' is now part of the 'variants' array ---
  // stock: {
  //   type: Number,
  //   required: [true, 'Please provide stock quantity.'],
  //   default: 0,
  // },

  // --- NEW: 'variants' array ---
  variants: [VariantSchema],

  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review', // Reference to the Review model
  }],
  // We can pre-calculate the average rating for better performance
  averageRating: {
    type: Number,
    default: 0,
  },
  numReviews: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Create a text index for the 'name' and 'description' fields to enable text-based search
ProductSchema.index({ name: 'text', description: 'text' });

/**
 * Prevent Mongoose from recompiling the model.
 */
export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
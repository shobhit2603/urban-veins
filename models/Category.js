import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a category name.'],
    unique: true,
    trim: true,
  },
  slug: {
    type: String,
    required: [true, 'Please provide a slug.'],
    unique: true,
    trim: true,
  },
}, {
  timestamps: true // Adds createdAt and updatedAt
});

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);
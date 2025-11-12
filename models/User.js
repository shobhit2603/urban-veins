import mongoose from 'mongoose';

// Define the schema for items in the user's cart
const CartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Reference to the Product model
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
});

// --- NEW: Sub-schema for storable user addresses ---
const AddressSchema = new mongoose.Schema({
  label: {
    type: String, // e.g., "Home", "Work"
    required: true,
  },
  address: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name.'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email.'],
    unique: true,
    match: [/.+\@.+\..+/, 'Please provide a valid email address.'],
  },
  password: {
    type: String,
    // Password is not required if the user signs up via OAuth (Google/Facebook)
  },
  // --- NEW: Phone / Mobile ---
  mobile: {
    type: String,
    // Using a simple regex for basic validation
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit mobile number.'],
  },
  alternateMobile: {
    type: String,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit mobile number.'],
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  // --- OAuth Fields ---
  googleId: {
    type: String,
  },
  facebookId: {
    type: String,
  },
  // --- E-commerce Fields ---
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order', // Reference to the Order model
  }],
  // --- NEW: Stored addresses for faster checkout ---
  addresses: [AddressSchema],
  // We are embedding the cart directly in the user model for simplicity
  cart: [CartItemSchema],
}, {
  // timestamps: true adds 'createdAt' and 'updatedAt' fields automatically
  timestamps: true 
});

/**
 * Prevent Mongoose from recompiling the model.
 * This is useful in a development environment where Next.js hot-reloads.
 * The 'mongoose.models.User' check sees if the model has already been defined.
 */
export default mongoose.models.User || mongoose.model('User', UserSchema);
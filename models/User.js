import mongoose from 'mongoose';

// --- UPDATED: CartItemSchema now includes color and size ---
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
  // --- NEW: Variant details ---
  color: {
    type: String,
    required: true,
      },
  size: {
    type: String,
    required: true,
  },
});
// --- End of update ---

// Sub-schema for storable user addresses
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
  image: {
    type: String,
    default: null,
  },
  password: {
    type: String,
    // Password is not required if the user signs up via OAuth (Google/Facebook)
  },
  mobile: {
    type: String,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit mobile number.'],
  },
  alternateMobile: {
    type: String,
    match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit mobile number.'],
  },
  role: {
    type: String,
    required:true,
    enum: ['user', 'admin'],
    default: 'user',
  },
  googleId: {
    type: String,
  },
  facebookId: {
    type: String,
  }, 
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order', // Reference to the Order model
  }],
  addresses: [AddressSchema],
  
  // This 'cart' field now uses the updated CartItemSchema
  cart: [CartItemSchema],
}, {
  timestamps: true 
});

/**
 * Prevent Mongoose from recompiling the model.
 */
export default mongoose.models.User || mongoose.model('User', UserSchema);
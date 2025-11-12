import mongoose from 'mongoose';

// A sub-schema for items *within* an order
// We store product details like price and name directly
// in case the original product is changed or deleted later.
const OrderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true }, // Price *at time of purchase*
  image: { type: String, required: true }, // Main image *at time of purchase*
  
  // --- NEW: Variant details at time of purchase ---
  color: { type: String, required: true },
  size: { type: String, required: true },
  // --- End of new fields ---

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
});

const ShippingAddressSchema = new mongoose.Schema({
  address: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
});

const OrderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Order must belong to a user.'],
  },
  items: [OrderItemSchema],
  shippingAddress: ShippingAddressSchema,
  totalAmount: {
    type: Number,
    required: [true, 'Please provide a total amount.'],
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
  },
  orderStatus: {
    type: String,
    enum: ['processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing',
  },
}, {
  timestamps: true // Adds createdAt and updatedAt
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { auth } from '@/auth';
import User from '@/models/User';
import Product from '@/models/Product';

// --- HELPER FUNCTION ---
// A reusable function to get the user's cart with product details populated
async function getPopulatedCart(userId) {
  const user = await User.findById(userId)
    .select('cart') // Select only the cart
    .populate({
      path: 'cart.product', // Populate the 'product' field inside the 'cart' array
      model: 'Product',
      select: 'name price images slug variants', // Specify which product fields to return
    });

  if (!user) {
    throw new Error('User not found');
  }
  return user.cart;
}
// --- END HELPER ---


/**
 * GET /api/cart
 * Fetches the current user's shopping cart.
 */
export async function GET(request) {
  await dbConnect();
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const cart = await getPopulatedCart(session.user.id);
    return NextResponse.json(cart, { status: 200 });

  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ message: 'Error fetching cart', error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/cart
 * Adds an item (and its specific variant) to the user's cart.
 */
export async function POST(request) {
  await dbConnect();
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const { productId, quantity, color, size } = await request.json();

    if (!productId || !quantity || !color || !size) {
      return NextResponse.json({ message: 'Missing product details' }, { status: 400 });
    }

    const [user, product] = await Promise.all([
      User.findById(userId),
      Product.findById(productId)
    ]);

    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });

    const variant = product.variants.find(
      (v) => v.color === color && v.size === size
    );

    if (!variant) return NextResponse.json({ message: 'Selected variant not found' }, { status: 404 });
    
    // Find if this *exact* item is already in the cart
    const existingCartItemIndex = user.cart.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.color === color &&
        item.size === size
    );

    let newQuantity;

    if (existingCartItemIndex > -1) {
      // Item exists, update quantity
      const existingItem = user.cart[existingCartItemIndex];
      newQuantity = existingItem.quantity + quantity;
      
      if (variant.stock < newQuantity) {
        return NextResponse.json({ message: `Not enough stock. Only ${variant.stock} total available.` }, { status: 400 });
      }
      existingItem.quantity = newQuantity;

    } else {
      // Item does not exist, add it
      newQuantity = quantity;
      if (variant.stock < newQuantity) {
        return NextResponse.json({ message: `Not enough stock. Only ${variant.stock} left.` }, { status: 400 });
      }
      user.cart.push({ product: productId, quantity, color, size });
    }

    await user.save();
    
    // Return the full, updated, populated cart
    const updatedCart = await getPopulatedCart(userId);
    return NextResponse.json(updatedCart, { status: 200 });

  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ message: 'Error adding to cart', error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/cart
 * Updates the quantity of a specific item in the user's cart.
 */
export async function PUT(request) {
  await dbConnect();
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // We expect the cart item's specific _id and the new quantity
    const { cartItemId, newQuantity } = await request.json();

    if (!cartItemId || newQuantity === undefined) {
      return NextResponse.json({ message: 'Missing cartItemId or newQuantity' }, { status: 400 });
    }

    if (newQuantity <= 0) {
      // Quantity of 0 should be a DELETE request
      return NextResponse.json({ message: 'Quantity must be greater than 0. To remove, use DELETE.' }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    // Find the specific item in the user's cart array by its _id
    const cartItem = user.cart.id(cartItemId);
    if (!cartItem) return NextResponse.json({ message: 'Cart item not found' }, { status: 404 });

    // --- Stock Check ---
    const product = await Product.findById(cartItem.product);
    if (!product) return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    
    const variant = product.variants.find(
      (v) => v.color === cartItem.color && v.size === cartItem.size
    );
    if (!variant) return NextResponse.json({ message: 'Variant not found' }, { status: 404 });

    if (variant.stock < newQuantity) {
      return NextResponse.json({ message: `Not enough stock. Only ${variant.stock} available.` }, { status: 400 });
    }
    // --- End Stock Check ---

    // Update the quantity
    cartItem.quantity = newQuantity;
    await user.save();

    const updatedCart = await getPopulatedCart(userId);
    return NextResponse.json(updatedCart, { status: 200 });

  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json({ message: 'Error updating cart', error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/cart
 * Removes a specific item from the user's cart.
 */
export async function DELETE(request) {
  await dbConnect();
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // We expect the cart item's specific _id to remove it
    const { cartItemId } = await request.json();
    if (!cartItemId) return NextResponse.json({ message: 'Missing cartItemId' }, { status: 400 });

    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });

    // Find the specific item in the user's cart array by its _id
    const cartItem = user.cart.id(cartItemId);
    if (!cartItem) return NextResponse.json({ message: 'Cart item not found' }, { status: 404 });

    // Remove the item from the array (Mongoose sub-document remove)
    cartItem.remove();
    await user.save();

    const updatedCart = await getPopulatedCart(userId);
    return NextResponse.json(updatedCart, { status: 200 });

  } catch (error) {
    console.error('Error deleting from cart:', error);
    return NextResponse.json({ message: 'Error deleting from cart', error: error.message }, { status: 500 });
  }
}
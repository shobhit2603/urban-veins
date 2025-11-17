import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { auth } from '@/auth';
import User from '@/models/User';
import Product from '@/models/Product';
import Coupon from '@/models/Coupon';
import Order from '@/models/Order';
import crypto from 'crypto';

// --- (Helper function calculateOrderAmount... yeh bilkul same rahega) ---
async function calculateOrderAmount(userId, couponCode) {
  const user = await User.findById(userId).populate({
    path: 'cart.product',
    model: 'Product',
    select: 'price variants',
  });

  if (!user) throw new Error('User not found');
  let subtotal = 0;
  let cartItemsForOrder = [];

  for (const item of user.cart) {
    const product = item.product;
    if (!product) {
        continue; 
    }
    const variant = product.variants.find(
      (v) => v.color === item.color && v.size === item.size
    );
    if (!variant) {
      throw new Error(`Product variant (${item.color}, ${item.size}) not found.`);
    }
    if (variant.stock < item.quantity) {
      throw new Error(`Not enough stock for ${product.name} (${item.color}, ${item.size}). Only ${variant.stock} left.`);
    }
    
    const itemPrice = product.price;
    subtotal += itemPrice * item.quantity;

    cartItemsForOrder.push({
      name: product.name,
      quantity: item.quantity,
      price: itemPrice,
      image: product.images[0] || '',
      color: item.color,
      size: item.size,
      product: product._id,
    });
  }

  if (cartItemsForOrder.length === 0) throw new Error("Cart is empty or products are invalid.");

  let total = subtotal;
  let discount = 0;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!coupon) throw new Error('Invalid coupon code.');
    if (coupon.expiresAt < new Date()) throw new Error('Coupon has expired.');
    if (subtotal < coupon.minPurchase) {
      throw new Error(`Must spend at least ₹${coupon.minPurchase} for this coupon.`);
    }

    if (coupon.discountType === 'percentage') {
      discount = (subtotal * coupon.discountValue) / 100;
    } else if (coupon.discountType === 'fixed') {
      discount = coupon.discountValue;
    }
    
    total = subtotal - discount;
    if (total < 0) total = 0;
  }
  
  const amountInPaise = Math.round(total * 100);
  
  return { amountInPaise, cartItemsForOrder, totalAmount: total };
}
// --- (End of Helper Function) ---


/**
 * POST /api/create-phonepe-payment
 */
export async function POST(request) {
  await dbConnect();

  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    const { couponCode, shippingAddress } = await request.json();

    if (!shippingAddress || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode || !shippingAddress.country) {
      return NextResponse.json({ message: 'Shipping address is required.' }, { status: 400 });
    }
    
    const user = await User.findById(userId).select('name email mobile');
    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    let amountInPaise, cartItemsForOrder, totalAmount;
    try {
      const orderData = await calculateOrderAmount(userId, couponCode);
      amountInPaise = orderData.amountInPaise;
      cartItemsForOrder = orderData.cartItemsForOrder;
      totalAmount = orderData.totalAmount;
    } catch (error) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    const newOrder = new Order({
        user: userId,
        items: cartItemsForOrder,
        shippingAddress: shippingAddress,
        totalAmount: totalAmount,
        paymentStatus: 'pending',
        orderStatus: 'processing',
    });
    await newOrder.save();

    // --- FIX: Get Base URL from Environment Variable ---
    // Ab yeh production mein 'https://www.urbanveins.com' aur dev mein 'http://localhost:3000' hoga
    const baseUrl = process.env.BASE_URL;
    // --- END FIX ---

    const merchantTransactionId = newOrder._id.toString();
    const redirectUrl = `${baseUrl}/order-status`; // <-- FIX: Use baseUrl
    const callbackUrl = `${baseUrl}/api/phonepe-callback`; // <-- FIX: Use baseUrl

    const payload = {
      merchantId: process.env.PHONEPE_MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: userId,
      amount: amountInPaise,
      redirectUrl: redirectUrl, // Dynamic
      redirectMode: "REDIRECT",
      callbackUrl: callbackUrl, // Dynamic
      mobileNumber: user.mobile || '9999999999',
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString("base64");

    const apiEndpoint = "/pg/v1/pay";
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX;
    
    const stringToHash = base64Payload + apiEndpoint + saltKey;
    const sha256Hash = crypto.createHash("sha256").update(stringToHash).digest("hex");
    const xVerify = sha256Hash + "###" + saltIndex;

    const response = await fetch(process.env.PHONEPE_PAY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-VERIFY": xVerify,
      },
      body: JSON.stringify({ request: base64Payload }),
    });

    const jsonResponse = await response.json();

    if (!jsonResponse.success) {
      await Order.findByIdAndUpdate(newOrder._id, { paymentStatus: 'failed', orderStatus: 'cancelled' });
      return NextResponse.json(
        { message: jsonResponse.message || "PhonePe API request failed" },
        { status: 500 }
      );
    }

    const redirectUrlToFrontend = jsonResponse.data.instrumentResponse.redirectInfo.url;
    return NextResponse.json({ redirectUrl: redirectUrlToFrontend }, { status: 200 });

  } catch (error) {
    console.error('Error creating PhonePe payment:', error);
    return NextResponse.json(
      { message: 'Internal server error', error: error.message },
      { status: 500 }
    );
  }
}
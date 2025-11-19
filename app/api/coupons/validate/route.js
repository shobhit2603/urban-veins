import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { auth } from '@/auth';
import Coupon from '@/models/Coupon';

/**
 * POST /api/coupons/validate
 * Validates a coupon code against the database.
 * This is a secure endpoint.
 *
 * Request Body:
 * {
 * "couponCode": "SAVE10",
 * "cartTotal": 1500  // The current subtotal of the cart
 * }
 */
export async function POST(request) {
  await dbConnect();

  try {
    // 1. Check if user is authenticated
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // 2. Get coupon code and cart total from body
    const { couponCode, cartTotal } = await request.json();

    if (!couponCode || cartTotal === undefined) {
      return NextResponse.json(
        { message: 'Coupon code and cart total are required.' },
        { status: 400 }
      );
    }

    // 3. Find the coupon (case-insensitive by converting to uppercase)
    const coupon = await Coupon.findOne({ 
      code: couponCode.toUpperCase() 
    });

    if (!coupon) {
      return NextResponse.json(
        { message: 'Invalid coupon code.' }, 
        { status: 404 } // Not Found
      );
    }

    // 4. Check if coupon is expired
    if (coupon.expiresAt < new Date()) {
      return NextResponse.json(
        { message: 'This coupon has expired.' }, 
        { status: 400 } // Bad Request
      );
    }

    // 5. Check minimum purchase amount
    if (cartTotal < coupon.minPurchase) {
      return NextResponse.json(
        { message: `You must spend at least ₹${coupon.minPurchase} to use this coupon.` },
        { status: 400 } // Bad Request
      );
    }

    // 6. Success! Return the coupon details.
    return NextResponse.json({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
    }, { status: 200 });

  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json(
      { message: 'Error validating coupon', error: error.message },
      { status: 500 }
    );
  }
}
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { checkAdmin } from '@/lib/adminAuth';

/**
 * GET /api/coupons
 * Admin-only: Fetch all coupons.
 */
export async function GET(request) {
  await dbConnect();

  try {
    // 1. Security Check
    const { error, status } = await checkAdmin();
    if (error) {
      return NextResponse.json({ message: error }, { status });
    }

    // 2. Fetch coupons (sort by newest)
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    return NextResponse.json(coupons, { status: 200 });

  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { message: 'Error fetching coupons', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/coupons
 * Admin-only: Create a new coupon.
 */
export async function POST(request) {
  await dbConnect();

  try {
    // 1. Security Check
    const { error, status } = await checkAdmin();
    if (error) {
      return NextResponse.json({ message: error }, { status });
    }

    // 2. Get data
    const { code, discountType, discountValue, expiresAt, minPurchase } = await request.json();

    // 3. Validate
    if (!code || !discountType || !discountValue || !expiresAt) {
      return NextResponse.json(
        { message: 'Missing required fields (code, discountType, discountValue, expiresAt).' },
        { status: 400 }
      );
    }

    // 4. Check for duplicates
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return NextResponse.json(
        { message: 'Coupon code already exists.' },
        { status: 400 }
      );
    }

    // 5. Create Coupon
    const newCoupon = new Coupon({
      code,
      discountType,
      discountValue,
      expiresAt: new Date(expiresAt),
      minPurchase: minPurchase || 0,
    });

    await newCoupon.save();

    return NextResponse.json(newCoupon, { status: 201 });

  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json(
      { message: 'Error creating coupon', error: error.message },
      { status: 500 }
    );
  }
}
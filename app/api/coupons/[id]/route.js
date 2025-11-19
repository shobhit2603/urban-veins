import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { checkAdmin } from '@/lib/adminAuth';

/**
 * DELETE /api/coupons/[id]
 * Admin-only: Delete a coupon by its ID.
 */
export async function DELETE(request, { params }) {
  await dbConnect();

  try {
    // 1. Security Check
    const { error, status } = await checkAdmin();
    if (error) {
      return NextResponse.json({ message: error }, { status });
    }

    // 2. Get ID
    const unwrappedParams = await params;
    const { id } = unwrappedParams;

    if (!id) {
        return NextResponse.json({ message: 'Coupon ID is required' }, { status: 400 });
    }

    // 3. Delete
    const deletedCoupon = await Coupon.findByIdAndDelete(id);

    if (!deletedCoupon) {
      return NextResponse.json({ message: 'Coupon not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Coupon deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { message: 'Error deleting coupon', error: error.message },
      { status: 500 }
    );
  }
}
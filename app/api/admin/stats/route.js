import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';
import { checkAdmin } from '@/lib/adminAuth';

/**
 * GET /api/admin/stats
 * Returns summary statistics for the admin dashboard.
 */
export async function GET(request) {
  await dbConnect();

  try {
    // 1. Security Check
    const { error, status } = await checkAdmin();
    if (error) {
      return NextResponse.json({ message: error }, { status });
    }

    // 2. Run aggregations in parallel for performance
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      revenueStats,
      lowStockProducts
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }), // Count customers only
      Product.countDocuments({}),
      Order.countDocuments({}),
      // Calculate Total Revenue (sum of 'totalAmount' for completed orders)
      Order.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } }
      ]),
      // Check for products with any variant having low stock (e.g., < 5)
      Product.countDocuments({ "variants.stock": { $lt: 5 } })
    ]);

    const totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;

    // 3. Return the stats object
    return NextResponse.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      lowStockProducts
    }, { status: 200 });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { message: 'Error fetching stats', error: error.message },
      { status: 500 }
    );
  }
}
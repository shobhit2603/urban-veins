// This is the code for app/api/admin/orders/route.js

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User'; // We need this to populate the user's name
import { checkAdmin } from '@/lib/adminAuth';

/**
 * GET /api/admin/orders
 * Admin-only route to fetch all orders from all users.
 * Orders are sorted from newest to oldest.
 */
export async function GET(request) {
  await dbConnect();

  try {
    // 1. Check for Admin Privileges
    const { error, status } = await checkAdmin();
    if (error) {
      return NextResponse.json({ message: error }, { status });
    }

    // 2. Fetch all orders
    const orders = await Order.find({}) // Find all orders
      .populate({
        path: 'user', // Get the user's details for each order
        model: 'User',
        select: 'name email', // Only select their name and email
      })
      .sort({ createdAt: -1 }); // Sort by newest first

    // 3. Return the list of orders
    return NextResponse.json(orders, { status: 200 });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { message: 'Error fetching orders', error: error.message },
      { status: 500 }
    );
  }
}
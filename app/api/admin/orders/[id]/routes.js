import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { checkAdmin } from '@/lib/adminAuth';

/**
 * PUT /api/admin/orders/[id]
 * Admin-only route to update an order's status.
 */
export async function PUT(request, { params }) {
  await dbConnect();

  try {
    // 1. Check for Admin Privileges
    const { error, status } = await checkAdmin();
    if (error) {
      return NextResponse.json({ message: error }, { status });
    }

    // 2. Get the Order ID from the URL params
    const unwrappedParams = await params;
    const { id } = unwrappedParams;
    
    if (!id) {
        return NextResponse.json({ message: 'Order ID is required' }, { status: 400 });
    }

    // 3. Get the new status from the request body
    const { orderStatus } = await request.json();

    // 4. Validate the new status
    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return NextResponse.json(
        { message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // 5. Find and update the order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { orderStatus: orderStatus },
      { new: true } // Return the updated document
    );

    if (!updatedOrder) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    // 6. Return the updated order
    return NextResponse.json(updatedOrder, { status: 200 });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { message: 'Error updating order', error: error.message },
      { status: 500 }
    );
  }
}
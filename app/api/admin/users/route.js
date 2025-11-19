import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { checkAdmin } from '@/lib/adminAuth';

/**
 * GET /api/admin/users
 * Admin-only route to fetch all registered users.
 */
export async function GET(request) {
  await dbConnect();

  try {
    // 1. Security Check
    const { error, status } = await checkAdmin();
    if (error) {
      return NextResponse.json({ message: error }, { status });
    }

    // 2. Fetch users
    // We explicitly exclude the 'password' field for security
    const users = await User.find({})
      .select('-password') 
      .sort({ createdAt: -1 }); // Sort by newest users first

    return NextResponse.json(users, { status: 200 });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { message: 'Error fetching users', error: error.message },
      { status: 500 }
    );
  }
}
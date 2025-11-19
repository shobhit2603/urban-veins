import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { auth } from '@/auth';
import User from '@/models/User';

/**
 * GET /api/profile
 * Fetch logged-in user's profile details.
 */
export async function GET(request) {
  await dbConnect();

  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const user = await User.findById(session.user.id).select('-password'); // Exclude password
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching profile', error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/profile
 * Update logged-in user's profile details.
 */
export async function PUT(request) {
  await dbConnect();

  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, mobile, alternateMobile, addresses, image } = body;

    // Build update object (only update fields that are provided)
    const updateData = {};
    if (name) updateData.name = name;
    if (mobile) updateData.mobile = mobile;
    if (alternateMobile !== undefined) updateData.alternateMobile = alternateMobile;
    if (image) updateData.image = image; // Expecting a URL string here
    if (addresses) updateData.addresses = addresses; // Expecting an array of address objects

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updateData },
      { new: true, runValidators: true } // Return updated doc & check schema validation
    ).select('-password');

    return NextResponse.json(updatedUser, { status: 200 });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ message: 'Error updating profile', error: error.message }, { status: 500 });
  }
}
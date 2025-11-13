import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

/**
 * @param {Request} request
 * This function handles POST requests to /api/register
 * It is used to create a new user in the database.
*/
export async function POST(request) {
  try {
    // 1. Get the request body
    const { name, email, password } = await request.json();

    // 2. Validate the request body
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Please provide name, email, and password.' },
        { status: 400 }
      );
    }

    // 3. Connect to the database (TESTS OUR dbConnect)
    await dbConnect();

    // 4. Check if the user already exists (TESTS OUR User model)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists.' },
        { status: 400 }
      );
    }

    // 5. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Create the new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // 7. Send a success response
    return NextResponse.json(
      { message: 'User created successfully.', user: newUser },
      { status: 201 } // 201 means "Created"
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'An error occurred during registration.', error: error.message },
      { status: 500 }
    );
  }
}
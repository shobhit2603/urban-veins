import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Category from '@/models/Category';

/**
 * GET /api/categories
 * Fetches all categories from the database.
 * Used for populating category lists, navigation, and filter options.
 */
export async function GET(request) {
  await dbConnect();

  try {
    // Find all categories. We just need the name and slug.
    const categories = await Category.find({}, 'name slug');

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { message: 'Error fetching categories', error: error.message },
      { status: 500 }
    );
  }
}

// We will add a POST route later for the Admin Panel to create categories.
// For now, GET is all we need for the public site.
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Review from '@/models/Review'; // We need this to populate reviews

/**
 * GET /api/products/[slug]
 * Fetches a single product by its slug.
 *
 * Example: /api/products/oversized-black-hoodie
 *
 * This endpoint populates and returns all reviews for the product,
 * including the user who wrote the review.
 */
export async function GET(request, { params }) {
  // The 'params' object contains the dynamic part of the URL
  // e.g., { slug: 'oversized-black-hoodie' }
  const { slug } = params;

  if (!slug) {
    return NextResponse.json(
      { message: 'Product slug is required' },
      { status: 400 }
    );
  }

  await dbConnect();

  try {
    const product = await Product.findOne({ slug: slug })
      .populate('category', 'name slug') // Populate the category details
      .populate({
        // Populate the reviews
        path: 'reviews',
        // Also populate the 'user' field *inside* each review
        populate: {
          path: 'user',
          model: 'User',
          select: 'name', // Only get the user's name
        },
      });

    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error(`Error fetching product ${slug}:`, error);
    return NextResponse.json(
      { message: 'Error fetching product', error: error.message },
      { status: 500 }
    );
  }
}
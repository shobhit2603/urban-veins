import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { auth } from '@/auth';
import Review from '@/models/Review';
import Product from '@/models/Product';
import Order from '@/models/Order'; // Optional: Check if user actually bought the item

/**
 * POST /api/reviews
 * Allows a logged-in user to review a product.
 */
export async function POST(request) {
  await dbConnect();

  try {
    // 1. Auth Check
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = session.user.id;

    // 2. Get Data
    const { productId, rating, comment } = await request.json();

    if (!productId || !rating || !comment) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    // 3. (Optional but Recommended) Verified Purchase Check
    // Check if the user has a "completed" order containing this product
    
    const hasPurchased = await Order.findOne({
      user: userId,
      paymentStatus: 'completed',
      'items.product': productId
    });
    
    if (!hasPurchased) {
       return NextResponse.json({ message: 'You can only review products you have purchased.' }, { status: 403 });
    }

    // 4. Create the Review
    // Note: Our Review model has a unique index on { user: 1, product: 1 }
    // If the user already reviewed this, MongoDB will throw a duplicate key error (code 11000).
    const review = new Review({
      user: userId,
      product: productId,
      rating: Number(rating),
      comment
    });

    await review.save();

    // 5. Update Product Stats (Average Rating & Num Reviews)
    // We calculate this efficiently using MongoDB aggregation
    const stats = await Review.aggregate([
      { $match: { product: review.product } }, // Find all reviews for this product
      {
        $group: {
          _id: '$product',
          numReviews: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        numReviews: stats[0].numReviews,
        averageRating: stats[0].avgRating,
        $push: { reviews: review._id } // Add review ID to the product's review array
      });
    } else {
       // Should not happen right after creating a review, but safe to have
       await Product.findByIdAndUpdate(productId, {
        numReviews: 1,
        averageRating: Number(rating),
        $push: { reviews: review._id }
      });
    }

    return NextResponse.json({ message: 'Review submitted successfully' }, { status: 201 });

  } catch (error) {
    // Check for duplicate review error
    if (error.code === 11000) {
      return NextResponse.json({ message: 'You have already reviewed this product.' }, { status: 400 });
    }
    console.error('Error submitting review:', error);
    return NextResponse.json({ message: 'Error submitting review', error: error.message }, { status: 500 });
  }
}
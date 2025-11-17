// This is the full code for app/api/products/[slug]/route.js
// It now correctly 'awaits' the params object.

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Review from '@/models/Review';
import User from '@/models/User';
import { checkAdmin } from '@/lib/adminAuth';

/**
 * GET /api/products/[slug]
 * Public route to fetch a single product by its slug.
 */
export async function GET(request, { params }) {
  await dbConnect();
  
  try {
    // --- THIS IS THE FIX ---
    // 'params' is a Promise. We must await it to get the object.
    const unwrappedParams = await params;
    const { slug } = unwrappedParams;
    console.log(unwrappedParams);
    
    // --- END FIX ---

    if (!slug) {
      return NextResponse.json(
        { message: 'Product slug is required' },
        { status: 400 }
      );
    }

    const product = await Product.findOne({ slug: slug })
      .populate('category', 'name slug') 
      .populate({
        path: 'reviews',
        model: 'Review',
        populate: {
          path: 'user',
          model: 'User',
          select: 'name image', 
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
    console.error(`Error fetching product:`, error);
    return NextResponse.json(
      { message: 'Error fetching product', error: error.message },
      { status: 500 }
    );
  }
}


/**
 * PUT /api/products/[slug]
 * Admin-only route to update an existing product.
 */
export async function PUT(request, { params }) {
  await dbConnect();

  try {
    // 1. Check for Admin Privileges
    const { error, status } = await checkAdmin();
    if (error) {
      return NextResponse.json({ message: error }, { status });
    }

    // --- THIS IS THE FIX ---
    const unwrappedParams = await params;
    const { slug } = unwrappedParams;
    // --- END FIX ---
    
    const body = await request.json(); 

    if (!slug) {
        return NextResponse.json({ message: 'Slug is required' }, { status: 400 });
    }

    const updatedProduct = await Product.findOneAndUpdate(
      { slug: slug },
      body, 
      { new: true, runValidators: true } 
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProduct, { status: 200 });

  } catch (error) {
    console.error(`Error updating product:`, error);
    return NextResponse.json(
      { message: 'Error updating product', error: error.message },
      { status: 500 }
    );
  }
}


/**
 * DELETE /api/products/[slug]
 * Admin-only route to delete a product.
 */
export async function DELETE(request, { params }) {
  await dbConnect();

  try {
    // 1. Check for Admin Privileges
    const { error, status } = await checkAdmin();
    if (error) {
      return NextResponse.json({ message: error }, { status });
    }

    // --- THIS IS THE FIX ---
    const unwrappedParams = await params;
    const { slug } = unwrappedParams;
    // --- END FIX ---
    
    if (!slug) {
        return NextResponse.json({ message: 'Slug is required' }, { status: 400 });
    }

    const deletedProduct = await Product.findOneAndDelete({ slug: slug });

    if (!deletedProduct) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });

  } catch (error) {
    console.error(`Error deleting product:`, error);
    return NextResponse.json(
      { message: 'Error deleting product', error: error.message },
      { status: 500 }
    );
  }
}
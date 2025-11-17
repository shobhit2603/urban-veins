// This is the full code for app/api/products/route.js
// It now contains the public GET and the admin-only POST

import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import Category from '@/models/Category';
import { checkAdmin } from '@/lib/adminAuth'; // <-- Import our admin helper

/**
 * GET /api/products
 * Public route to fetch, filter, and search products.
 */
export async function GET(request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get('category');
    const searchQuery = searchParams.get('search');

    let filter = {};

    if (categorySlug) {
      const category = await Category.findOne({ slug: categorySlug }).select('_id');
      if (category) {
        filter.category = category._id;
      } else {
        return NextResponse.json([], { status: 200 }); 
      }
    }

    if (searchQuery) {
      filter.$text = { $search: searchQuery };
    }

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .select('-reviews'); 

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { message: 'Error fetching products', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/products
 * Admin-only route to create a new product.
 */
export async function POST(request) {
  await dbConnect();

  try {
    // 1. Check for Admin Privileges
    const { user, error, status } = await checkAdmin();
    if (error) {
      return NextResponse.json({ message: error }, { status });
    }

    // 2. Get product data from the request
    const body = await request.json();
    const { 
      name, 
      slug, 
      description, 
      price, 
      images, 
      category, // This will be the category _id
      variants // This will be the array of {color, size, stock}
    } = body;

    // 3. Basic validation
    if (!name || !slug || !description || !price || !category || !variants) {
      return NextResponse.json(
        { message: 'Missing required product fields.' },
        { status: 400 }
      );
    }
    
    // 4. Check if slug is unique
    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
      return NextResponse.json(
        { message: 'A product with this slug already exists.' },
        { status: 400 }
      );
    }

    // 5. Create new product
    const newProduct = new Product({
      name,
      slug,
      description,
      price,
      images,
      category, // The frontend must send the Category's ObjectId
      variants
    });

    await newProduct.save();

    // 6. Return the newly created product
    return NextResponse.json(newProduct, { status: 201 }); // 201 = Created

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { message: 'Error creating product', error: error.message },
      { status: 500 }
    );
  }
}
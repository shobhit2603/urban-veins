import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { checkAdmin } from '@/lib/adminAuth';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * POST /api/admin/cloudinary-sign
 * Generates a secure signature for frontend uploads.
 * Protected: Only Admins can upload product images.
 */
export async function POST(request) {
  try {
    // 1. Security Check (Only Admins can upload)
    // Note: If you want Users to upload profile pics, you might need a separate
    // endpoint or loosen this check to just `auth()`.
    const { error, status } = await checkAdmin();
    if (error) {
      return NextResponse.json({ message: error }, { status });
    }

    // 2. Get the timestamp (required for signature)
    const timestamp = Math.round((new Date).getTime() / 1000);

    // 3. Generate the signature
    // We sign the timestamp and any other parameters we want to enforce (like folder)
    const signature = cloudinary.utils.api_sign_request({
      timestamp: timestamp,
      folder: 'urban-veins-products', // Optional: Organize images in a folder
    }, process.env.CLOUDINARY_API_SECRET);

    // 4. Return the signature and timestamp
    return NextResponse.json({ timestamp, signature }, { status: 200 });

  } catch (error) {
    console.error('Error generating signature:', error);
    return NextResponse.json(
      { message: 'Error generating signature', error: error.message },
      { status: 500 }
    );
  }
}
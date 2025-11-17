import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';
import crypto from 'crypto';

/**
 * POST /api/phonepe-callback
 * This is the server-to-server webhook that PhonePe calls to notify
 * us of the final payment status.
 */
export async function POST(request) {
  try {
    // 1. Get the payload from the request body
    const body = await request.json();

    // 2. Decode the Base64 payload
    const base64Payload = body.response;
    const decodedPayload = JSON.parse(
      Buffer.from(base64Payload, "base64").toString()
    );

    // 3. Get the X-VERIFY header from the request
    const xVerify = request.headers.get('X-VERIFY');

    // 4. Verify the checksum to ensure the request is from PhonePe
    const saltKey = process.env.PHONEPE_SALT_KEY;
    const saltIndex = process.env.PHONEPE_SALT_INDEX;

    const stringToHash = base64Payload + "/pg/v1/status" + saltKey;
    const sha256Hash = crypto.createHash("sha256").update(stringToHash).digest("hex");
    const calculatedXVerify = sha256Hash + "###" + saltIndex;

    if (xVerify !== calculatedXVerify) {
      console.error("PhonePe Webhook: Checksum verification failed!");
      return NextResponse.json(
        { message: 'Checksum verification failed.' },
        { status: 400 }
      );
    }

    // --- Checksum is valid. Now we check the payment status. ---

    const paymentStatus = decodedPayload.code;
    const merchantTransactionId = decodedPayload.data.merchantTransactionId;
    // 'merchantTransactionId' is the '_id' of our Order
    const orderId = merchantTransactionId; 

    await dbConnect();

    // 5. Find the order in our database
    const order = await Order.findById(orderId);
    if (!order) {
      console.error(`PhonePe Webhook: Order not found with ID ${orderId}`);
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    // Check to prevent reprocessing (idempotency)
    if (order.paymentStatus === 'completed') {
      return NextResponse.json({ message: 'Order already processed.' }, { status: 200 });
    }

    if (paymentStatus === "PAYMENT_SUCCESS") {
      // --- PAYMENT IS SUCCESSFUL ---

      // 6. Update Order Status
      order.paymentStatus = 'completed';
      order.orderStatus = 'processing'; // Or 'placed'
      await order.save();

      // 7. Clear the user's cart
      await User.findByIdAndUpdate(order.user, {
        $set: { cart: [] }
      });

      // 8. Update Product Stock (CRITICAL)
      // We must do this for every item in the order
      try {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            // Find the *specific variant* in the 'variants' array
            // and decrement its stock
            $inc: { "variants.$[elem].stock": -item.quantity }
          }, {
            arrayFilters: [
              { "elem.color": item.color, "elem.size": item.size }
            ]
          });
        }
      } catch (stockError) {
        console.error("Failed to update stock:", stockError);
        // This is a critical error. We should log it for manual review.
        // The order is paid, but stock is not updated.
      }
      
      return NextResponse.json({ message: 'Payment successful, order updated.' }, { status: 200 });

    } else {
      // --- PAYMENT FAILED or was CANCELLED ---
      
      // 9. Update Order Status to 'failed' or 'cancelled'
      order.paymentStatus = 'failed';
      order.orderStatus = 'cancelled';
      await order.save();
      
      return NextResponse.json({ message: 'Payment failed, order cancelled.' }, { status: 200 });
    }

  } catch (error) {
    console.error('Error in PhonePe callback:', error);
    return NextResponse.json(
      { message: 'Error processing callback', error: error.message },
      { status: 500 }
    );
  }
}
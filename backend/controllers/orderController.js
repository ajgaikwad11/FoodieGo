import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import mongoose from "mongoose";

const razorpay = new Razorpay({
  key_id: process.env.RAZOR_TEST_KEY_ID,
  key_secret: process.env.RAZOR_SECRET_KEY,
});

// Placing user order for frontend
const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5173";

  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    // Create a Razorpay order
    const options = {
      amount: req.body.amount * 100, // Amount in paise (e.g., 100 INR = 10000 paise)
      currency: "INR",
      receipt: `receipt_${newOrder._id}`,
      payment_capture: 1, // Auto-capture payment
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZOR_TEST_KEY_ID, // Razorpay key for frontend
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error placing order" });
  }
};

// const verifyPayment = async (req, res) => {
//     const { orderId, paymentId, signature } = req.body;
  
//     // Create the expected signature
//     const body = orderId + "|" + paymentId;
//     const expectedSignature = crypto
//       .createHmac("sha256", process.env.RAZOR_SECRET_KEY)
//       .update(body.toString())
//       .digest("hex");
  
//     // Compare the signatures
//     if (expectedSignature === signature) {

//         if (!mongoose.Types.ObjectId.isValid(orderId)) {
//             return res.status(400).json({ success: false, message: "Invalid Order ID" });
//         }
//       // Payment is legitimate
//       await orderModel.findByIdAndUpdate(orderId, { payment: true });
//       res.json({ success: true, message: "Payment verified successfully" });
//     } else {
//       // Payment is not legitimate
//       res.status(400).json({ success: false, message: "Payment verification failed" });
//     }
//   };

const verifyPayment = async (req,res) => {
    const {orderId,success} = req.body;

    try {
        if(success=="true") {
            await orderModel.findByIdAndUpdate(orderId,{payment:true});
            res.json({success:true,message:"Paid"})
        }
        else{
            await orderModel.findByIdAndDelete(orderId);
            res.json({success:false,message:"Not Paid"})
        }
    } catch (error) {
        console.log(error);
        res.json({success:false,message:"Error"})
    }
}




export { placeOrder, verifyPayment }; // Export both functions
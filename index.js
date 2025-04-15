const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { OrderModel } = require("./server/Order.modal");
const connectDB = require("./server/db.config");

const app = express();
const PORT = 5000;

const razorpay = new Razorpay({
  key_id: "rzp_test_YbBZ9UxIkaF0Pf",
  key_secret: "Y2OeDKjMIcmp75LecepNWW1m",
});
connectDB();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("build"));

// Create Order API
app.post("/payment/checkout", async (req, res) => {
  try {
    const { name, amount } = req.body;
    if (!name || !amount) return res.status(400).json({ error: "Name and amount are required" });

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
    });

    await OrderModel.create({
      name,
      amount,
      order_id: order.id,
    });

    res.status(201).json({ order });
  } catch (error) {
    console.error("Order creation failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Verify Payment API
app.post("/payment/payment-verification", async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment verification data" });
    }

    const generatedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const isValid = generatedSignature === razorpay_signature;

    if (isValid) {
      await OrderModel.updateOne({ order_id: razorpay_order_id }, {
        $set: {
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
        },
      });
      res.status(200).send("Payment successful");
    } else {
      res.redirect("https://your-frontend.vercel.app/failed");
    }
  } catch (error) {
    console.error("Payment verification failed:", error);
    res.status(500).json({ error: "Verification error" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

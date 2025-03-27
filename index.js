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
app.post("/payment/checkout", async (req, res) => {
  try {
    const { name, amount } = req.body;

    if (!name || !amount) {
      return res.status(400).json({ error: "Name and amount are required" });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
    });


    await OrderModel.create({
      order_id: order.id,
      name,
      amount,
    });

    console.log("Order created:", order);
    res.status(201).json({ order });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Something went wrong while creating the order" });
  }
});

app.post("/payment/payment-verification", async (req, res) => {
  try {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing required payment details" });
    }


    const body_data = razorpay_order_id + "|" + razorpay_payment_id;
    const expected_signature = crypto
      .createHmac("sha256", razorpay.key_secret)
      .update(body_data)
      .digest("hex");

    const isValid = expected_signature === razorpay_signature;
    if (isValid) {
      // Update order details in the database
      await OrderModel.updateOne(
        { order_id: razorpay_order_id },
        {
          $set: {
            razorpay_payment_id,
            razorpay_signature,
          },
        }
      );
      res.send("payment sucsess full");
    } else {
      res.redirect("http://localhost:5000/failed");
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Something went wrong during payment verification" });
  }
});
// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

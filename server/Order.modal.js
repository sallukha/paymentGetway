const mongoose = require("mongoose")

const schema = new mongoose.Schema({
    name: {
        type: String
    },

    amount: {
        type: String
    },

    order_id: {
        type: String
    },

    rezorpay_payment_id: {
        type: String,
        default: null
    },
    rezorpay_order_id: {
        type: String,
        default: null
    },
    rezorpay_singature: {
        type: String,
        default: null
    },
}, {
    timestamps: true
})

const OrderModel = mongoose.model("order", schema)
module.exports = {
    OrderModel
}
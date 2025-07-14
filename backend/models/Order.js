const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    item: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        },
        isDeleted: {
            type: Boolean,
            default: false
        },
        deletedAt: {
            type: Date,
            default: null
        }
    }],
    address: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address',
        required: true
    }],
    paymentMode: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Pending'
    },
    total: {
        type: Number,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)
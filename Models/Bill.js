const mongoose = require('mongoose');

const BillItemSchema = new mongoose.Schema({
    description: { type: String, required: true },
    amount: { type: Number, required: true },
}, { _id: false });

const BillSchema = new mongoose.Schema({
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer',
        required: true,
    },
    technicianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Technician',
        required: true,
    },
    items: [BillItemSchema],
    total: {
        type: Number,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['PENDING', 'PAID', 'CANCELLED'],
        default: 'PENDING',
    },
    paymentMethod: {
        type: String,
        enum: ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER'],
        default: 'CASH',
    },
    notes: {
        type: String,
        default: '',
    },
    deletedAt: {
        type: Date,
        default: null,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Bill', BillSchema); 
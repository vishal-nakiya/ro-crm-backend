const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Customer',
            required: true
        },
        technicianId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Technician',
            required: true
        },
        text: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['OPEN', 'CLOSED'],
            default: 'OPEN'
        },
        deletedAt: { type: Date, default: null },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

module.exports = mongoose.model('Complaint', complaintSchema); 
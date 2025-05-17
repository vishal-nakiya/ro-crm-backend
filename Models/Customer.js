const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    address: { type: String, required: true },
    area: { type: String },
    joiningDate: { type: Date, default: Date.now },
    tds: { type: Number },
    roModel: { type: String },
    category: {
        type: String,
        enum: ['AMC', 'NEW', 'PAID'],
        default: 'NEW'
    },
    numberOfServices: { type: Number, default: 0 },
    remark: { type: String },
    status: {
        type: String,
        enum: ['ACTIVE', 'OFFLINE'],
        default: 'ACTIVE'
    },
    technicianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Technician',
        required: true
    },
    services: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Service'
        }
    ],
    // reminders: [ReminderSchema]
}, {
    timestamps: true // adds createdAt and updatedAt
});

module.exports = mongoose.model('Customer', customerSchema);
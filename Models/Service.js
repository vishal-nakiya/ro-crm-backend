// Models/serviceModel.js

const mongoose = require('mongoose');

const PartsSchema = new mongoose.Schema({
    partName: { type: String, required: true },
    quantity: { type: Number, default: 1 },
}, { _id: false });

const ReminderSchema = new mongoose.Schema({
    type: { type: String, enum: ['TEXT', 'AUDIO'], required: true },
    message: { type: String },
    audioUrl: { type: String },
    date: { type: Date, required: true },
    entityType: { type: String, enum: ['CUSTOMER', 'SERVICE'], required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
}, { _id: false });

const ServiceSchema = new mongoose.Schema({
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    serviceNumber: { type: Number, required: true},
    category: { type: String, enum: ['AMC', 'NEW', 'PAID'], required: true},
    status: { type: String, enum: ['PENDING', 'COMPLETED'], default: 'PENDING'},
    scheduledDate: { type: Date, required: true },
    completedDate: { type: Date },
    partsUsed: [PartsSchema],
    technicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Technician' },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task' },
    reminders: [ReminderSchema],
    deletedAt: { type: Date, default: null}
}, {
    timestamps: true
});

module.exports = mongoose.model('Service', ServiceSchema);

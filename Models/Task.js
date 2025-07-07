const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },

    technicianId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Technician',
        required: true,
    },

    services: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
    }],

    sharedWith: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Technician',
        default: null,
    },

    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED'],
        default: 'PENDING',
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', TaskSchema);

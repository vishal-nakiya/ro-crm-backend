const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    mobile_number: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: [/^[0-9]{10,15}$/, 'Please enter a valid mobile number']
    },
    authToken: {
        type: String,
        default: ''
    },
    refreshToken: {
        type: String,
        default: ''
    },
    is_super_admin: {
        type: Boolean,
        default: false
    },
    designation: {
        type: String,
        default: 'Admin'
    },
    signature_image: {
        type: String,
        default: ''
    },
    location_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Location',
        default: null
    },
    is_active: {
        type: Boolean,
        default: true
    },
    last_login: {
        type: Date,
        default: null
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Index for better query performance
adminSchema.index({ username: 1, email: 1, mobile_number: 1 });
adminSchema.index({ authToken: 1, refreshToken: 1 });

module.exports = mongoose.model('Admin', adminSchema);

const mongoose = require('mongoose');

const technicianSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        contactNumber: { type: String, required: true, unique: true },
        address: { type: String, required: true },
        emailAddress: { type: String, required: true, unique: true },
        accountPassword: { type: String, required: true },
        gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'] },
        dateOfBirth: { type: Date },
        countryName: { type: String },
        stateName: { type: String },
        cityName: { type: String },
        postalCode: { type: String },
        countryCode: { type: String },
        companyName: { type: String },
        otp: { type: String },
        authToken: { type: String },
        refreshToken: { type: String },
        firebase_uid: { type: String, unique: true, sparse: true },
        fcmToken: { type: String },
        deletedAt: { type: Date, default: null },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt
    }
);

module.exports = mongoose.model('Technician', technicianSchema);
const express = require('express');
const Router = express.Router();

// Explicitly import all route modules
const loginRoutes = require('./loginRoutes');
const techniciansRoutes = require('./techniciansRoutes');
// const otpRoutes = require('./otpRoutes');
// const notificationRoutes = require('./notificationRoutes');
const customerRoutes = require('./customerRoutes');
const billRoutes = require('./billRoutes');
const serviceRoutes = require('./serviceRoutes');
const taskRoutes = require('./taskRoutes');
const complaintRoutes = require('./complaintRoutes');
const reminderRoutes = require('./reminderRoutes');

// Register all routes with their respective paths
Router.use('/admin', loginRoutes);
Router.use('/auth', techniciansRoutes);
Router.use('/api/customer', customerRoutes);
Router.use('/api/bill', billRoutes);
Router.use('/api/service', serviceRoutes);
Router.use('/api/task', taskRoutes);
Router.use('/api/complaint', complaintRoutes);
Router.use('/api/reminder', reminderRoutes);
// Router.use('/api/otp', otpRoutes);
// Router.use('/api/notification', notificationRoutes);

// Test endpoint for debugging Firebase tokens
Router.post('/test-token', async (req, res) => {
    try {
        const { firebaseToken } = req.body;

        if (!firebaseToken) {
            return res.status(400).json({
                success: false,
                message: 'Firebase token is required'
            });
        }

        // Basic token validation
        const { validateFirebaseToken } = require('../helpers/helperFunc');
        const tokenValidation = validateFirebaseToken(firebaseToken);

        if (!tokenValidation.isValid) {
            return res.status(400).json({
                success: false,
                message: 'Token validation failed',
                issues: tokenValidation.issues
            });
        }

        // Try to verify the token
        const admin = require('../config/firebase');
        const decodedToken = await admin.auth().verifyIdToken(firebaseToken);

        res.status(200).json({
            success: true,
            message: 'Token is valid',
            tokenInfo: {
                uid: decodedToken.uid,
                email: decodedToken.email,
                emailVerified: decodedToken.email_verified,
                tokenLength: firebaseToken.length,
                tokenType: 'Firebase ID Token'
            }
        });

    } catch (error) {
        console.log('Token test error:', error);
        res.status(400).json({
            success: false,
            message: 'Token verification failed',
            error: error.message,
            code: error.code
        });
    }
});

module.exports = Router;

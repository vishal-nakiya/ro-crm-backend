const admin = require("../../config/firebase");
const Technician = require("../../Models/Technician");
const { sendErrorResponse, validateFirebaseToken } = require("../../helpers/helperFunc");
const logError = require("../../logger/log");
const moment = require('moment');

const mobileMiddleware = async (req, res, next) => {
    const middlewareStartTime = moment().format("YYYY-MM-DDTHH:mm:ss.SSS");
    const authHeader = req.cookies?.authorization || req.headers?.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return sendErrorResponse(401, res, "Authorization token is missing or malformed.");
    }

    try {
        let authToken = authHeader.split(" ")[1];

        // Validate token format
        const tokenValidation = validateFirebaseToken(authToken);
        if (!tokenValidation.isValid) {
            console.log('Token validation failed:', tokenValidation.issues);
            return sendErrorResponse(401, res, `Invalid token format: ${tokenValidation.issues.join(', ')}`);
        }

        // Debug: Log token information (remove in production)
        console.log('Token received:', {
            tokenLength: authToken.length,
            tokenPrefix: authToken.substring(0, 20) + '...',
            tokenType: 'JWT'
        });

        // Verify Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(authToken);

        // Find technician in database using Firebase UID
        const technicianData = await Technician.findOne({
            firebase_uid: decodedToken.uid,
            deletedAt: null
        });

        if (!technicianData) {
            return sendErrorResponse(401, res, "Technician not found in database");
        }

        // Check if technician is verified (if you have this field)
        // if (technicianData.isVerified != 1) {
        //   return sendErrorResponse(401, res, "Technician not verified yet! Please verify first.");
        // }

        // Add technician data and Firebase user info to request
        req.user = {
            ...technicianData.toObject(),
            firebase_uid: decodedToken.uid,
            email: decodedToken.email,
            phoneNumber: decodedToken.phone_number,
            displayName: decodedToken.name,
            emailVerified: decodedToken.email_verified,
            customClaims: decodedToken.custom_claims || {}
        };

        const middlewareEndTime = moment().format("YYYY-MM-DDTHH:mm:ss.SSS");
        next();
    } catch (error) {
        console.log('Firebase Auth Error:', error);
        logError(error, req);

        let errorMessage = 'Authentication failed';

        if (error.code === 'auth/id-token-expired') {
            errorMessage = 'Token expired';
        } else if (error.code === 'auth/id-token-revoked') {
            errorMessage = 'Token revoked';
        } else if (error.code === 'auth/invalid-id-token') {
            errorMessage = 'Invalid token';
        } else if (error.code === 'auth/user-not-found') {
            errorMessage = 'User not found';
        } else if (error.code === 'auth/argument-error') {
            errorMessage = 'Invalid token format. Please ensure you are sending a valid Firebase ID token. Make sure you are using the ID token from Firebase Auth, not a custom token or access token.';
        }

        sendErrorResponse(401, res, errorMessage);
    }
};

module.exports = mobileMiddleware;
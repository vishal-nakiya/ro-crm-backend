const Service = require('../Models/Service');

const helperObj = {
    generateOTP: function (min, max) {
        // i.e. for ex: 6digit integer, max:(1E5 + 1), min:1E6,
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive, ref.MDN web docs
    },
    sendSuccessResponse: (statusCode, res, message, data, count) => {
        res.status(statusCode).json({
            success: true,
            message,
            data,
            count //if count parameters needed
        });
    },
    sendErrorResponse: (statusCode, res, message) => {
        res.status(statusCode).json({
            success: false,
            message
        });
    },
    handleServerError: (res) => {
        res.status(500).json({
            success: false,
            message: "An unexpected error occurred. Please try again in a moment.",
        });
    },
    generateServices: async (customerId, count, category, technicianId) => {
        const now = new Date();
        const serviceList = [];

        for (let i = 0; i < count; i++) {
            const scheduled = new Date(now);
            scheduled.setMonth(now.getMonth() + i * 3); // every 3 months

            serviceList.push({
                customerId,
                serviceNumber: i + 1,
                category,
                scheduledDate: scheduled,
                technicianId,
            });
        }

        const inserted = await Service.insertMany(serviceList);
        return inserted.map(s => s._id);
    },
    validateFirebaseToken: (token) => {
        const issues = [];

        if (!token) {
            issues.push('Token is missing');
            return { isValid: false, issues };
        }

        // Check if it's a JWT token (3 parts separated by dots)
        const parts = token.split('.');
        if (parts.length !== 3) {
            issues.push('Token is not in JWT format (should have 3 parts separated by dots)');
            return { isValid: false, issues };
        }

        // Check token length (Firebase ID tokens are typically 1000+ characters)
        if (token.length < 100) {
            issues.push('Token seems too short for a Firebase ID token');
        }

        // Check if it starts with typical Firebase token pattern
        if (!token.startsWith('eyJ')) {
            issues.push('Token does not start with expected Firebase ID token pattern');
        }

        return { isValid: issues.length === 0, issues };
    }
}

module.exports = helperObj; 

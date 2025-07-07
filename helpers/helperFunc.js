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
    }
}

module.exports = helperObj; 

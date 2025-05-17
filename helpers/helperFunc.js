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
}

module.exports = helperObj; 

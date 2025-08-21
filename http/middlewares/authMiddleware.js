const jwt = require('jsonwebtoken');
const Admin = require('../../Models/Admin');
// const { logError } = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.cookies['authorization'] || req.headers['authorization'];
    if (authHeader && authHeader.startsWith("Bearer")) {
        try {
            let token = authHeader.split(" ")[1];

            // Explicitly specify the algorithm to avoid "invalid algorithm" error
            const data = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });

            const userDataMain = await Admin.findById(data.user.id);

            if (!userDataMain || userDataMain.authToken != token) {
                return res.status(440).json({
                    message: "Session expired. Please login again.",
                    success: false,
                });
            }

            req.user = userDataMain;
            next();
        } catch (error) {
            console.log('JWT Verification Error:', error);
            // logError(error, req);

            let errorMessage = 'Session expired. Please login again.';
            if (error.name === 'JsonWebTokenError') {
                if (error.message === 'invalid algorithm') {
                    errorMessage = 'Token algorithm not supported';
                } else if (error.message === 'invalid signature') {
                    errorMessage = 'Invalid token signature';
                } else if (error.message === 'jwt malformed') {
                    errorMessage = 'Token format is invalid';
                }
            } else if (error.name === 'TokenExpiredError') {
                errorMessage = 'Token has expired';
            } else if (error.name === 'NotBeforeError') {
                errorMessage = 'Token not active yet';
            }

            res.status(440).json({
                message: errorMessage,
                success: false,
            });
        }
    } else {
        res.status(440).json({
            message: "Session expired. Please login again.",
            success: false,
        });
    }
};

module.exports = authMiddleware;
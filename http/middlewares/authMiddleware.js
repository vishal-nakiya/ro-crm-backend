const jwt = require('jsonwebtoken');
const Admin = require('../../Models/Admin');
// const { logError } = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
    const authHeader = req.cookies['authorization'] || req.headers['authorization'];
    if (authHeader && authHeader.startsWith("Bearer")) {
        try {
            let token = authHeader.split(" ")[1];
            const data = jwt.verify(token, process.env.JWT_SECRET);
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
            console.log(error);
            // logError(error, req);
            res.status(440).json({
                message: "Session expired. Please login again.",
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
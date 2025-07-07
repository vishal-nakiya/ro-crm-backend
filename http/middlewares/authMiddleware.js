const admin = require('../../config/firebase');
const Technician = require('../../Models/Technician');

const authMiddleware = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.firebaseUser = decodedToken;

        // OPTIONAL: Map Firebase UID to technician in your DB
        const technician = await Technician.findOne({ firebaseUID: decodedToken.uid });
        if (!technician) return res.status(401).json({ message: "Technician not found" });

        req.technician = technician; // Now available in controllers
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid Firebase token", error });
    }
};

module.exports = authMiddleware;
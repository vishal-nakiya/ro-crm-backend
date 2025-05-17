const jwt = require("jsonwebtoken");
require("dotenv").config();
const Technician = require("../../Models/Technician");
const { sendErrorResponse } = require("../../helpers/helperFunc");
const logError = require("../../logger/log");
const moment = require('moment');

const mobileMiddleware = async (req, res, next) => {
  const middlewareStartTime = moment().format("YYYY-MM-DDTHH:mm:ss.SSS");
  const authHeader = req.cookies?.authorization || req.headers?.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendErrorResponse(401, res, "Authorization token is missing or malformed.");
  }
  if (authHeader && authHeader.startsWith("Bearer")) {
    try {
      let authToken = authHeader.split(" ")[1];
      const data = jwt.verify(authToken, process.env.JWT_SECRET);
      const TechnicianData = await Technician.findById(data.user.id);

      if (!TechnicianData || TechnicianData.deletedAt != null) return sendErrorResponse(401, res, "User Not found")
      // if (TechnicianData.isVerified != 1) return sendErrorResponse(401, res, "User not verified yet! please, verify first.")
      if (TechnicianData.authToken != authToken) return sendErrorResponse(401, res, "Invalid token")
      
      req.user = TechnicianData.dataValues;
      const middlewareEndTime = moment().format("YYYY-MM-DDTHH:mm:ss.SSS");
      // req.user.middlewareExecTime = moment(middlewareEndTime).diff(moment(middlewareStartTime));
      next();
    } catch (error) {
      console.log(error);
      logError(error, req);
      sendErrorResponse(401, res, error.name)
    }
  } else {
    sendErrorResponse(401, res, "Invalid token")
  };
}

module.exports = mobileMiddleware;
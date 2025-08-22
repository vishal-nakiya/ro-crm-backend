require("dotenv").config();
const logError = require("../../logger/log");
const { validationResult } = require("express-validator");
const { sendSuccessResponse, sendErrorResponse, handleServerError, generateOTP } = require("../../helpers/helperFunc");
const Technician = require("../../Models/Technician"); // ✅ import the correct model
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const admin = require("../../config/firebase");

const techniciansController = () => {
  return {
    techniciansRegister: async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return sendErrorResponse(422, res, errors.errors[0].msg);
        }

        const {
          fullName,
          contactNumber,
          emailAddress,
          accountPassword,
          gender,
          dateOfBirth,
          countryName,
          stateName,
          cityName,
          postalCode,
          countryCode,
          companyName,
          address
        } = req.body;

        // Check if user already exists
        const existingUser = await Technician.findOne({ contactNumber });
        if (existingUser) {
          return sendErrorResponse(409, res, "Technician already registered.");
        }

        const otp = generateOTP(100000, 999999); // 6-digit OTP

        const salt = await bcrypt.genSalt(10);
        // const securedPassword = await bcrypt.hash(accountPassword, salt);
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
          return sendErrorResponse(401, res, "No Firebase token provided");
        }

        // ✅ Step 1: Verify Firebase ID token
        // const decoded = await admin.auth().verifyIdToken(token);
        const technicianData = {
          fullName,
          contactNumber,
          // emailAddress,
          // accountPassword: accountPassword, // you should hash this before saving in production!
          gender,
          dateOfBirth: dateOfBirth || new Date("1970-01-01"),
          countryName,
          stateName,
          cityName,
          postalCode,
          countryCode,
          companyName: companyName?.trim(),
          address,
          otp,
          // firebase_uid: decoded.uid
        };

        const newTechnician = await Technician.create(technicianData);

        // Send OTP via SMS
        const smsContent = `Use OTP: ${otp} to verify your mobile number.`;
        // sendSMS(contactNumber, smsContent, "OTP VERIFICATION");

        sendSuccessResponse(
          200,
          res,
          "OTP has been sent to the provided mobile number and email.",
          newTechnician
        );
      } catch (error) {
        if (error.code === 11000) {
          const duplicateField = Object.keys(error.keyValue)[0];
          const userFriendlyField =
            duplicateField === "emailAddress"
              ? "Email address"
              : duplicateField === "contactNumber"
                ? "Mobile number"
                : "Field";
          return sendErrorResponse(409, res, `${userFriendlyField} is already registered. Please use a different one.`);
        }
        console.error(error);
        logError(error, req);
        return handleServerError(res);
      }
    },
    techniciansLogin: async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return sendErrorResponse(422, res, errors.errors[0].msg);
        }

        const { contactNumber } = req.body;

        const technician = await Technician.findOne({
          contactNumber,
          deletedAt: null
        });

        if (!technician) {
          return sendErrorResponse(401, res, "You have not registered with the mobile!!", {
            is_user_registered: false,
          });
        }

        // If passwords are hashed, use bcrypt.compare instead
        // const comparePassword = await bcrypt.compare(accountPassword, technician.accountPassword); // it will return true or false
        // if (!comparePassword) {
        //   return sendErrorResponse(401, res, "Please enter valid password");
        // }

        const data = { user: { id: technician._id } };

        const authToken = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '365d', algorithm: 'HS256' });
        const refreshToken = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '365d', algorithm: 'HS256' });

        // Save tokens to the technician document (optional)
        technician.authToken = authToken;
        technician.refreshToken = refreshToken;
        await technician.save();

        res.cookie("authorization", `Bearer ${authToken}`).status(200).json({
          success: true,
          message: `Welcome ${technician.fullName}`,
          data: {
            is_user_registered: true,
            authToken,
            refreshToken,
            id: technician._id,
            fullName: technician.fullName,
            contactNumber: technician.contactNumber
          }
        });

      } catch (error) {
        console.error(error);
        logError(error, req);
        return handleServerError(res);
      }
    },
    techniciansCheck: async (req, res) => {
      try {
    // const token = req.headers.authorization?.split(' ')[1];
    // if (!token) {
    //   return sendErrorResponse(401, res, "No Firebase token provided");
    // }

        // // ✅ Step 1: Verify Firebase ID token
        // const decoded = await admin.auth().verifyIdToken(token);
        // const phone = decoded.phone_number;

        if (!req.body.contactNumber) {
          return sendErrorResponse(400, res, 'Phone number missing');
        }

        // ✅ Step 2: Lookup technician only (no auto-create)
        const technician = await Technician.findOne({ contactNumber: req.body.contactNumber, deletedAt: null });

        if (!technician) {
          return sendErrorResponse(404, res, 'Technician not registered. Contact admin.', {
            is_user_registered: false,
          });
        }

        const data = { user: { id: technician._id } };

        const authToken = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '2h', algorithm: 'HS256' });
        const refreshToken = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '8h', algorithm: 'HS256' });

        // Save tokens to the technician document (optional)
        technician.authToken = authToken;
        technician.refreshToken = refreshToken;
        await technician.save();

        res.cookie("authorization", `Bearer ${authToken}`).status(200).json({
          success: true,
          message: `Welcome ${technician.fullName}`,
          data: {
            is_user_registered: true,
            authToken,
            refreshToken,
            id: technician._id,
            fullName: technician.fullName,
            contactNumber: technician.contactNumber
          }
        });

      } catch (error) {
        console.error('Firebase login error:', error);
        return sendErrorResponse(500, res, 'Login failed', error);
      }
    },
    techniciansRefreshToken: async (req, res) => {
      try {
        // Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return sendErrorResponse(422, res, "Invalid input. Please check your details and try again.");
        }

        const { refreshToken } = req.body;

        // Find user by refresh token
        const technician = await Technician.findOne({
          refreshToken,
          deletedAt: null,
        }).select("_id");

        if (!technician) {
          return sendErrorResponse(401, res, "Invalid or expired refresh token.");
        }

        // Verify the refresh token
        jwt.verify(refreshToken, process.env.JWT_SECRET, { algorithms: ['HS256'] });

        // Generate a new access token
        const payload = { technician: { id: technician._id } };
        const authToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "24h", algorithm: 'HS256' });

        // Update the user's auth token in the database
        technician.authToken = authToken;
        await technician.save();

        // Send the new access token in the response
        res.cookie("authorization", `Bearer ${authToken}`).status(200).json({
          success: true,
          authToken,
        });
      } catch (error) {
        console.log(error);
        logError(error, req);
        return handleServerError(res);
      }
    },
    techniciansLogout: async (req, res) => {
      try {
        // Check if the user is authenticated
        if (!req.user) {
          return sendErrorResponse(401, res, "Please log in first.");
        }

        // Find the technician by ID
        const technician = await Technician.findById(req.user.id);

        if (!technician) {
          return sendErrorResponse(404, res, "Technician not found.!!");
        }

        // Clear the authToken and refreshToken
        technician.authToken = "";
        technician.refreshToken = "";
        await technician.save();

        // Clear the authorization cookie
        res.clearCookie("authorization").status(200).json({
          success: true,
          message: "Logged out successfully.",
        });
      } catch (error) {
        console.log(error);
        logError(error, req);
        return handleServerError(res);
      }
    },
    techniciansForgotPassword: async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return sendErrorResponse(422, res, errors.errors[0].msg);
        }

        const { contactNumber } = req.body;

        // Check if the technician exists
        const technician = await Technician.findOne({ contactNumber });
        if (!technician) {
          return sendErrorResponse(404, res, "Technician not found.");
        }

        // Generate OTP and send it via SMS
        const otp = generateOTP(100000, 999999); // 6-digit OTP
        const smsContent = `Use OTP: ${otp} to reset your password.`;
        // sendSMS(contactNumber, smsContent, "PASSWORD RESET");

        // Update the technician's OTP in the database
        technician.otp = otp;
        await technician.save();

        sendSuccessResponse(200, res, "OTP has been sent to your registered mobile number.");
      } catch (error) {
        console.error(error);
        logError(error, req);
        return handleServerError(res);
      }
    },
    techniciansResetPassword: async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return sendErrorResponse(422, res, errors.errors[0].msg);
        }

        const { contactNumber, otp, newPassword } = req.body;

        // Check if the technician exists
        const technician = await Technician.findOne({ contactNumber });
        if (!technician) {
          return sendErrorResponse(404, res, "Technician not found.");
        }

        // Check if the OTP is valid
        if (technician.otp !== otp) {
          return sendErrorResponse(400, res, "Invalid OTP.");
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the technician's password in the database
        technician.password = hashedPassword;
        await technician.save();

        sendSuccessResponse(200, res, "Password has been reset successfully.");
      } catch (error) {
        console.error(error);
        logError(error, req);
        return handleServerError(res);
      }
    },
    techniciansVerifyOTP: async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return sendErrorResponse(422, res, errors.errors[0].msg);
        }

        const { contactNumber, otp } = req.body;

        // Check if the technician exists
        const technician = await Technician.findOne({ contactNumber });
        if (!technician) {
          return sendErrorResponse(404, res, "Technician not found.");
        }

        // Check if the OTP is valid
        if (technician.otp !== otp) {
          return sendErrorResponse(400, res, "Invalid OTP.");
        }

        // Mark the technician as verified
        technician.isVerified = true;
        await technician.save();

        sendSuccessResponse(200, res, "Mobile number has been verified successfully.");
      } catch (error) {
        console.error(error);
        logError(error, req);
        return handleServerError(res);
      }
    },
    techniciansList: async (req, res) => {
      try {
        const {
          page = 1,
          limit = 10,
          search = "",
          sortBy = "createdAt",
          sortOrder = "desc",
          gender,
          countryName,
          stateName,
          cityName
        } = req.query;

        // Convert page and limit to numbers
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const skip = (pageNum - 1) * limitNum;

        // Build search query
        let searchQuery = { deletedAt: null };

        if (search) {
          searchQuery.$or = [
            { fullName: { $regex: search, $options: 'i' } },
            { contactNumber: { $regex: search, $options: 'i' } },
            { emailAddress: { $regex: search, $options: 'i' } },
            { companyName: { $regex: search, $options: 'i' } },
            { address: { $regex: search, $options: 'i' } },
            { countryName: { $regex: search, $options: 'i' } },
            { stateName: { $regex: search, $options: 'i' } },
            { cityName: { $regex: search, $options: 'i' } }
          ];
        }

        // Add filter conditions
        if (gender) {
          searchQuery.gender = gender;
        }
        if (countryName) {
          searchQuery.countryName = { $regex: countryName, $options: 'i' };
        }
        if (stateName) {
          searchQuery.stateName = { $regex: stateName, $options: 'i' };
        }
        if (cityName) {
          searchQuery.cityName = { $regex: cityName, $options: 'i' };
        }

        // Build sort object
        const sortObject = {};
        sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute query with pagination
        const technicians = await Technician.find(searchQuery)
          .select('-accountPassword -otp -authToken -refreshToken -firebase_uid -fcmToken')
          .sort(sortObject)
          .skip(skip)
          .limit(limitNum);

        // Get total count for pagination
        const totalTechnicians = await Technician.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalTechnicians / limitNum);

        // Build pagination info
        const paginationInfo = {
          currentPage: pageNum,
          totalPages,
          totalItems: totalTechnicians,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        };

        sendSuccessResponse(200, res, "Technicians fetched successfully.", {
          technicians,
          pagination: paginationInfo
        });
      } catch (error) {
        console.error(error);
        logError(error, req);
        return handleServerError(res);
      }
    },
  };
};

module.exports = techniciansController;

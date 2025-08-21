require('dotenv').config()
const Admin = require("../../Models/Admin");
const logError = require("../../logger/log");
const { validationResult } = require('express-validator')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
// const logMiddleware = require("../middlewares/logMiddleware");
// const globalVariable = require("../../config/globalVariable");

const loginController = () => {
  return {
    adminRegister: async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          const error = errors.array().map((x) => {
            return {
              field: x.param,
              message: x.msg,
            };
          });
          return res.status(400).json({
            error,
            success: false
          });
        }

        const { username, email, password, mobile_number, designation } = req.body;

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({
          $or: [
            { username },
            { email },
            { mobile_number }
          ]
        });

        if (existingAdmin) {
          return res.status(400).json({
            success: false,
            message: "Admin with this username, email, or mobile number already exists.",
          });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new admin
        const adminData = {
          username,
          email,
          password: hashedPassword,
          mobile_number,
          designation: designation || 'Admin'
        };

        const newAdmin = await Admin.create(adminData);

        res.status(201).json({
          success: true,
          message: "Admin registered successfully",
          data: {
            id: newAdmin._id,
            username: newAdmin.username,
            email: newAdmin.email,
            mobile_number: newAdmin.mobile_number,
            designation: newAdmin.designation
          }
        });

      } catch (error) {
        logError(error, req);
        console.log(error);
        res.status(500).json({
          message: "An unexpected error occurred. Please try again later.",
          success: false
        });
      }
    },
    userLogin: async (req, res) => {
      try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          const error = errors.array().map((x) => {
            return {
              field: x.param,
              message: x.msg,
            };
          });
          return res.status(400).json({
            error,
            success: false
          });
        }
        const { email, password } = req.body;

        // Find admin by username or email
        let user = await Admin.findOne({
          $or: [
            { email },
          ],
          deletedAt: null
        });

        if (!user) {
          return res.status(400).json({
            success: false,
            message: "You have not registered with the username. Please contact your administrator.",
          });
        }

        const comparePassword = await bcrypt.compare(password, user.password);
        if (!comparePassword) {
          return res.status(400).json({
            success: false,
            message: "Please enter valid password",
          });
        }

        const data = {
          user: {
            id: user._id,
          },
        };

        // Update last login
        user.last_login = new Date();

        const authToken = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '24h', algorithm: 'HS256' });
        const refreshToken = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '365d', algorithm: 'HS256' });

        // add user token
        user.authToken = authToken;
        user.refreshToken = refreshToken;
        await user.save();

        res.cookie("authorization", `Bearer ${authToken}`).status(200).json({
          success: true,
          authToken,
          refreshToken,
          id: user._id,
          location: user.location_id,
          is_super_admin: user.is_super_admin,
          admin_signature: user.signature_image,
          designation: user.designation,
        });

      } catch (error) {
        logError(error, req);
        console.log(error);
        res.status(500).json({
          message: "An unexpected error occurred. Please try again later.",
          success: false
        });
      }
    },
    getAccessToken: async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ message: errors['errors'][0]['msg'], success: false });
        }
        const { refresh_token } = req.body;
        let user = await Admin.findOne({ refreshToken: refresh_token, deletedAt: null }).select('_id');
        if (!user) return res.status(400).json({ message: "Failed to get token", success: false });

        const data = {
          user: {
            id: user._id,
          },
        };
        jwt.verify(refresh_token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
        const authToken = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '24h', algorithm: 'HS256' });
        // add user token

        await Admin.findByIdAndUpdate(user._id, { authToken: authToken });
        res.cookie("authorization", `Bearer ${authToken}`).status(200).json({
          success: true,
          authToken
        });
      } catch (error) {
        logError(error, req);
        res.status(500).json({
          message: "An unexpected error occurred. Please try again later.",
          success: false
        });
      }
    },
    userLogout: async (req, res) => {
      try {
        if (!req.user) {
          res.status(400).json({
            message: "Please Do Login First",
            success: false
          });
        }
        // add user token
        await Admin.findByIdAndUpdate(req.user.id, {
          authToken: ''
        });
        res.clearCookie("authorization").status(200).json({
          success: true,
          message: 'Logout  Successfully'
        });

        // Getting Client ip
        // let getClientIp = helperFunc.getClientIp(req)
        // const logData = await logMiddleware(
        //   {
        //     action_id: globalVariable.globalAdminActions.Logout,
        //     admin_id: req.user.id,
        //     user_type: globalVariable.globalUsersType.Admin,
        //     actionvalue: "",
        //     remark: "User logout, name: " + req.user.username,
        //     ip: getClientIp,
        //     other_info: null,
        //     action_module: globalVariable.globalAdminActionModules[1],
        //     note_1: req.user.username + " logout in as an admin",
        //     note_2: "Login"
        //   }
        // );

      } catch (error) {
        logError(error, req);
        console.log(error);
        res.status(500).json({
          message: "An unexpected error occurred. Please try again later.",
          success: false
        });
      }
    },
  }
}
module.exports = loginController
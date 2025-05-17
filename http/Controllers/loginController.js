require('dotenv').config()
const Technician = require("../../Models/Technician");
const logError = require("../../logger/log");
const { validationResult } = require('express-validator')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
// const logMiddleware = require("../middlewares/logMiddleware");
// const globalVariable = require("../../config/globalVariable");

const loginController = () => {
  return {
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
        const { contactNumber, password } = req.body;
        let user = await Technician.findOne({ where: { contactNumber } });
        if (!user) {
          return res.status(400).json({
            success: false,
            message: "You have not registered with the username. Please contact your administrator.",
          });
        }
        const comparePassword = await bcrypt.compare(password, user.dataValues.password); // it will return true or false
        if (!comparePassword) {
          return res.status(400).json({
            success: false,
            message: "Please enter valid password",
          });
        }
        const data = {
          user: {
            id: user.id,
          },
        };
        // Getting Client ip
        let getClientIp = helperFunc.getClientIp(req)
        // Creating Logdata
        const logData = await logMiddleware(
          {
            action_id: globalVariable.globalAdminActions.Login,
            admin_id: user.dataValues.id,
            user_type: globalVariable.globalUsersType.Admin,
            actionvalue: "",
            remark: "User Logged in, name: " + user.dataValues.username,
            ip: getClientIp,
            other_info: null,
            action_module: globalVariable.globalAdminActionModules[1],
            note_1: user.dataValues.username + " logged in as an admin",
            note_2: "Login"
          }
        );

        const authToken = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '24h' });
        const refreshToken = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '365d' });
        // add user token
        await Admin.update({ auth_token: authToken, refresh_token: refreshToken }, { where: { username } });
        res.cookie("authorization", `Bearer ${authToken}`).status(200).json({
          success: true,
          authToken,
          refreshToken,
          id: user.id,
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
        let user = await Admin.findOne({ where: { refresh_token, deleted_at: null }, attributes: ['id'], raw: true });
        if (!user) return res.status(400).json({ message: "Failed to get token", success: false });

        const data = {
          user: {
            id: user.id,
          },
        };
        jwt.verify(refresh_token, process.env.JWT_SECRET);
        const authToken = jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '24h' });
        // add user token

        await Admin.update({ auth_token: authToken }, { where: { refresh_token } });
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
        await Admin.update({
          auth_token: ''
        }, {
          where: {
            id: req.user.id
          }
        });
        res.clearCookie("authorization").status(200).json({
          success: true,
          message: 'Logout  Successfully'
        });

        // Getting Client ip
        let getClientIp = helperFunc.getClientIp(req)
        const logData = await logMiddleware(
          {
            action_id: globalVariable.globalAdminActions.Logout,
            admin_id: req.user.id,
            user_type: globalVariable.globalUsersType.Admin,
            actionvalue: "",
            remark: "User logout, name: " + req.user.username,
            ip: getClientIp,
            other_info: null,
            action_module: globalVariable.globalAdminActionModules[1],
            note_1: req.user.username + " logout in as an admin",
            note_2: "Login"
          }
        );

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
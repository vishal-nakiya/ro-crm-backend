require("dotenv").config();
const logError = require("../../logger/log");
const { validationResult } = require("express-validator");
const { sendSuccessResponse, sendErrorResponse, handleServerError, generateOTP } = require("../../helpers/helperFunc");
const Technician = require("../../Models/Technician"); // ✅ import the correct model
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const customersController = () => {
  return {
    createCustomer: async (req, res) => {
      try {
        const {
          fullName,
          contactNumber,
          address,
          area,
          joiningDate,
          tds,
          roModel,
          category,
          numberOfServices,
          remark,
          technicianId
        } = req.body;

        const newCustomer = new Customer({
          fullName,
          contactNumber,
          address,
          area,
          joiningDate,
          tds,
          roModel,
          category,
          numberOfServices,
          remark,
          technicianId
        });

        await newCustomer.save();

        // Auto-generate service entries
        let services = [];
        for (let i = 1; i <= numberOfServices; i++) {
          const service = new Service({
            customerId: newCustomer._id,
            serviceNumber: i,
            category,
            technicianId
          });
          await service.save();
          services.push(service._id);
        }

        // Save service references in customer
        newCustomer.services = services;
        await newCustomer.save();

        sendSuccessResponse(201, res, 'Customer created', newCustomer, 1); // Send success response     ({ success: true, message: 'Customer created', data: newCustomer });
      } catch (error) {
        console.log(error);
        logError(error, req);
        handleServerError(res, error);
      }
    },

    // Get customers by status
    getCustomers: async (req, res) => {
      try {
        const status = req.query.status;
        const customers = await Customer.find(status ? { status } : {})
          .populate('services')
          .sort({ createdAt: -1 });
        res.json({ success: true, data: customers });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
      }
    },

    // Update a customer
    updateCustomer: async (req, res) => {
      try {
        const { id } = req.params;
        const updated = await Customer.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) return res.status(404).json({ message: 'Customer not found' });
        res.json({ success: true, data: updated });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
      }
    },

    // Change status
    updateCustomerStatus: async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;
        const updated = await Customer.findByIdAndUpdate(id, { status }, { new: true });
        res.json({ success: true, data: updated });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
      }
    },

    // Delete customer (soft or permanent)
    deleteCustomer: async (req, res) => {
      try {
        const { id } = req.params;
        const deleted = await Customer.findByIdAndDelete(id);
        res.json({ success: true, message: 'Customer deleted' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
      }
    },

    // Get a single customer by ID
    getCustomerById: async (req, res) => {
      try {
        const { id } = req.params;
        const customer = await Customer.findById(id).populate('services');
        if (!customer) return res.status(404).json({ message: 'Customer not found' });
        res.json({ success: true, data: customer });
      } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
      }
    }
  };
};

module.exports = customersController;


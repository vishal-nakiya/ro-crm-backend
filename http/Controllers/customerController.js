require("dotenv").config();
const logError = require("../../logger/log");
const { validationResult } = require("express-validator");
const { sendSuccessResponse, sendErrorResponse, handleServerError, generateServices } = require("../../helpers/helperFunc");
const Customer = require("../../Models/Customer"); // ✅ import the correct model

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
          status
        } = req.body;

        const technicianId = req.user._id;

        // Validate status field
        const validStatuses = ['ACTIVE', 'OFFLINE'];
        if (!status) {
          return sendErrorResponse(400, res, "Status is required");
        }
        if (!validStatuses.includes(status)) {
          return sendErrorResponse(400, res, "Invalid status. Must be one of: " + validStatuses.join(', '));
        }

        const customer = await Customer.create({
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
          status,
          technicianId
        });

        const serviceIds = await generateServices(customer._id, numberOfServices, category, technicianId, joiningDate);

        customer.services = serviceIds;
        await customer.save();

        sendSuccessResponse(201, res, 'Customer created', customer); // Send success response     ({ success: true, message: 'Customer created', data: newCustomer });
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
        const search = req.query.search;
        const startDate = req.query.startDate;
        const endDate = req.query.endDate;

        // Build query object
        let query = {};

        // Add status filtering only if status is provided
        if (status) {
          const validStatuses = ['ACTIVE', 'OFFLINE'];
          if (!validStatuses.includes(status)) {
            return sendErrorResponse(400, res, "Invalid status. Must be one of: " + validStatuses.join(', '));
          }
          query.status = status;
        }

        // Add search functionality
        if (search && search.trim() !== '') {
          query.$or = [
            { fullName: { $regex: search, $options: 'i' } },
            { contactNumber: { $regex: search, $options: 'i' } },
            { address: { $regex: search, $options: 'i' } }
          ];
        }

        // Add date filtering
        if (startDate || endDate) {
          query.joiningDate = {};

          if (startDate) {
            query.joiningDate.$gte = new Date(startDate);
          }

          if (endDate) {
            query.joiningDate.$lte = new Date(endDate);
          }
        }

        const customers = await Customer.find(query)
          .populate('services')
          .sort({ createdAt: -1 });
        sendSuccessResponse(200, res, 'Customers fetched successfully', customers, customers.length);
      } catch (error) {
        console.error(error);
        handleServerError(res, error);
      }
    },

    // Update a customer
    updateCustomer: async (req, res) => {
      try {
        const { id } = req.params;

        const updated = await Customer.findByIdAndUpdate(id, req.body, { new: true });
        if (!updated) return sendErrorResponse(404, res, "Customer not found");
        sendSuccessResponse(200, res, "Customer updated successfully", updated);
      } catch (error) {
        console.error(error);
        handleServerError(res, error);
      }
    },

    // Change status
    updateCustomerStatus: async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status field
        const validStatuses = ['ACTIVE', 'OFFLINE'];
        if (!status) {
          return sendErrorResponse(400, res, "Status is required");
        }
        if (!validStatuses.includes(status)) {
          return sendErrorResponse(400, res, "Invalid status. Must be one of: " + validStatuses.join(', '));
        }

        const updated = await Customer.findByIdAndUpdate(id, { status }, { new: true });
        if (!updated) return sendErrorResponse(404, res, "Customer not found");
        sendSuccessResponse(200, res, "Customer status updated successfully", updated);
      } catch (error) {
        console.error(error);
        handleServerError(res, error);
      }
    },

    // Delete customer (soft or permanent)
    deleteCustomer: async (req, res) => {
      try {
        const { id } = req.params;
        const deleted = await Customer.findByIdAndDelete(id);
        if (!deleted) return sendErrorResponse(404, res, "Customer not found");
        sendSuccessResponse(200, res, "Customer deleted successfully");
      } catch (error) {
        console.error(error);
        handleServerError(res, error);
      }
    },

    // Get a single customer by ID
    getCustomerById: async (req, res) => {
      try {
        const { id } = req.params;
        const customer = await Customer.findById(id).populate('services').populate('technicianId');
        if (!customer) return sendErrorResponse(404, res, "Customer not found");

        // Convert to plain object and rename the field
        const customerObj = customer.toObject();
        if (customerObj.technicianId) {
          customerObj.technician = customerObj.technicianId;
          delete customerObj.technicianId;
        }

        sendSuccessResponse(200, res, "Customer fetched successfully", customerObj);
      } catch (error) {
        console.error(error);
        handleServerError(res, error);
      }
    }
  };
};

module.exports = customersController;


require("dotenv").config();
const logError = require("../../logger/log");
const { validationResult } = require("express-validator");
const { sendSuccessResponse, sendErrorResponse, handleServerError } = require("../../helpers/helperFunc");
const Customer = require("../../Models/Customer");
const Service = require("../../Models/Service");

const reminderController = () => {
    return {
        // Get reminders for a specific entity (customer or service)
        getReminders: async (req, res) => {
            try {
                const { entityType, entityId } = req.params;
                const technicianId = req.user._id;

                let result = [];

                if (entityType === 'CUSTOMER') {
                    const customer = await Customer.findOne({ _id: entityId, technicianId });
                    if (!customer) {
                        return sendErrorResponse(404, res, "Customer not found");
                    }
                    result = customer.reminders || [];
                } else {
                    const service = await Service.findOne({ _id: entityId, technicianId });
                    if (!service) {
                        return sendErrorResponse(404, res, "Service not found");
                    }
                    result = service.reminders || [];
                }

                sendSuccessResponse(200, res, "Reminders fetched successfully", result, result.length);
            } catch (error) {
                console.error('Fetch Reminders Error:', error);
                logError(error, req);
                handleServerError(res, error);
            }
        },

        // Add reminder to customer
        addCustomerReminder: async (req, res) => {
            try {
                const { customerId, type, message, audioUrl, date } = req.body;
                const technicianId = req.user._id;

                const customer = await Customer.findOne({ _id: customerId, technicianId });
                if (!customer) {
                    return sendErrorResponse(404, res, "Customer not found");
                }

                const reminder = {
                    type,
                    message: type === 'TEXT' ? message : undefined,
                    audioUrl: type === 'AUDIO' ? audioUrl : undefined,
                    date: new Date(date),
                    entityType: 'CUSTOMER',
                    entityId: customerId
                };

                if (!customer.reminders) {
                    customer.reminders = [];
                }

                customer.reminders.push(reminder);
                await customer.save();

                sendSuccessResponse(200, res, "Customer reminder added successfully", customer);
            } catch (error) {
                console.error('Add Customer Reminder Error:', error);
                logError(error, req);
                handleServerError(res, error);
            }
        },

        // Add reminder to service
        addServiceReminder: async (req, res) => {
            try {
                const { serviceId, type, message, audioUrl, date } = req.body;
                const technicianId = req.user._id;

                const service = await Service.findOne({ _id: serviceId, technicianId });
                if (!service) {
                    return sendErrorResponse(404, res, "Service not found");
                }

                const reminder = {
                    type,
                    message: type === 'TEXT' ? message : undefined,
                    audioUrl: type === 'AUDIO' ? audioUrl : undefined,
                    date: new Date(date),
                    entityType: 'SERVICE',
                    entityId: serviceId
                };

                service.reminders.push(reminder);
                await service.save();

                sendSuccessResponse(200, res, "Service reminder added successfully", service);
            } catch (error) {
                console.error('Add Service Reminder Error:', error);
                logError(error, req);
                handleServerError(res, error);
            }
        },

        // Delete reminder from customer
        deleteCustomerReminder: async (req, res) => {
            try {
                const { customerId, reminderIndex } = req.params;
                const technicianId = req.user._id;

                const customer = await Customer.findOne({ _id: customerId, technicianId });
                if (!customer) {
                    return sendErrorResponse(404, res, "Customer not found");
                }

                if (!customer.reminders || !customer.reminders[reminderIndex]) {
                    return sendErrorResponse(404, res, "Reminder not found");
                }

                customer.reminders.splice(reminderIndex, 1);
                await customer.save();

                sendSuccessResponse(200, res, "Customer reminder deleted successfully", customer);
            } catch (error) {
                console.error('Delete Customer Reminder Error:', error);
                logError(error, req);
                handleServerError(res, error);
            }
        },

        // Delete reminder from service
        deleteServiceReminder: async (req, res) => {
            try {
                const { serviceId, reminderIndex } = req.params;
                const technicianId = req.user._id;

                const service = await Service.findOne({ _id: serviceId, technicianId });
                if (!service) {
                    return sendErrorResponse(404, res, "Service not found");
                }

                if (!service.reminders || !service.reminders[reminderIndex]) {
                    return sendErrorResponse(404, res, "Reminder not found");
                }

                service.reminders.splice(reminderIndex, 1);
                await service.save();

                sendSuccessResponse(200, res, "Service reminder deleted successfully", service);
            } catch (error) {
                console.error('Delete Service Reminder Error:', error);
                logError(error, req);
                handleServerError(res, error);
            }
        }
    };
};

module.exports = reminderController; 
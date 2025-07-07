require("dotenv").config();
const logError = require("../../logger/log");
const { validationResult } = require("express-validator");
const { sendSuccessResponse, sendErrorResponse, handleServerError, generateServices } = require("../../helpers/helperFunc");
const Service = require("../../Models/Service");
const moment = require("moment");
const Task = require("../../Models/Task");

const serviceController = () => {
  return {
    getServices: async (req, res) => {
      try {
        const { month = 'current', category } = req.query;
        const technicianId = req.technician?._id || req.user?.id;

        const start = moment().startOf('month');
        const end = moment().endOf('month');

        const query = {
          technicianId,
          status: 'PENDING',
        };

        if (category) {
          query.category = category;
        }

        if (month === 'current') {
          query.scheduledDate = { $gte: start.toDate(), $lte: end.toDate() };
        }

        const services = await Service.find(query).sort({ scheduledDate: 1 });

        sendSuccessResponse(200, res, "Services fetched successfully", services);
      } catch (error) {
        console.log(error);
        logError(error);
        handleServerError(500, res, "Failed to fetch services");
      }
    },
    completeService: async (req, res) => {
      try {
        const serviceId = req.body.serviceId;
        const technicianId = req.technician?._id || req.user?.id;
        const { partsUsed } = req.body;

        if (!serviceId) {
          return sendErrorResponse(400, res, "Service ID is required");
        }

        // Validation
        if (!partsUsed || typeof partsUsed !== 'object') {
          return sendErrorResponse(400, res, "partsUsed object is required");
        }

        // Find service
        const service = await Service.findOne({ _id: serviceId, technicianId });

        if (!service) {
          return sendErrorResponse(404, res, "Service not found");
        }

        if (service.status === 'COMPLETED') {
          return sendErrorResponse(400, res, "Service already completed");
        }

        // Update service
        service.partsUsed = partsUsed;
        service.status = 'COMPLETED';
        service.completedDate = new Date();

        await service.save();

        sendSuccessResponse(200, res, "Service marked as completed", service);
      } catch (error) {
        console.log(error);
        logError(error, req);
        handleServerError(res, error);
      }
    },
    addServiceReminder: async (req, res) => {
      try {
        const serviceId = req.body.serviceId;
        const technicianId = req.technician?._id || req.user?.id;
        const { type, message, audioUrl, date } = req.body;

        if (!serviceId) {
          return sendErrorResponse(400, res, "Service ID is required");
        }

        if (!type || !['TEXT', 'AUDIO'].includes(type)) {
          return sendErrorResponse(400, res, "Invalid or missing type");
        }

        if (!date || isNaN(new Date(date))) {
          return sendErrorResponse(400, res, "Invalid or missing date");
        }

        if (type === 'TEXT' && !message) {
          return sendErrorResponse(400, res, "Text reminder requires message");
        }

        if (type === 'AUDIO' && !audioUrl) {
          return sendErrorResponse(400, res, "Audio reminder requires audioUrl");
        }

        const service = await Service.findOne({ _id: serviceId, technicianId });
        if (!service) {
          return sendErrorResponse(404, res, "Service not found or unauthorized");
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

        sendSuccessResponse(200, res, "Reminder added successfully", service);
      } catch (error) {
        console.log(error);
        logError(error, req);
        handleServerError(res, error);
      }
    },
    createBatchTask: async (req, res) => {
      try {
        const { title, serviceIds } = req.body;
        const technicianId = req.technician?._id || req.user?.id;

        // Basic validation
        if (!title || !Array.isArray(serviceIds) || serviceIds.length === 0) {
          return sendErrorResponse(400, res, "Title and at least one serviceId are required");
        }

        // Fetch & validate services
        const services = await Service.find({
          _id: { $in: serviceIds },
          technicianId,
          taskId: { $exists: false }, // not already assigned
        });

        if (services.length !== serviceIds.length) {
          return sendErrorResponse(400, res, "Some services are invalid, belong to other technician, or already assigned to a task");
        }

        // Create new task
        const task = new Task({
          title,
          technicianId,
          services: serviceIds,
          status: 'PENDING',
        });

        await task.save();

        // Update services with taskId
        await Service.updateMany(
          { _id: { $in: serviceIds } },
          { taskId: task._id }
        );

        sendSuccessResponse(201, res, "Task created and services assigned", task);
      } catch (error) {
        console.log(error);
        logError(error, req);
        handleServerError(res, error);
      }
    }
  }
}
module.exports = serviceController;


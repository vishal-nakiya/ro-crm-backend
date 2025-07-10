require("dotenv").config();
const logError = require("../../logger/log");
const { validationResult } = require("express-validator");
const { sendSuccessResponse, sendErrorResponse, handleServerError } = require("../../helpers/helperFunc");
const Complaint = require("../../Models/Complaint");
const Customer = require("../../Models/Customer");

const complaintController = () => {
    return {
        // Create a new complaint
        createComplaint: async (req, res) => {
            try {
                const { customerId, text } = req.body;
                const technicianId = req.user._id;

                // Validate that customer exists and belongs to the technician
                const customer = await Customer.findOne({ _id: customerId, technicianId });
                if (!customer) {
                    return sendErrorResponse(404, res, "Customer not found or not associated with this technician");
                }

                const complaint = new Complaint({
                    customerId,
                    technicianId,
                    text,
                    status: 'OPEN'
                });

                await complaint.save();
                sendSuccessResponse(201, res, 'Complaint created successfully', complaint);
            } catch (error) {
                console.error('Create Complaint Error:', error);
                logError(error, req);
                handleServerError(res, error);
            }
        },

        // Update complaint status
        updateComplaintStatus: async (req, res) => {
            try {
                const { id } = req.params;
                const { status } = req.body;
                const technicianId = req.user._id;

                const complaint = await Complaint.findOne({ _id: id, technicianId });
                if (!complaint) {
                    return sendErrorResponse(404, res, "Complaint not found");
                }

                complaint.status = status;
                await complaint.save();

                sendSuccessResponse(200, res, "Complaint status updated successfully", complaint);
            } catch (error) {
                console.error('Update Complaint Error:', error);
                logError(error, req);
                handleServerError(res, error);
            }
        },

        // Get all complaints for a technician
        getComplaints: async (req, res) => {
            try {
                const technicianId = req.user._id;

                const complaints = await Complaint.find({ technicianId })
                    .populate('customerId', 'fullName contactNumber address')
                    .sort({ createdAt: -1 });

                sendSuccessResponse(200, res, "Complaints fetched successfully", complaints, complaints.length);
            } catch (error) {
                console.error('Fetch Complaints Error:', error);
                logError(error, req);
                handleServerError(res, error);
            }
        },

        // Get a single complaint by ID
        getComplaintById: async (req, res) => {
            try {
                const { id } = req.params;
                const technicianId = req.user._id;

                const complaint = await Complaint.findOne({ _id: id, technicianId })
                    .populate('customerId', 'fullName contactNumber address');

                if (!complaint) {
                    return sendErrorResponse(404, res, "Complaint not found");
                }

                sendSuccessResponse(200, res, "Complaint fetched successfully", complaint);
            } catch (error) {
                console.error('Get Complaint Error:', error);
                logError(error, req);
                handleServerError(res, error);
            }
        },

        // Delete complaint (soft delete)
        deleteComplaint: async (req, res) => {
            try {
                const { id } = req.params;
                const technicianId = req.user._id;

                const complaint = await Complaint.findOne({ _id: id, technicianId });
                if (!complaint) {
                    return sendErrorResponse(404, res, "Complaint not found");
                }

                complaint.deletedAt = new Date();
                await complaint.save();

                sendSuccessResponse(200, res, "Complaint deleted successfully");
            } catch (error) {
                console.error('Delete Complaint Error:', error);
                logError(error, req);
                handleServerError(res, error);
            }
        },

        // Get complaints by status
        getComplaintsByStatus: async (req, res) => {
            try {
                const { status } = req.query;
                const technicianId = req.user._id;

                const complaints = await Complaint.find({ technicianId, status })
                    .populate('customerId', 'fullName contactNumber address')
                    .sort({ createdAt: -1 });

                sendSuccessResponse(200, res, "Complaints fetched successfully", complaints, complaints.length);
            } catch (error) {
                console.error('Fetch Complaints by Status Error:', error);
                logError(error, req);
                handleServerError(res, error);
            }
        }
    };
};

module.exports = complaintController; 
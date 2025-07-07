require("dotenv").config();
const logError = require("../../logger/log");
const { validationResult } = require("express-validator");
const { sendSuccessResponse, sendErrorResponse, handleServerError } = require("../../helpers/helperFunc");
const Bill = require("../../Models/Bill");
const Customer = require("../../Models/Customer");
const Technician = require("../../Models/Technician");
const PDFDocument = require("pdfkit");

const billController = () => {
    return {
        // Create a new bill
        createBill: async (req, res) => {
            try {
                const errors = validationResult(req);
                if (!errors.isEmpty()) {
                    return sendErrorResponse(422, res, errors.errors[0].msg);
                }

                const { customerId, items, notes, paymentMethod } = req.body;
                const technicianId = req.technician?._id || req.user?.id;

                // Validate customer exists and belongs to technician
                const customer = await Customer.findOne({ _id: customerId, technicianId });
                if (!customer) {
                    return sendErrorResponse(404, res, "Customer not found");
                }

                // Validate items
                if (!Array.isArray(items) || items.length === 0) {
                    return sendErrorResponse(400, res, "At least one item is required");
                }

                // Validate each item
                for (const item of items) {
                    if (!item.description || typeof item.amount !== 'number' || item.amount <= 0) {
                        return sendErrorResponse(400, res, "Each item must have description and positive amount");
                    }
                }

                // Calculate total
                const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);

                // Create bill
                const billData = {
                    customerId,
                    technicianId,
                    items,
                    total,
                    notes: notes || '',
                    paymentMethod: paymentMethod || 'CASH',
                };

                const bill = new Bill(billData);
                await bill.save();

                // Populate customer details
                const populatedBill = await Bill.findById(bill._id)
                    .populate('customerId', 'fullName contactNumber emailAddress address')
                    .populate('technicianId', 'fullName contactNumber');

                sendSuccessResponse(201, res, "Bill created successfully", populatedBill);
            } catch (error) {
                console.log(error);
                logError(error, req);
                handleServerError(500, res, "Failed to create bill");
            }
        },

        // Get bills for a customer
        getBillsByCustomer: async (req, res) => {
            try {
                const { id } = req.params;
                const technicianId = req.technician?._id || req.user?.id;
                if (!id) {
                    return sendErrorResponse(400, res, "Customer ID is required");
                }

                // Validate customer exists and belongs to technician
                const customer = await Customer.findOne({ _id: id, technicianId });
                if (!customer) {
                    return sendErrorResponse(404, res, "Customer not found");
                }

                const bills = await Bill.find({
                    customerId: id,
                    technicianId,
                    deletedAt: null
                })
                    .populate('customerId', 'fullName contactNumber emailAddress')
                    .populate('technicianId', 'fullName contactNumber')
                    .sort({ createdAt: -1 });

                sendSuccessResponse(200, res, "Bills fetched successfully", bills);
            } catch (error) {
                console.log(error);
                logError(error, req);
                handleServerError(500, res, "Failed to fetch bills");
            }
        },

        // Get all bills for technician
        getAllBills: async (req, res) => {
            try {
                const technicianId = req.technician?._id || req.user?.id;
                const { status, customerId, startDate, endDate } = req.query;

                const query = {
                    technicianId,
                    deletedAt: null
                };

                if (status && ['PENDING', 'PAID', 'CANCELLED'].includes(status)) {
                    query.status = status;
                }

                if (customerId) {
                    query.customerId = customerId;
                }

                if (startDate && endDate) {
                    query.date = {
                        $gte: new Date(startDate),
                        $lte: new Date(endDate)
                    };
                }

                const bills = await Bill.find(query)
                    .populate('customerId', 'fullName contactNumber emailAddress')
                    .populate('technicianId', 'fullName contactNumber')
                    .sort({ createdAt: -1 });

                sendSuccessResponse(200, res, "Bills fetched successfully", bills);
            } catch (error) {
                console.log(error);
                logError(error, req);
                handleServerError(500, res, "Failed to fetch bills");
            }
        },

        // Get single bill by ID
        getBillById: async (req, res) => {
            try {
                const { id } = req.params;
                const technicianId = req.technician?._id || req.user?.id;

                const bill = await Bill.findOne({
                    _id: id,
                    technicianId,
                    deletedAt: null
                })
                    .populate('customerId', 'fullName contactNumber emailAddress address')
                    .populate('technicianId', 'fullName contactNumber emailAddress');

                if (!bill) {
                    return sendErrorResponse(404, res, "Bill not found");
                }

                sendSuccessResponse(200, res, "Bill fetched successfully", bill);
            } catch (error) {
                console.log(error);
                logError(error, req);
                handleServerError(500, res, "Failed to fetch bill");
            }
        },

        // Update bill status
        updateBillStatus: async (req, res) => {
            try {
                const { id } = req.params;
                const { status, paymentMethod, notes } = req.body;
                const technicianId = req.technician?._id || req.user?.id;

                const bill = await Bill.findOne({ _id: id, technicianId, deletedAt: null });

                if (!bill) {
                    return sendErrorResponse(404, res, "Bill not found");
                }

                if (status && ['PENDING', 'PAID', 'CANCELLED'].includes(status)) {
                    bill.status = status;
                }

                if (paymentMethod && ['CASH', 'CARD', 'UPI', 'BANK_TRANSFER'].includes(paymentMethod)) {
                    bill.paymentMethod = paymentMethod;
                }

                if (notes !== undefined) {
                    bill.notes = notes;
                }

                await bill.save();

                const updatedBill = await Bill.findById(bill._id)
                    .populate('customerId', 'fullName contactNumber emailAddress address')
                    .populate('technicianId', 'fullName contactNumber emailAddress');

                sendSuccessResponse(200, res, "Bill updated successfully", updatedBill);
            } catch (error) {
                console.log(error);
                logError(error, req);
                handleServerError(500, res, "Failed to update bill");
            }
        },

        // Generate PDF for a bill
        generateBillPDF: async (req, res) => {
            try {
                const { billId } = req.query;
                const technicianId = req.technician?._id || req.user?.id;
                if (!billId) {
                    return sendErrorResponse(400, res, "Bill ID is required");
                }

                const bill = await Bill.findOne({
                    _id: billId,
                    technicianId,
                    deletedAt: null
                })
                    .populate('customerId', 'fullName contactNumber emailAddress address')
                    .populate('technicianId', 'fullName contactNumber emailAddress');

                if (!bill) {
                    return sendErrorResponse(404, res, "Bill not found");
                }

                // Create PDF document
                const doc = new PDFDocument({
                    size: 'A4',
                    margin: 50
                });

                // Set response headers
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `inline; filename=bill-${bill._id}.pdf`);

                // Pipe PDF to response
                doc.pipe(res);

                // Add company header
                doc.fontSize(24)
                    .text('INVOICE', { align: 'center' })
                    .moveDown(0.5);

                // Add bill details
                doc.fontSize(12)
                    .text(`Bill #: ${bill._id}`)
                    .text(`Date: ${bill.date.toLocaleDateString()}`)
                    .text(`Status: ${bill.status}`)
                    .moveDown();

                // Add customer information
                doc.fontSize(14)
                    .text('Customer Information:', { underline: true })
                    .fontSize(12)
                    .text(`Name: ${bill.customerId.fullName}`)
                    .text(`Phone: ${bill.customerId.contactNumber}`)
                    .text(`Email: ${bill.customerId.emailAddress || 'N/A'}`)
                    .text(`Address: ${bill.customerId.address || 'N/A'}`)
                    .moveDown();

                // Add technician information
                doc.fontSize(14)
                    .text('Technician Information:', { underline: true })
                    .fontSize(12)
                    .text(`Name: ${bill.technicianId.fullName}`)
                    .text(`Phone: ${bill.technicianId.contactNumber}`)
                    .text(`Email: ${bill.technicianId.emailAddress || 'N/A'}`)
                    .moveDown();

                // Add items table
                doc.fontSize(14)
                    .text('Items:', { underline: true })
                    .moveDown(0.5);

                // Table header
                doc.fontSize(12)
                    .text('Description', 50, doc.y)
                    .text('Amount (₹)', 400, doc.y)
                    .moveDown();

                // Table separator
                doc.moveTo(50, doc.y)
                    .lineTo(550, doc.y)
                    .stroke()
                    .moveDown(0.5);

                // Add items
                bill.items.forEach((item, index) => {
                    doc.fontSize(12)
                        .text(item.description, 50, doc.y)
                        .text(`₹${item.amount.toFixed(2)}`, 400, doc.y)
                        .moveDown();
                });

                // Total separator
                doc.moveTo(50, doc.y)
                    .lineTo(550, doc.y)
                    .stroke()
                    .moveDown(0.5);

                // Total amount
                doc.fontSize(14)
                    .text('Total:', 350, doc.y)
                    .text(`₹${bill.total.toFixed(2)}`, 400, doc.y, { bold: true })
                    .moveDown();

                // Payment method
                if (bill.paymentMethod) {
                    doc.fontSize(12)
                        .text(`Payment Method: ${bill.paymentMethod}`)
                        .moveDown();
                }

                // Notes
                if (bill.notes) {
                    doc.fontSize(12)
                        .text('Notes:', { underline: true })
                        .fontSize(10)
                        .text(bill.notes)
                        .moveDown();
                }

                // Footer
                doc.fontSize(10)
                    .text('Thank you for your business!', { align: 'center' })
                    .moveDown()
                    .text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });

                // End the document
                doc.end();

            } catch (error) {
                console.log(error);
                logError(error, req);
                handleServerError(500, res, "Failed to generate PDF");
            }
        },

        // Delete bill (soft delete)
        deleteBill: async (req, res) => {
            try {
                const { id } = req.params;
                const technicianId = req.technician?._id || req.user?.id;

                const bill = await Bill.findOne({ _id: id, technicianId, deletedAt: null });

                if (!bill) {
                    return sendErrorResponse(404, res, "Bill not found");
                }

                // Soft delete
                bill.deletedAt = new Date();
                await bill.save();

                sendSuccessResponse(200, res, "Bill deleted successfully");
            } catch (error) {
                console.log(error);
                logError(error, req);
                handleServerError(500, res, "Failed to delete bill");
            }
        }
    }
}

module.exports = billController; 
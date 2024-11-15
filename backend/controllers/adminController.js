const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Designer, Template, Admin } = require("../models");
const mongoose = require("mongoose");
const sendEmail = require("../services/emailService");

const SECRET_KEY =
  "f2c36675f1b68a6a823e598d2a47e48eb93d3e24f9cdedb21766d3ff4f6b63770f54713ad0a93c3c7a55a24d2f88d992";

// Admin login
exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign({ id: admin._id, role: "admin" }, SECRET_KEY, {
      expiresIn: "1h",
    });

    res.json({ success: true, token });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Login failed." });
  }
};

// Get overview statistics
exports.getOverview = async (req, res) => {
  try {
    const totalDesigners = await Designer.countDocuments();
    const totalTemplates = await Template.countDocuments();
    const totalSales = await Template.aggregate([
      { $match: { status: "approved" } },
      { $group: { _id: null, totalSales: { $sum: "$sales_count" } } },
    ]);

    const totalRevenue = await Template.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: { $multiply: ["$sales_count", 100] } },
        },
      },
    ]);

    const adminEarnings = totalRevenue[0]?.totalRevenue * 0.3 || 0;
    const designerEarnings = totalRevenue[0]?.totalRevenue * 0.7 || 0;

    res.json({
      totalDesigners,
      totalTemplates,
      totalSales: totalSales[0]?.totalSales || 0,
      totalRevenue: totalRevenue[0]?.totalRevenue || 0,
      adminEarnings,
      designerEarnings,
    });
  } catch (error) {
    console.error("Error fetching overview:", error);
    res.status(500).json({ message: "Failed to fetch overview" });
  }
};

// Fetch all designers
exports.getAllDesigners = async (req, res) => {
  try {
    const designers = await Designer.find();
    // For each designer, count the number of templates they have uploaded
    const designersWithTemplateCount = await Promise.all(
      designers.map(async (designer) => {
        const totalTemplates = await Template.countDocuments({
          designerId: designer._id,
        });
        return {
          ...designer.toObject(),
          totalTemplates,
        };
      })
    );
    res.json(designersWithTemplateCount);
  } catch (error) {
    console.error("Error fetching designers:", error);
    res.status(500).json({ message: "Failed to fetch designers" });
  }
};
// Fetch all templates with optional status filter
exports.getAllTemplates = async (req, res) => {
  try {
    const templates = await Template.find().populate("designerId", "name");
    res.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ message: "Error fetching templates" });
  }
};

// View pending templates
exports.getPendingTemplates = async (req, res) => {
  try {
    const pendingTemplates = await Template.find({ status: "pending" });
    res.json(pendingTemplates);
  } catch (error) {
    console.error("Error fetching pending templates:", error);
    res.status(500).json({ message: "Error fetching pending templates." });
  }
};

// Approve a template
// Get all approved templates
exports.getApprovedTemplates = async (req, res) => {
  try {
    const approvedTemplates = await Template.find({ status: "approved" });
    res.json(approvedTemplates);
  } catch (error) {
    console.error("Error fetching approved templates:", error);
    res.status(500).json({ message: "Error fetching approved templates" });
  }
};

// Approve a template and send an email notification
exports.approveTemplate = async (req, res) => {
  try {
    const template = await Template.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    ).populate("designerId");

    if (!template) {
      return res.status(404).json({ message: "Template not found." });
    }

    // Send approval email
    if (template.designerId?.email) {
      await sendEmail(
        template.designerId.email,
        "Template Approved",
        `Congratulations! Your template "${template.description}" has been approved.`
      );
    }

    res.json({ message: "Template approved successfully", template });
  } catch (error) {
    console.error("Error approving template:", error);
    res.status(500).json({ message: "Error approving template." });
  }
};

// Reject a template and send an email notification
exports.rejectTemplate = async (req, res) => {
  try {
    const template = await Template.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    ).populate("designerId");

    if (!template) {
      return res.status(404).json({ message: "Template not found." });
    }

    // Send rejection email
    if (template.designerId?.email) {
      await sendEmail(
        template.designerId.email,
        "Template Rejected",
        `Unfortunately, your template "${template.description}" has been rejected.`
      );
    }

    res.json({ message: "Template rejected", template });
  } catch (error) {
    console.error("Error rejecting template:", error);
    res.status(500).json({ message: "Error rejecting template." });
  }
};

// Approve a template
// exports.approveTemplate = async (req, res) => {
//   try {
//     const template = await Template.findByIdAndUpdate(
//       req.params.id,
//       { status: "approved" },
//       { new: true }
//     ).populate("designerId");

//     if (!template) {
//       return res.status(404).json({ message: "Template not found." });
//     }

//     // Optionally, send email notification here if needed

//     res.json({ message: "Template approved successfully", template });
//   } catch (error) {
//     console.error("Error approving template:", error);
//     res.status(500).json({ message: "Error approving template." });
//   }
// };

// // Reject a template
// exports.rejectTemplate = async (req, res) => {
//   try {
//     const template = await Template.findByIdAndUpdate(
//       req.params.id,
//       { status: "rejected" },
//       { new: true }
//     ).populate("designerId");

//     if (!template) {
//       return res.status(404).json({ message: "Template not found." });
//     }

//     // Optionally, send email notification here if needed

//     res.json({ message: "Template rejected", template });
//   } catch (error) {
//     console.error("Error rejecting template:", error);
//     res.status(500).json({ message: "Error rejecting template." });
//   }
// };

exports.getSalesChartData = async (req, res) => {
  try {
    // Aggregate sales data by month
    const salesData = await Template.aggregate([
      {
        $match: { status: "approved" },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalSales: { $sum: "$sales_count" },
          totalRevenue: { $sum: { $multiply: ["$sales_count", 100] } },
        },
      },
      { $sort: { _id: 1 } }, // Sort by month
    ]);

    res.json(salesData);
  } catch (error) {
    console.error("Error fetching sales chart data:", error);
    res.status(500).json({ message: "Failed to fetch sales chart data" });
  }
};

exports.getPayments = async (req, res) => {
  try {
    const designers = await Designer.find().select(
      "name payment_method payment_details"
    );
    res.json(designers);
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ message: "Error fetching payments." });
  }
};
exports.getSalesData = async (req, res) => {
  try {
    const salesData = await Template.aggregate([
      {
        $match: { status: "approved" },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalSales: { $sum: "$sales_count" },
          totalRevenue: { $sum: { $multiply: ["$sales_count", 100] } },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    const formattedData = salesData.map((item) => ({
      month: new Date(0, item._id - 1).toLocaleString("default", {
        month: "long",
      }),
      totalSales: item.totalSales,
      totalRevenue: item.totalRevenue,
    }));

    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching sales data:", error);
    res.status(500).json({ message: "Error fetching sales data" });
  }
};

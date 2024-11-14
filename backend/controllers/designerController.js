// controllers/designerController.js
const { Designer } = require("../models");
const { Template } = require("../models");
const mongoose = require("mongoose");
// Get designer profile
exports.getProfile = async (req, res) => {
  try {
    const designer = await Designer.findById(req.user.id).select("-password"); // Exclude password from response
    if (!designer) {
      return res.status(404).json({ message: "Designer not found" });
    }
    res.json({
      name: designer.name,
      email: designer.email,
      phone: designer.phone,
      payment_method: designer.payment_method,
      payment_details: designer.payment_details,
    });
  } catch (error) {
    console.error("Error fetching designer profile:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch profile. Please try again." });
  }
};

// Update payment information
exports.updatePaymentInfo = async (req, res) => {
  const { payment_method, paypal_email, venmo_username, cashapp_username } =
    req.body;

  try {
    const updatedDesigner = await Designer.findByIdAndUpdate(
      req.user.id,
      {
        payment_method,
        payment_details: { paypal_email, venmo_username, cashapp_username },
      },
      { new: true }
    );

    res.json({
      message: "Payment information updated successfully.",
      updatedDesigner,
    });
  } catch (error) {
    console.error("Error updating payment information:", error);
    res.status(500).json({ message: "Error updating payment information." });
  }
};

// Get statistics for the designer
// exports.getStats = async (req, res) => {
//   try {
//     const designerId = req.user.id;

//     const approvedTemplates = await Template.countDocuments({
//       designerId,
//       status: "approved",
//     });

//     const pendingTemplates = await Template.countDocuments({
//       designerId,
//       status: "pending",
//     });

//     const rejectedTemplates = await Template.countDocuments({
//       designerId,
//       status: "rejected",
//     });

//     const totalSales = await Template.aggregate([
//       { $match: { designerId: designerId, status: "approved" } },
//       { $group: { _id: null, total: { $sum: "$sales_count" } } },
//     ]);

//     const totalSalesAmount = (totalSales[0]?.total || 0) * 100; // Assuming each sale is $100

//     res.json({
//       approvedTemplates,
//       pendingTemplates,
//       rejectedTemplates,
//       totalSales: totalSalesAmount,
//     });
//   } catch (error) {
//     console.error("Error fetching designer stats:", error);
//     res.status(500).json({ message: "Failed to fetch stats" });
//   }
// };

// Get designer stats for dashboard
exports.getStats = async (req, res) => {
  try {
    const designerId = req.user.id;

    // Calculate total approved templates
    const approvedTemplates = await Template.find({
      designerId,
      status: "approved",
    });
    const totalApproved = approvedTemplates.length;

    // Calculate total pending templates
    const pendingTemplates = await Template.find({
      designerId,
      status: "pending",
    });
    const totalPending = pendingTemplates.length;

    // Calculate total sales and total earnings
    let totalSales = 0;
    let totalEarnings = 0;
    const pricePerTemplate = 100;
    const commissionRate = 0.3;

    approvedTemplates.forEach((template) => {
      totalSales += template.sales_count;
      totalEarnings += template.sales_count * pricePerTemplate * commissionRate;
    });

    res.json({
      totalApproved,
      totalPending,
      totalSales,
      totalEarnings: totalEarnings.toFixed(2),
    });
  } catch (error) {
    console.error("Error fetching designer stats:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
};

// Get sales data for generating a chart
// exports.getSalesChartData = async (req, res) => {
//   try {
//     const designerId = req.user.id;

//     // Group sales data by month
//     const salesData = await Template.aggregate([
//       {
//         $match: {
//           designerId: new mongoose.Types.ObjectId(designerId),
//           status: "approved",
//         },
//       },
//       {
//         $group: {
//           _id: { $month: "$createdAt" },
//           totalSales: { $sum: "$sales_count" },
//           totalEarnings: { $sum: { $multiply: ["$sales_count", 100] } }, // Assuming $100 per sale
//         },
//       },
//       { $sort: { _id: 1 } }, // Sort by month
//     ]);

//     res.json(salesData);
//   } catch (error) {
//     console.error("Error fetching sales chart data:", error);
//     res.status(500).json({ message: "Failed to fetch sales chart data" });
//   }
// };
// Get sales data for generating a chart
// exports.getSalesChartData = async (req, res) => {
//   try {
//     const designerId = req.user.id;

//     // Group sales data by month
//     const salesData = await Template.aggregate([
//       {
//         $match: {
//           designerId: new mongoose.Types.ObjectId(designerId),
//           status: "approved",
//         },
//       },
//       {
//         $group: {
//           _id: { $month: "$createdAt" },
//           totalSales: { $sum: "$sales_count" },
//           totalEarnings: { $sum: { $multiply: ["$sales_count", 100 * 0.3] } }, // Assuming $100 per sale with 30% commission
//         },
//       },
//       { $sort: { _id: 1 } }, // Sort by month
//     ]);

//     // Convert month numbers to month names
//     const months = [
//       "Jan",
//       "Feb",
//       "Mar",
//       "Apr",
//       "May",
//       "Jun",
//       "Jul",
//       "Aug",
//       "Sep",
//       "Oct",
//       "Nov",
//       "Dec",
//     ];
//     const formattedData = salesData.map((item) => ({
//       month: months[item._id - 1],
//       totalSales: item.totalSales,
//       totalEarnings: item.totalEarnings,
//     }));

//     res.json(formattedData);
//   } catch (error) {
//     console.error("Error fetching sales chart data:", error);
//     res.status(500).json({ message: "Failed to fetch sales chart data" });
//   }
// };
// exports.getSalesChartData = async (req, res) => {
//   try {
//     const designerId = req.user.id;

//     // Aggregate sales data by month
//     const salesData = await Template.aggregate([
//       {
//         $match: {
//           designerId: new mongoose.Types.ObjectId(designerId),
//           status: "approved",
//         },
//       },
//       {
//         $group: {
//           _id: { $month: "$createdAt" },
//           totalSales: { $sum: "$sales_count" },
//           totalEarnings: { $sum: { $multiply: ["$sales_count", 100 * 0.3] } }, // Assuming $100 per sale with 30% commission
//         },
//       },
//       { $sort: { _id: 1 } }, // Sort by month
//     ]);

//     // Convert month numbers to names
//     const months = [
//       "Jan",
//       "Feb",
//       "Mar",
//       "Apr",
//       "May",
//       "Jun",
//       "Jul",
//       "Aug",
//       "Sep",
//       "Oct",
//       "Nov",
//       "Dec",
//     ];
//     const formattedData = salesData.map((item) => ({
//       month: months[item._id - 1],
//       totalSales: item.totalSales,
//       totalEarnings: item.totalEarnings,
//     }));

//     res.json(formattedData);
//   } catch (error) {
//     console.error("Error fetching sales chart data:", error);
//     res.status(500).json({ message: "Failed to fetch sales chart data" });
//   }
// };

exports.getSalesChartData = async (req, res) => {
  try {
    const designerId = req.user.id;

    // Group sales data by month
    const salesData = await Template.aggregate([
      {
        $match: {
          designerId: new mongoose.Types.ObjectId(designerId),
          status: "approved",
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          totalSales: { $sum: "$sales_count" },
          totalEarnings: { $sum: { $multiply: ["$sales_count", 100] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    console.log("Aggregated Sales Data:", salesData); // Debug log
    res.json(salesData);
  } catch (error) {
    console.error("Error fetching sales chart data:", error);
    res.status(500).json({ message: "Failed to fetch sales chart data" });
  }
};

// Update payment information
exports.updatePaymentInfo = async (req, res) => {
  const { payment_method, paypal_email, venmo_username, cashapp_username } =
    req.body;

  try {
    const designerId = req.user.id;

    // Fetch the designer from the database
    const designer = await Designer.findById(designerId);

    if (!designer) {
      return res.status(404).json({ message: "Designer not found" });
    }

    // Update payment information
    designer.payment_method = payment_method;
    designer.payment_details = {
      paypal_email,
      venmo_username,
      cashapp_username,
    };

    await designer.save();
    res.json({ message: "Payment information updated successfully." });
  } catch (error) {
    console.error("Error updating payment information:", error);
    res.status(500).json({ message: "Error updating payment information." });
  }
};

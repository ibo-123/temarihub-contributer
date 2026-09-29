const asyncHandler = require('../utils/asyncHandler');

const adminDashboard = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      message: `Welcome, ${req.user.name}`,
      name: req.user.name,
      role: req.user.role,
    },
  });
});

const contributorDashboard = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      message: `Welcome, ${req.user.name}`,
      name: req.user.name,
      role: req.user.role,
    },
  });
});

module.exports = { adminDashboard, contributorDashboard };

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

//verify token
const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization || req.headers.Authorization;
  token = authHeader?.split(' ')[1];

  if (!token || !authHeader) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not Authorized');
    }
  }
});

module.exports = { protect };

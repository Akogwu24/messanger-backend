const jwt = require('jsonwebtoken');

const generateToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: '5d' });
};

module.exports = generateToken;

const express = require('express');
const { registerUser, loginUser, searchUser } = require('../controllers/userControllers');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.route('/').post(registerUser).get(protect, searchUser);
router.route('/login').post(loginUser);

module.exports = router;

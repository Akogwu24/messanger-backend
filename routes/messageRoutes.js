const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { sendMessage, allChatMessages } = require('../controllers/MessageController');

router.route('/').post(protect, sendMessage);
router.route('/:chatId').get(protect, allChatMessages);

module.exports = router;

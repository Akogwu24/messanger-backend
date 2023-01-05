const express = require('express');
const {
  createChat,
  fetchChats,
  createGroupChat,
  renameGroupChat,
  addNewMemberToGroup,
  removeMemberFromGroup,
} = require('../controllers/chatControllers');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.route('/').post(protect, createChat).get(protect, fetchChats);

router.route('/group').post(protect, createGroupChat).put(protect, renameGroupChat);

router.route('/groupadd').put(protect, addNewMemberToGroup);
router.route('/groupremove').put(protect, removeMemberFromGroup);

module.exports = router;

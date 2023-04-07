const asyncHandler = require('express-async-handler');
const Chat = require('../models/chatModel');
const User = require('../models/userModel');

//one on one chat
const createChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) return res.status(400).json({ message: 'User Id not found' });

  let isChat = await Chat.find({
    isGroupChat: false,
    $and: [{ users: { $elemMatch: { $eq: req.user._id } } }, { users: { $elemMatch: { $eq: userId } } }],
  })
    .populate('users', '-password')
    .populate('latestMessage');

  isChat = await User.populate(isChat, {
    path: 'latestMessage.sender',
    select: 'name pic, email',
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    const chartData = {
      chatName: 'sender',
      isGroupChat: false,
      users: [req.user._id, userId],
    };

    try {
      const createdChat = await Chat.create(chartData);

      const fullChat = await Chat.findOne({ _id: createdChat._id }).populate('users', '-password');
      res.status(201).json({ fullChat, message: 'chat created' });
    } catch (e) {
      res.status(400);
      throw new Error(e.message);
    }
  }
});

const fetchChats = asyncHandler(async (req, res) => {
  try {
    await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate('users', '-password')
      .populate('groupAdmin', '-password')
      .populate('latestMessage')
      .sort({ updatedAt: -1 })
      .then(async (results) => {
        results = await User.populate(results, { path: 'latestMessage.sender', select: 'name pic email' });

        res.status(200).send({ results, message: 'Fetch Successfully' });
      });
  } catch (e) {
    res.status(400);
    throw new Error(e.message);
  }
});

const createGroupChat = asyncHandler(async (req, res) => {
  const { usersList, groupName } = req.body;
  if (!usersList || !groupName) return res.status(400).json({ message: 'Please Fill all th Fields' });

  const duplicateGroup = await Chat.findOne({ chatName: groupName });

  if (duplicateGroup) return res.status(409).send({ message: 'Group Already Exist' });

  let users = JSON.parse(usersList);
  if (users.lenght < 2) return res.status(400).send({ message: 'More Than 2 Users are required to form a Group Chat' });

  users.push(req.user);

  try {
    const groupChat = await Chat.create({
      chatName: groupName,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id }).populate('users', '-password').populate('groupAdmin', '-password');
    res.status(200).json(fullGroupChat);
  } catch (e) {
    res.status(400);
    throw new Error(e.message);
  }
});

const renameGroupChat = asyncHandler(async (req, res) => {
  const { chatId, newGroupChatName } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(chatId, { chatName: newGroupChatName }, { new: true })
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

  if (!updatedChat) {
    res.status(404);
    throw new Error('Chat Not Found');
  } else {
    res.json(updatedChat);
  }
});

const addNewMemberToGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const added = await Chat.findByIdAndUpdate(chatId, { $push: { users: userId } }, { new: true })
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

  if (added) {
    res.status(200).json({ message: 'New Member Added to Group', added });
  } else {
    res.status(400);
    throw new Error('Chat not Found');
  }
});

const removeMemberFromGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;

  const removed = await Chat.findByIdAndUpdate(chatId, { $pull: { users: userId } }, { new: true })
    .populate('users', '-password')
    .populate('groupAdmin', '-password');

  if (removed) {
    res.status(200).json({ message: 'Member removed from Group', removed });
  } else {
    res.status(400);
    throw new Error('Chat not Found');
  }
});

module.exports = { createChat, fetchChats, createGroupChat, renameGroupChat, addNewMemberToGroup, removeMemberFromGroup };

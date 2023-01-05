const asyncHandler = require('express-async-handler');
const generateToken = require('../middlewares/generateToken');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  try {
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Please Enter all the Fileds');
    }

    const userExists = await User.findOne({ email }).lean().exec();

    if (userExists) return res.status(409).send({ message: 'User Already Exists' });

    const newUser = await User.create({ name, email, password, pic });

    if (newUser) {
      //   res.status(201).json({ success: `new user ${newUser.name} created Successfully`, ...newUser._doc, token: generateToken(newUser._id, email) });
      res.status(201).json({ success: `new user ${newUser.name} created Successfully` });
    } else {
      res.status(400);
      throw new Error('Failed to Create User');
    }
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(404).json({ message: 'All Fields are required' });

  try {
    const user = await User.findOne({ email }).exec();

    if (!user) return res.status(404).json({ message: 'User not Found' });

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (user && passwordMatch) {
      res.json({ _id: user._id, name: user.name, email: user.email, pic: user.pic, token: generateToken(user._id, user.email) });
    } else {
      res.status(400).json({ message: 'Invalid Creidentials' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

const searchUser = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [{ name: { $regex: req.query.search, $options: 'i' } }, { email: { $regex: req.query.search, $options: 'i' } }],
      }
    : {};

  const users = await await User.find(keyword)
    .select('-password')
    .find({ _id: { $ne: req.user.id } });

  res.status(200).send({ message: 'User(s) Found', users });
});

module.exports = { registerUser, loginUser, searchUser };

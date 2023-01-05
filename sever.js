require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const connectDB = require('./config/dbConn');
const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const PORT = process.env.PORT || 8080;

connectDB();

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use('/api/user', require('./routes/userRoutes'));

mongoose.connection.once('open', () => {
  console.log('connected to mongoDB server');
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
});

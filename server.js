require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const corsOptions = require('./config/corsOption');
const connectDB = require('./config/dbConn');
const mongoose = require('mongoose');
const { routeEndpointNotFound, genericErrorHandler } = require('./middlewares/errorhandler');
mongoose.set('strictQuery', false);

const PORT = process.env.PORT || 8080;

connectDB();

app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: false }));

app.use('/api/user', require('./routes/userRoutes'));

app.use('/api/chat', require('./routes/chatRoutes'));

app.use(routeEndpointNotFound);

app.use(genericErrorHandler);

mongoose.connection.once('open', () => {
  console.log('connected to mongoDB server');
  app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
});

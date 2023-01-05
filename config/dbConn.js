const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
    console.log(`connected to mongoDB ${conn.connection.host}`);
  } catch (e) {
    console.log('coonect error', e);
    process.exit();
  }
};

module.exports = connectDB;

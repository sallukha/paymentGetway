const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    await mongoose.connect(
      'mongodb+srv://sallukhan54154:y3KIhN0VQBm0klTD@pro-users.zywik9l.mongodb.net/?retryWrites=true&w=majority&appName=pro-users',
      {
        useNewUrlParser: true,
        
      }
    );
    console.log('✅ Connected to MongoDB Atlas');
  } catch (error) {
    console.error('❌ MongoDB Atlas Connection Error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

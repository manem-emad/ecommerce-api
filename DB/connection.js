const mongoose = require('mongoose');

const connectDB = async () => {
    try {
       mongoose.connect('mongodb://127.0.0.1:27017/lec-10')
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
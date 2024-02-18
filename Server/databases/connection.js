const mongoose = require("mongoose");

const connectDB = async () => {
    try {

        console.log(process.env.MONGO_URI);
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Database connected successfully`);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

module.exports = connectDB;

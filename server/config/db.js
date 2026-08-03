import mongoose from "mongoose"

// Function to connect to the MongDB database
const connectDB = async () => {

    mongoose.connection.on('connected',()=>console.log('Database Connected'))

    const uri = process.env.MONGODB_URI.trim() + "/JOB-PORTAL-APP-PRACTICE";

console.log("URI =", uri);

try {
    await mongoose.connect(uri);
    console.log("Connected");
} catch (err) {
    console.error("Mongoose Error:", err);
}

}

export default connectDB
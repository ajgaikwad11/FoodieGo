import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://ajitgaikwad0131:940565@cluster0.a6dg8.mongodb.net/').then(() => console.log("DB Connected"));
}
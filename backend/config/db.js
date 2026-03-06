import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://blincat:blin123@cluster0.3rubylb.mongodb.net/blincat')
        .then(() => console.log("DB CONNECTED"));
}



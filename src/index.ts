import express from "express";
import "dotenv/config";


import connectDB from "./config/db";

import { app } from "./app";


const PORT = process.env.PORT || 3000;


connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})



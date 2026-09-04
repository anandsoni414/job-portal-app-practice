import dns from "dns";
import './config/instrument.js'
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import { clerkWebhooks } from './controllers/webhooks.js'
import companyRoutes from './routes/companyRoutes.js'
import connectCloudinary from './config/cloudinary.js'
import jobRoutes from './routes/jobRoutes.js'
import userRoutes from './routes/userRoutes.js'
import {clerkMiddleware} from '@clerk/express'

import { v2 as cloudinary } from "cloudinary";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

//Initialise Express
const app = express()

// Connect to database
await connectDB()
await connectCloudinary()

// Middlewares
app.use(cors())

//Routes
app.get('/',(req,res)=> res.send("API Working"))
app.post('/webhooks', express.raw({ type: 'application/json' }), clerkWebhooks)
app.use(express.json())
app.use(clerkMiddleware())
app.use('/api/company',companyRoutes)
app.use('/api/jobs',jobRoutes)
app.use('/api/users',userRoutes)


// Port
const PORT = process.env.PORT || 5000


app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})

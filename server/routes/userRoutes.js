import express from 'express'
import upload from '../config/multer.js'
import { applyForJob, getUserData, getUserJobApplications, updateUserResume } from '../controllers/userController.js'

const router = express.Router()

// Get user Data
router.get('/user',getUserData)

// Apply for a job
router.post('/apply',applyForJob)

// Get applied jobs Data
router.get('/applications',getUserJobApplications)

//Update user profile (resume)
router.post('/update-resume',upload.single('resume'),updateUserResume)

export default router;
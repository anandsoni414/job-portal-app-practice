import express from 'express'
import { ChangeJobApplicationsStatus, changeVisiblity, getCompanyData, getCompanyPostedJobs, loginCompany, postJob, registerCompany } from '../controllers/companyController'

const router = express.Router()

// Register a company
router.post('/register', registerCompany)

// Company login
router.post('/login',loginCompany)

// Get company data
router.get('/company',getCompanyData)

// Get company data
router.get('/post-job',postJob)

// Get Applicants Data of Company
router.get('/applicants',getCompanyJobApplicants)

// Get company job list
router.get('/list-jobs',getCompanyPostedJobs)

// Change Application status
router.post('/change-status',ChangeJobApplicationsStatus)

// Change applicationn visiblity
router.post('/change-visiblity',changeVisiblity)
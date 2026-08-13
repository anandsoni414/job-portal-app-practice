import Company from "../models/Company";
import bcrypt from 'bcrypt'
import { v2 as cloudinary} from 'cloudinary'

// Register a new company
export const registerCompany = async (req,res) => {

    const {name, email, password} = req.body

    const imageFile = req.file;

    if(!name || !email || !pasword || !imageFile){
        return res.json({success:false, message: "Missing Details"})
    }

    try {
        const companyExists = await Company.findOne({email})

        if(companyExists) {
            return res.json({success:false, message:'Company already registered'})
        }

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.has(password, salt)
        
        const imageUpload = await cloudinary.uploader.upload(imageFile.path)

        const company = await Company.create({
            name,
            email,
            password: hashPassword,
            image: imageUpload.secure_url

        })
        res.json({
            success: true,
            company: {
                _id: company._id,
                name: company.name,
                email: company.email,
                image: company.image

            }
        })

    } catch (error) {

    }

}

// Company login
export const loginCompany = async () => {

}

//Get company data
export const getCompanyData = async (req,res) => {

}

// Post a new job 
export const postJob = async (req,res) => {

}

// Get company job applicants
export const getCompanyJobApplicants = async (req,res) => {

}

// Get company posted jobs 
export const getCompanyPostedJobs = async (req,res) => {

}

//Change Job Application Status
export const ChangeJobApplicationsStatus = async (req,res) => {

}

// Change job visiblity
export const changeVisiblity = async (req,res) => {

}

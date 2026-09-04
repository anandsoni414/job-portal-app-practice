import Job from "../models/Job.js"
import JobApplication from "../models/JobApplication.js"
import User from "../models/User.js"
import { v2 as cloudinary} from 'cloudinary'
import { clerkClient, getAuth } from "@clerk/express"

const getAuthenticatedUserId = (req, res) => {
    const { userId } = getAuth(req)

    if (!userId) {
        res.status(401).json({ success: false, message: 'Not authorised, Login Again' })
        return null
    }

    return userId
}

const getPrimaryEmail = (clerkUser) => {
    return clerkUser.emailAddresses?.find((email) => email.id === clerkUser.primaryEmailAddressId)?.emailAddress
        || clerkUser.primaryEmailAddress?.emailAddress
        || clerkUser.emailAddresses?.[0]?.emailAddress
        || ''
}

const getFullName = (clerkUser, email) => {
    return [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ').trim()
        || clerkUser.username
        || email
        || 'User'
}

const createUserFromClerk = async (userId) => {
    const clerkUser = await clerkClient.users.getUser(userId)
    const email = getPrimaryEmail(clerkUser)

    return await User.findByIdAndUpdate(
        userId,
        {
            $setOnInsert: {
                email,
                name: getFullName(clerkUser, email),
                image: clerkUser.imageUrl || '',
                resume: ''
            }
        },
        { upsert: true, new: true }
    )
}

const getOrCreateUser = async (userId) => {
    const user = await User.findById(userId)

    if (user) {
        return user
    }

    return await createUserFromClerk(userId)
}

// Get user data
export const getUserData = async (req,res) => {
    
    try {
        const userId = getAuthenticatedUserId(req, res)

        if (!userId) {
            return
        }

        const user = await getOrCreateUser(userId)

        res.json({success:true, user})

    } catch (error) {
        res.json({success:false, message: error.message})
    }
}

// Apply for a job 
export const applyForJob = async (req,res) => {

    const { jobId} = req.body

    try {
        const userId = getAuthenticatedUserId(req, res)

        if (!userId) {
            return
        }

        await getOrCreateUser(userId)
        
        const isAlreadyApplied = await JobApplication.find({jobId,userId})

        if (isAlreadyApplied.length > 0) {
            return res.json({success:false, message:'Already Applied'})
        }

        const jobData = await Job.findById(jobId)

        if(!jobData) {
            return res.json({success:false, message:'Job Not Found'})
        }

        await JobApplication.create({
            companyId: jobData.companyId,
            userId,
            jobId,
            date: Date.now()
        })

        res.json({success: true, message:'Applied Successfully'})

    } catch (error) {
        res.json({success:false, message: error.message})
    }

} 

// Get user applied applications
export const getUserJobApplications = async (req,res) => {

    try {
        
        const userId = getAuthenticatedUserId(req, res)

        if (!userId) {
            return
        }

        const applications = await JobApplication.find({userId})
        .populate('companyId','name email image')
        .populate('jobId','title description location category level salary')
        .exec()

        if(!applications) {
            return res.json({success: false, message:'No job applications found for this user.'})
        }

        return res.json({success:true, applications})

    } catch (error) {
        res.json({success:false, message: error.message})
    }

}

// update user profile (resume)
export const updateUserResume = async (req,res) => {
    try {
        
        const userId = getAuthenticatedUserId(req, res)

        if (!userId) {
            return
        }

        const resumeFile = req.file

        const userData = await getOrCreateUser(userId)

        if (resumeFile) {
            const resumeUpload = await cloudinary.uploader.upload(resumeFile.path)
            userData.resume = resumeUpload.secure_url
        }

        await userData.save()

        return res.json({ success:true, message: 'Resume Updated'})

    } catch (error) {
        res.json({success:false, message:error.message})
    }
}

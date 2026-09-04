import { Webhook } from "svix";
import User from "../models/User.js";

const getPrimaryEmail = (data) => {
    return data.email_addresses?.find((email) => email.id === data.primary_email_address_id)?.email_address
        || data.email_addresses?.[0]?.email_address
        || ''
}

const getFullName = (data, email) => {
    return [data.first_name, data.last_name].filter(Boolean).join(' ').trim()
        || data.username
        || email
        || 'User'
}

const getUserData = (data) => {
    const email = getPrimaryEmail(data)

    return {
        email,
        name: getFullName(data, email),
        image: data.image_url || data.profile_image_url || ''
    }
}

//API Controller Function to Manage Clerk User with database
export const clerkWebhooks = async (req,res) => {
    try {

        // Create a Svix instance with clerk webhook secret
        const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET)
        const payload = req.body.toString()

        // Verifying Headers
        const evt = whook.verify(payload,{
            "svix-id": req.headers["svix-id"],
            "svix-timestamp" : req.headers["svix-timestamp"],
            "svix-signature" : req.headers["svix-signature"]
        })

        // Getting Data from request body
        const { data, type } = evt

        // Switch Cases for different Events
        switch (type) {

            case 'user.created': {

                await User.findByIdAndUpdate(
                    data.id,
                    {
                        $set: getUserData(data),
                        $setOnInsert: { resume: '' }
                    },
                    { upsert: true, new: true }
                )
                break;
            }

            case 'user.updated': {

                await User.findByIdAndUpdate(
                    data.id,
                    {
                        $set: getUserData(data),
                        $setOnInsert: { resume: '' }
                    },
                    { upsert: true, new: true }
                )
                break;
            }

            case 'user.deleted': {

                await User.findByIdAndDelete(data.id);
                break;
            }

            default:
                break;
        }

        return res.json({ received: true })

    } catch (error) {
        console.log(error.message);
        res.json({
            success:false,
            message:"Webhooks Error"
        })
    }
}

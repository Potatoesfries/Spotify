import {clerkClient} from "@clerk/express"

export const protectRoute = async (req, res, next) =>{
    // this is to check if the user is logged in or not 
    // so it check if the user id exist or not if not then you cannot and exist from this function and if it is it move on the next function
    if(!req.auth.userId){
        return res.status(401).json({message: "Unauthorized - you must logged in"})
    }
    next();
};

// this function will check if the current user is admin or not 
export const requireAdmin = async (req, res, next)=>{
    try {
        // this is how to get current user
        const currentUser = await clerkClient.users.getUser(req.auth.userId)
        // check if the user is admin or not by check the current user email with the admin email we saved in the .env file
        const isAdmin = process.env.ADMIN_EMAIL === currentUser.primaryEmailAddress?.emailAddress
        // if it is not then it return the error it is not 
        if(!isAdmin){
            return res.status(403).json({message: "Unauthorized- you must be admin"})
        }
        // if current user is admin move on to the next function
        next()

    } catch (error) {
        res.status(500).json({message: "server error" , error})
    }
}
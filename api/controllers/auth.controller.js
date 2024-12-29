import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { errorHandler } from "../utils/error.js";
import jwt from "jsonwebtoken";

// Signup function: Handles user registration
export const signup = async(req, res, next) => {
    const { username, email, password } = req.body;
    const hashedPassword = bcryptjs.hashSync(password, 10); // Hash the password before saving
    const newUser = new User({ username, email, password: hashedPassword });

    try {
        await newUser.save(); // Save new user to the database
        res.status(201).json("User created successfully");
    } catch (error) {
        console.error(error); // Debugging the error
        next(error); // Forward to error handler
    }
};

// Signin function: Handles user login with JWT token
export const signin = async(req, res, next) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const validUser = await User.findOne({ email });
        if (!validUser) return next(errorHandler(404, "User not found"));

        // Compare the hashed password with the entered password
        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if (!validPassword) return next(errorHandler(401, "Invalid credentials"));

        // Generate JWT token with user ID and set expiration to 1 hour
        const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Exclude the password from the user object before sending the response
        const { password: pass, ...rest } = validUser._doc;

        // Set the token in cookies and send the response
        res.cookie("access_token", token, {
                httpOnly: true, // Prevents client-side access to the cookie
                secure: process.env.NODE_ENV === "production", // Use secure cookies in production
                sameSite: "strict", // Helps prevent CSRF attacks
            })
            .status(200)
            .json(rest); // Send user data excluding the password
    } catch (error) {
        console.error(error); // Debugging the error
        next(error); // Forward to error handler
    }
};

// Google OAuth function: Handles user login/registration via Google
export const google = async(req, res, next) => {
    try {
        // Check if user already exists in the database
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            // If user exists, generate and send JWT token
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            const { password: pass, ...rest } = user._doc;

            res.cookie("access_token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                })
                .status(200)
                .json(rest); // Send user data excluding the password
        } else {
            // If user does not exist, create a new user and generate JWT token
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8); // Generate a random password
            const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
            const newUser = new User({
                username: req.body.name.split(" ").join("").toLowerCase() + Math.random().toString(36).slice(-4), // Generate username
                email: req.body.email,
                password: hashedPassword,
                avatar: req.body.photo, // Store user's Google profile photo
            });

            await newUser.save(); // Save the new user to the database

            // Generate and send JWT token for the new user
            const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            const { password: pass, ...rest } = newUser._doc;

            res.cookie("access_token", token, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                })
                .status(200)
                .json(rest); // Send user data excluding the password
        }
    } catch (error) {
        console.error(error); // Debugging the error
        next(error); // Forward to error handler
    }
};

// SignOut function: Logs the user out by clearing the cookie
export const signOut = async(req, res, next) => {
    try {
        res.clearCookie('access_token'); // Clear the JWT cookie
        res.status(200).json("User has been logged out!"); // Send logout success message
    } catch (error) {
        console.error(error); // Debugging the error
        next(error); // Forward to error handler
    }
};
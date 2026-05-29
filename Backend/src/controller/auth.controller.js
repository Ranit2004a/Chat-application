import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import { sendWelcomeEmail } from "../emails/emailHandlers.js";
import { ENV } from "../lib/env.js";
import cloudinary from "../lib/cloudinary.js";

export const signup = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (
      !username?.trim() ||
      !email?.trim() ||
      !password?.trim()
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const normalizedEmail = email.toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);

    const hashedPassword = await bcrypt.hash(
      password,
      salt
    );

    const newUser = new User({
      fullName: username,
      email: normalizedEmail,
      password: hashedPassword,
    });

   const savedUser = await newUser.save();

    generateToken(savedUser._id, res);

    try {
      await sendWelcomeEmail(savedUser.email, savedUser.fullName, ENV.CLIENT_URL);
    }
    catch (error) {
      console.error("Error sending welcome email:", error);
    }

    return res.status(201).json({
      _id: savedUser._id,
      fullName: savedUser.fullName,
      email: savedUser.email,
      profilePic: savedUser.profilePic,
    });

  } catch (error) {
    console.log("Signup Error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const login = async (req, res) => {
  const  { email, password } = req.body;

  

  try {
    if (
      !email?.trim() ||
      !password?.trim()
    ) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }
    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    }); 
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    generateToken(user._id, res); 
    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Error in login controller:", error);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

export const logout =  (_, res) => {
  res.cookie("jwt", "", {
    maxAge: 0,
  });
  res.status(200).json({
    message: "Logged out successfully",
  });
};

export const updateProfile = async (req, res) => {

  try {
    const { profilePic } = req.body;
    if(!profilePic?.trim()) {
      return res.status(400).json({
        message: "Profile picture is required",
      });
    }
    const userId = req.user._id;

   const uplodeResponse = await cloudinary.uploader.upload(profilePic);
   const updatedUser = await User.findByIdAndUpdate(userId, {
    profilePic: uplodeResponse.secure_url,
   }, { new: true });

  res.status(200).json(updatedUser);

} catch (error) {
  console.error("Error updating profile:", error);
  return res.status(500).json({
    message: "Internal Server Error",
  });
}
  
};
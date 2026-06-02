import express from 'express';
import { signup, login, logout, updateProfile } from '../controller/auth.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';    
import { arcjetProtection } from '../middleware/arcjet.middleware.js';

const  route = express.Router();

route.post("/signup", signup);

route.post("/login",arcjetProtection, login);

route.post("/logout", logout); 

route.put("/update-profile", protectRoute, updateProfile); 

route.get("/check", protectRoute, (req, res) => {
  res.status(200).json({
    isAuthenticated: true,
    user: req.user
  });
});

export default route;
import express from 'express';
import { signup } from '../controller/auth.controller.js';

const  route = express.Router();

route.post("/signup", signup);

route.get("/login", (req, res) => {
    res.send("Login route");
});

route.get("/logout", (req, res) => {
    res.send("Logout route");
});

export default route;
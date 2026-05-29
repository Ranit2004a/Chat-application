import express from 'express';
import { signup, login, logout } from '../controller/auth.controller.js';

const  route = express.Router();

route.post("/signup", signup);

route.post("/login", login);

route.post("/logout", logout); 

export default route;
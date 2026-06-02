import express from 'express';
import { getAllContects, getAllPatners, getMessagesByUserId, sendMessage } from '../controller/message.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
const router = express.Router();

router.get("/contects", protectRoute, getAllContects);
router.get("/chats", protectRoute, getAllPatners);
router.get("/:id", protectRoute, getMessagesByUserId);

router.post("/send/:id", protectRoute, sendMessage );

export default router;
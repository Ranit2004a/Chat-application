import express from 'express';
import { getAllContects, getAllPatners, getMessagesByUserId, sendMessage, deleteMessage, editMessage } from '../controller/message.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';
const router = express.Router();
import { arcjetProtection } from '../middleware/arcjet.middleware.js';

router.use(arcjetProtection, protectRoute);

router.get("/contects", getAllContects);
router.get("/chats", getAllPatners);
router.get("/:id", getMessagesByUserId);
router.post("/send/:id", sendMessage );
router.delete("/delete/:id", deleteMessage);
router.put("/edit/:id", editMessage);

export default router;
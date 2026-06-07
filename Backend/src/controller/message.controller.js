import Message from "../models/Message.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";





export const getAllContects = async (req, res) => {

    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
        res.status(200).json(filteredUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMessagesByUserId = async (req, res) => {
    try {
        const myId = req.user._id;
        const  { id: userToChatId }  = req.params;
        const messages = await Message.find({
            $or: [
                { senderId: myId, receiverId: userToChatId },
                { senderId: userToChatId, receiverId: myId },
            ],
        });
        res.status(200).json(messages);
    } catch (error) {
        console.log("error in getMessages controller", error.message);
        res.status(500).json({ error: "Internal server error" });

    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id:receiverId } = req.params;
        const senderId = req.user._id;
        
       if (!text?.trim() && !image) {
            return res.status(400).json({ error: "Message text or image is required" });
        }
        if (senderId.equals(receiverId)) {
            return res.status(400).json({ error: "Cannot send message to yourself" });
        }
        const receiverExists = await User.findById({ _id: receiverId });
        if (!receiverExists) {
            return res.status(404).json({ error: "Receiver not found" });
        }

        let imageUrl;
        if (image) {
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }
        
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (error) {
        console.log("error in sendMessage controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getAllPatners = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const messages = await Message.find({ $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }] }).select("receiverId senderId");
        const partnerIds = [...new Set([...messages.map(msg => msg.senderId.toString() === loggedInUserId.toString() ? msg.receiverId.toString() : msg.senderId.toString())])];
        const partners = await User.find({ _id: { $in: partnerIds } }).select("-password");
        res.status(200).json(partners);
    } catch (error) {
        console.log("error in getAllPatners controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteMessage = async (req, res) => {
    try {
        const { id: messageId } = req.params;
        const myId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        if (message.senderId.toString() !== myId.toString()) {
            return res.status(403).json({ error: "Unauthorized to delete this message" });
        }

        await Message.findByIdAndDelete(messageId);
        res.status(200).json({ message: "Message deleted successfully" });
    } catch (error) {
        console.log("error in deleteMessage controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const editMessage = async (req, res) => {
    try {
        const { id: messageId } = req.params;
        const { text } = req.body;
        const myId = req.user._id;

        if (!text || !text.trim()) {
            return res.status(400).json({ error: "Message text is required" });
        }

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        if (message.senderId.toString() !== myId.toString()) {
            return res.status(403).json({ error: "Unauthorized to edit this message" });
        }

        message.text = text;
        await message.save();
        res.status(200).json(message);
    } catch (error) {
        console.log("error in editMessage controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};


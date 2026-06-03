import Message from "..models/Message.js";
import User from "../models/User.js";





export const getAllContects = (req, res) => {

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
        const  { id }  = req.params;
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
        const senderId = req.user._id;
        const receiverId = req.params.id;
        const { text, image } = req.body;
        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image,
        });
        await newMessage.save();
        res.status(200).json(newMessage);
    } catch (error) {
        console.log("error in sendMessage controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getAllPatners = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const sentMessages = await Message.find({ senderId: loggedInUserId }).select("receiverId");
        const receivedMessages = await Message.find({ receiverId: loggedInUserId }).select("senderId");
        const partnerIds = [...new Set([...sentMessages.map(msg => msg.receiverId), ...receivedMessages.map(msg => msg.senderId)])];
        const partners = await User.find({ _id: { $in: partnerIds } }).select("-password");
        res.status(200).json(partners);
    } catch (error) {
        console.log("error in getAllPatners controller", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

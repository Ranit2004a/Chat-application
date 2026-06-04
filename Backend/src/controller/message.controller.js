import Message from "../models/Message.js";
import User from "../models/User.js";





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

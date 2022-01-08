const {
    PRIVATE_CHAT,
    GROUP_CHAT,
} = require('../constants/constants');
const ChatModel = require("../models/Chats");
const UserModel = require("../models/Users");
const MessagesModel = require("../models/Messages");
const httpStatus = require("../utils/httpStatus");
const chatController = {};
chatController.send = async (req, res, next) => {
    try {
        let userId = req.userId;
        const {
            name,
            chatId,
            receivedId,
            member,
            type,
            content
        } = req.body;
        let chatIdSend = null;
        let chat;
        if (type === PRIVATE_CHAT) {
            if (chatId) {
                chat = await ChatModel.findById(chatId);
                if (chat !== null) {
                    chatIdSend = chat._id;
                }
            } else {
                chat = new ChatModel({
                   type: PRIVATE_CHAT,
                   member: [
                       receivedId,
                       userId
                   ]
                });
                await chat.save();
                chatIdSend = chat._id;
            }
        } else if (type === GROUP_CHAT) {
            if (chatId) {
                chat = await ChatModel.findById(chatId);
                if (chat !== null) {
                    chatIdSend = chat._id;
                }
            } else {
                chat = new ChatModel({
                    type: GROUP_CHAT,
                    member: member
                });
                await chat.save();
                chatIdSend = chat._id;
            }
        }
        if (chatIdSend) {
            if (content) {
                let message = new MessagesModel({
                    chat: chatIdSend,
                    user: userId,
                    content: content
                });
                await message.save();
                let messageNew = await MessagesModel.findById(message._id).populate('chat').populate('user');
                return res.status(httpStatus.OK).json({
                    data: messageNew
                });
            } else {
                return res.status(httpStatus.OK).json({
                    data: chat,
                    message: 'Create chat success',
                    response: 'CREATE_CHAT_SUCCESS'
                });
            }
        } else {
            return res.status(httpStatus.BAD_REQUEST).json({
                message: 'Not chat'
            });
        }

    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}
chatController.getMessages = async (req, res, next) => {
    try {
        let messages = await MessagesModel.find({
            chat: req.params.chatId
        }).populate('user');
        return res.status(httpStatus.OK).json({
            data: messages
        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}
chatController.getlistUser = async (req, res, next) => {
    try {
        let userId = req.userId;
        console.log(userId);
        let listUser = await ChatModel.find({
            "member": userId
        });
        let result = listUser.map( (data) => {
            const test = {};
            test["userId"] = "";
            test["id"] = "";
            test["time"] = "";
            test["username"] = "";
            test["avatar"] = "";
            test["cover_image"] = "";
            test["lastcontent"] = "";
            return test;
        } 
        
            // = "userId",
            // data.name = "id"
        );
        for(let i=0; i<listUser.length; i++) {
            result[i].userId = listUser[i].member[0] == userId ? listUser[i].member[1] : listUser[i].member[0];
            result[i].id = listUser[i]._id;
            result[i].time = listUser[i].updatedAt;
            let user = await UserModel.findById(listUser[i].member[0]);
            result[i].username = user.username;
            result[i].avatar = user.avatar;
            result[i].cover_image = user.cover_image;
            let lastContent = await MessagesModel.find( {
                chat: listUser[i]._id
            })
            let content = lastContent.map(data => {
                return data.content;
            });
            result[i].lastcontent = content[content.length-1];
        }
        result.reverse();
        return res.status(httpStatus.OK).json({
            userIdList: result
        });
    } catch (e) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: e.message
        });
    }
}
module.exports = chatController;
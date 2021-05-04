import express from "express";

const secureChat = express();

secureChat.get('/', (req, res) => {
    res.render('pages/secure-chat')
});

export default secureChat;

require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const mainRouter = require("./routes/index");
const { PORT } = require("./constants/constants");
const { MONGO_URI } = require("./constants/constants");
const bodyParser = require('body-parser');
const io = require('socket.io')(3000)
// const MessageModel = require("../models/Messages");

// connect to mongodb

const ZALO_URI = 'mongodb+srv://admin_zalo:0NgAyB59HPb83BlF@cluster0.0yer2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';

mongoose.connect(ZALO_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
})
    .then(res => {
        console.log("connected to mongodb");
    })
    .catch(err => {
        console.log(err);
    })
    mongoose.set('useNewUrlParser', true);
    mongoose.set('useFindAndModify', false);
    mongoose.set('useCreateIndex', true);
const app = express();
// use middleware to parse body req to json
app.use(express.json());

// use middleware to enable cors
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
// route middleware
app.use("/", mainRouter);

app.get('/settings', function (req, res) {
    res.send('Settings Page');
});


app.listen(PORT, () => {
    console.log("server start - " + PORT);
})

// Socket.io chat realtime
io.on('connection', (socket) => {
    MessageModel.find().then(result => {
        socket.emit('output-messages', result)
    })
    console.log('a user connected');
    socket.emit('message', 'Hello world');
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on('chatmessage', msg => {
        // const message = new MessageModel({ msg });
        message.save().then(() => {
            io.emit('message', msg)
        })
    })
});

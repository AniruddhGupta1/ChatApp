const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose")
mongoose.set('strictQuery',false)
mongoose.connect("mongodb://127.0.0.1:27017/ChatApp",{useNewUrlParser:true})
const connection = mongoose.connection;
connection.once("open",()=>{
  console.log("Connection to mongoose is successful")
})
const UserSchema = new mongoose.Schema({
UserName :String,
UserId :String,
RoomNo : Number
})
const Users = mongoose.model("Users",UserSchema);

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);




  socket.on("join_room", (data) => {
    socket.join(data.room);
    const user = new Users({
      UserName:data.username,
      UserId:socket.id,
      RoomNo:data.room
    })
    user.save();
    console.log(`User with ID: ${socket.id} joined room: ${data.room}`);
  });

  socket.on("send_message", (data) => {
    console.log(`msg has been sent from send_message`)
    console.log(data)
    socket.to(data.room).emit("receive_message", data);
    
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
    Users.deleteOne({UserId:socket.id}).then(function(data){
      console.log("User deleted");
     }).catch(function(err){
     console.log(err);
     }
     )
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING");
});

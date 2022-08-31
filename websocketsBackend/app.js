const multer = require("multer");
const path = require("path");
const express = require('express');
const app =express()
const http = require('http');
const body_parser = require("body-parser");
const { Server } = require("socket.io");
const server = http.createServer(app);
const mongoose = require("mongoose");
const cors = require('cors')
require("dotenv").config();


/*------------------------------- Routers-------------------------------*/

const io = new Server(server,{
    cors:{
        origin:"http://localhost:3000",
        methods:["GET","POST","PUT","DELETE"],
    }
});


io.on('connection', socket => {
  console.log('a user connected');
  
  socket.on('disconnect', reason => {
    console.log('user disconnected');
  });

  socket.on('room', data => {
    console.log('room join');
    console.log(data);
    socket.join(data.room);
  });


  socket.on('leave room', data => {
    console.log('leaving room');
    console.log(data);
    socket.leave(data.room)
  });

  socket.on('new message', data => {
    console.log(data.room);
    socket.broadcast
    .to(data.room)
    .emit('receive message', data)
  });
});





/*------------------------------- Images-------------------------------*/
//image variable
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      console.log(path.join(__dirname,"images"));
      cb(null, path.join(__dirname, "images"));
    },
    filename: (req, file, cb) => {
      cb(
        null,
        new Date().toLocaleDateString().replace(/\//g, "-") +
          "-" +
          file.originalname
      )
    }
  })
  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype == "image/jpeg" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/png"
    )
      cb(null, true);
    else cb(null, false);
  };

/*----------------------------------- Conneting to server & database ---------------------------------------- */  

mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    console.log("connected to socialMediaDB");
    //listening on port
    const port = process.env.PORT || 3011;
    server.listen(port, () => {
      console.log(`listening to ${port}`);
    });
  })
  .catch((error) => console.log(error));



/*------------------------------- MiddelWares-------------------------------*/

app.use("/images", express.static(path.join(__dirname, "images")));
app.use(multer({ storage, fileFilter }).single("image"));
app.use(cors());
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: false }));





//Not found MW
app.use((request, response) => {
    response.status(404).json({ data: "Page Not Fond" });
  });
  
  //Error MW
  app.use((error, request, response, next) => {
    //JS  code function.length
    let status = error.status || 500;
    response.status(status).json({ Error: error + "" });
  });
  
  
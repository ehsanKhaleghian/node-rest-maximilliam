const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const multer =require("multer");
const { v4: uuidv4 } = require('uuid');

const feedRoutes = require("./routes/feed");
const authRouts = require("./routes/auth");

const app = express();

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images');
    },
    filename: function(req, file, cb) {
        cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
});

//**These line didn't work.*/
// const storage = multer.diskStorage({
//     destination: function(req, file, cb) {
//         cb(null, 'images');
//     },
//     filename: function(req, file, cb) {
//         cb(null, uuidv4())
//     }
// });

const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpg" || file.mimetype === "image/jpeg") {
        cb(null, true);
    }else {
        cb (null, false)
    }
}

//**This is good for application/json files but the previous one was good for*/
//**    x-www-form-urlencoded which we took from <form> of html.*/
app.use(bodyParser.json());
app.use(multer({storage: storage, fileFilter}).single("image"))
//**For request goes into /images */
app.use("/images", express.static(path.join(__dirname,"images")))

//**By this we stop CORS errors and will by the second argument we can define which addresses could access*/
//**    our api which in here is "*" means every addresses.*/
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin","*");
    //**For allowing our desired methods*/
    res.setHeader("Access-Control-Allow-Methods","GET, POST, PUT, PATCH, DELETE");
    //**For authorizing*/
    res.setHeader("Access-Control-Allow-Headers","Content-type, Authorized");
    next();
})

//**This means that any request that start with "feed" will go to feedRoutes.*/
app.use("/feed", feedRoutes);
app.use("/auth", authRouts);

app.use((error,req, res, next) => {
    console.log("ERROR:::", error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({message, data});

})

//**Establish a mongoose connection*/
mongoose.connect("mongodb+srv://ehsanScript:E55268199Yk@cluster0.ytldu.mongodb.net/messages?retryWrites=true&w=majority")
    .then(result => {
        //**Also customized for socket io*/
        const server = app.listen(8080);
        const io = require("socket.io")(server);
        io.on("connection", socket => {
            console.log("CLIENT CONNECTED")
            console.log("CLIENT CONNECTED")
        })
    })
    .catch(err => console.log(err))


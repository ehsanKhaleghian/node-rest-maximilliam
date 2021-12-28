const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const multer =require("multer");
const { v4: uuidv4 } = require('uuid');
const helmet = require("helmet");
//**Most servers use compression and we don't have to use this middleware*/
const compression = require("compression");
const morgan =  require("morgan");
const https = require("https");

const app = express();

const feedRoutes = require("./routes/feed");
const authRouts = require("./routes/auth");

//** We want to stop reading server until this file is read, so we used readFileSync */
const privateKey = fs.readFileSync("server.key")
const certificate = fs.readFileSync("server.cert")

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

//**For have logs in a file:*/
//**{flags: "a"} means that it will add in the end of file*/
const accessLogStream = fs.createWriteStream(path.join(__dirname,"access.log"),{flags: "a"})

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
app.use(helmet());
//**Most servers use compression and we don't have to use this middleware*/
// app.use(compression());
app.use(morgan("combined",{stream: accessLogStream}))

app.use((error,req, res, next) => {
    console.log("ERROR:::", error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({message, data});

})

//**Establish a mongoose connection*/
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.ytldu.mongodb.net/messages?retryWrites=true&w=majority`)
    .then(result => {
        //**Also customized for socket io*/
        //**In createServer the first argument is configuration and second one is our app.*/
        //**This kind of ssl is used for custom ssl key*/
        // const server = https.createServer({key: privateKey, cert: certificate}, app).listen(process.env.PORT || 3000);
        const server = app.listen(process.env.PORT || 3000);
        const io = require("./socket").init(server);
        io.on("connection", socket => {
            console.log("CLIENT CONNECTED")
        })
    })
    .catch(err => console.log(err))


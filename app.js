const express = require("express");
const bodyParser = require("body-parser");

const feedRoutes = require("./routes/feed");

const app = express();

//**This is good for application/json files but the previous one was good for*/
//**    x-www-form-urlencoded which we took from <form> of html.*/
app.use(bodyParser.json());

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

app.listen(8080);
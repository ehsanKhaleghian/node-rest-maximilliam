const express = require("express")

const feedRoutes = require("./routes/feed")

const app = express();

//**This means that any request that start with "feed" will go to feedRoutes.*/
app.use("/feed", feedRoutes);

app.listen(8080);
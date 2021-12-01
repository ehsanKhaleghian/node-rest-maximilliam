const express = require("express");

const feedController = require("../controllers/feed");

const router = express.Router();

//**The request that would handle by this is : GET and the route is /feed/posts*/
router.get("/posts", feedController.getPosts);

module.exports = router;
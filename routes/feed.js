const express = require("express");

const feedController = require("../controllers/feed");

const router = express.Router();

//**The request that would handle by this is : GET and the route is /feed/posts*/
//GET /feed/posts
router.get("/posts", feedController.getPosts);

//POST /feed/post
router.post("/post", feedController.createPost)

module.exports = router;
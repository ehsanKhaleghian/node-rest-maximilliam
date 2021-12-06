const {validationResult} = require("express-validator");
const Post = require("../models/post")

exports.getPosts = (req, res, next) => {
//**Error code is super important because we have to show error to client based on our error*/
    res.status(200).json({
        posts: [
                {
                    _id: "1366",
                    title: "First Post",
                    content: "This is the first post",
                    imageUrl: "images/city.jpg",
                    creator : {
                        name: "ehsan"
                    },
                    createdAt: new Date()
                }
            ]
    })
};

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error= new Error("Validation failed, entered data is incorrect.");
        error.statusCode = 422;
        //**By throwing error it will automatically exit the function execution an throw the error*/
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.body.imageUrl;
    const creator = req.body.creator
    // Create post in db
    const post = new Post({
        title,
        content,
        imageUrl,
        creator,
    });
    post.save().then(result => {
    //**Status 201 is better if you want to tell the client success and data created*/
        res.status(201).json({
            message: "Post created successfully",
            post: result
        })
    } ).catch(err => {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    })

}


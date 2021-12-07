const {validationResult} = require("express-validator");
const Post = require("../models/post");

const errorHandler = (err, next) => {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
}

exports.getPosts = (req, res, next) => {
//**Error code is super important because we have to show error to client based on our error*/
    Post.find()
        .then(posts => {
            res.status(200).json({message: "Fetched posts successfully", posts: posts})
        })
        .catch(err => {
            errorHandler(err, next);
        });
};

exports.createPost = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error= new Error("Validation failed, entered data is incorrect.");
        error.statusCode = 422;
        //**By throwing error it will automatically exit the function execution an throw the error*/
        throw error;
    }
    console.log("BODY:::",req.body);
    if (!req.file) {
        const error = new Error("No image provided. ");
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = req.file.path.replace("\\" ,"/");
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
        errorHandler(err, next);
    })
};

exports.getPost = (req, res, next) => {
    //**The name "postId" is exactly what we assigned in the route ---->  post/:postId */
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if(!post) {
                const error = new Error("Could not find a post.");
                error.statusCode = 404;
                //**If you throw an error inside then block so it would go to catch block, so next() is not needed.*/
                throw error;
            }
            res.statusCode(200).json({message: "Post fetched", post: post})
        })
        .catch(err => {
            errorHandler(err, next);
        })
}


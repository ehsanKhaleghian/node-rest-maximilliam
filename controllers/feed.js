const {validationResult} = require("express-validator");
const Post = require("../models/post");
const fs = require("fs");
const path = require("path");
const User = require("../models/user")

const errorHandler = (err, next) => {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
};

const clearImage = filePath => {
    filePath = path.join(__dirname, "..", filePath);
    fs.unlink(filePath)
};

exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;
    let totalItems;
    Post.find().countDocuments()
        .then(count => {
            totalItems = count;
            return Post.find()
                .skip((currentPage -1) * perPage)
                .limit(perPage);
        })
//**Error code is super important because we have to show error to client based on our error*/
        .then(posts => {
            res
                .status(200)
                .json({
                    message: "Fetched posts successfully",
                    posts: posts,
                    totalItems
                    })
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
    if (!req.file) {
        const error = new Error("No image provided. ");
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = "http://localhost:8080/"+req.file.path.replace("\\" ,"/");
    //**The userId is passed in the middleware in is-auth*/
    let creator;
    // Create post in db
    const post = new Post({
        title,
        content,
        imageUrl,
        creator:req.userId,
    });
    post.save()
        .then(result => {
            return User.findOne(req.userId)
        })
        .then(user => {
            creator = user;
            user.posts.push(post);
            user.save();
        })
        .then(result => {
                 //**Status 201 is better if you want to tell the client success and data created*/
                res.status(201).json({
                    message: "Post created successfully",
                    post,
                    creator: {id: creator._id, name: creator.name}
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
};

exports.updatePost = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        const error= new Error("Validation failed, entered data is incorrect.");
        error.statusCode = 422;
        //**By throwing error it will automatically exit the function execution an throw the error*/
        throw error;
    }
    const postId = req.params.postId;
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.imageUrl;
    if (req.file) {
        imageUrl = req.file
    }
    if(!imageUrl) {
        const error = new Error("No file picked.");
        error.statusCode = 422;
        throw error;
    }

    Post.findById(postId)
        .then(post => {
            if(!post){
                const error = new Error("Could not find the post.");
                error.statusCode = 404;
                throw error;
            }
            if (post.creator.toString() !== req.userId.toString()) {
                const error = new Error("Not authorized");
                error.statusCode = 403;
                throw error;
            }
            //**To delete image if it is not the same as before*/
            if (imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl)
            }
            post.title = title;
            post.imageUrl = imageUrl;
            post.content = content;
            return post.save();
        })
        .then(result => {
            res.status(200).json({message: "Post updated", post: result})
        })
        .catch(err => {
            errorHandler(err, next);
        })
};

exports.deletePost =(req, res, next) => {
    const postId = req.params.postId;
    Post.findById(postId)
        .then(post => {
            if(!post){
                const error = new Error("Could not find the post.");
                error.statusCode = 404;
                throw error;
            }
            if (post.creator.toString() !== req.userId.toString()) {
                const error = new Error("Not authorized");
                error.statusCode = 403;
                throw error;
            }
            clearImage(post.imageUrl);
            post.findByIdAndRemove(postId);
        })
        .then(result => {
            User.findById(req.userId);
        })
        .then(user => {
            user.posts.pull(postId);
            return user.save();
        })
        .then(result => {
            res.status(200).json({message: "The post is deleted."})
        })
        .catch(err => errorHandler(err, next))
}



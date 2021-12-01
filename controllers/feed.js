exports.getPosts = (req, res, next) => {
//**Error code is super important because we have to show error to client based on our error*/
    res.status(200).json({
        posts: [{title: "First Post", content: "This is the first post"}]
    })
};

exports.createPost = (req, res, next) => {
    const title = req.body.title;
    const content = req.body.content;
    // Create post in db
    //**Status 201 is better if you want to tell the client success and data created*/
    res.status(201).json({
        message: "Post created successfully",
        post : {id: new Date().toISOString(), title:title || "javad", content:content}
    })
}


exports.getPosts = (req, res, next) => {
    res.status(200).json({
        posts: [{title: "First Post", content: "This is the first post"}]
    })
};

//**Error code is super important because we have to show error to client based on our error*/

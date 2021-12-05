const {validationResult} = require("express-validator")

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
        return res.status(422).json({message: "Validation failed entered data is incorrect.", error: errors.array()})
    }
    const title = req.body.title;
    const content = req.body.content;
    // Create post in db
    //**Status 201 is better if you want to tell the client success and data created*/
    res.status(201).json({
        message: "Post created successfully",
        post : {
            _id: new Date().toISOString(),
            title:title || "javad",
            content:content,
            creator:{name: "mamad"},
            createdAt: new Date()
        }
    })
}


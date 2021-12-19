const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        const error = new Error("Not authenticated.");
        error.statusCode = 401;
        throw error
    }
    const token = authHeader.split(" ")[1];
    let decodedToken;
    try {
        //**The second argument in verify is secret key and must be the same with*/
        //**    the one we used in the auth controller*
        decodedToken = jwt.verify(token, "SomeSuperPrivateKey");
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }
    if (!decodedToken) {
        const error = new Error("Not authenticated.");
        error.statusCode = 401;
        throw error;
    }
    //**We passed userId in the controller and now we can extract it from here*/
    req.userId = decodedToken.userId;
    next();
}
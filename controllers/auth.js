const Auth = require("../models/user");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

const errorHandler = (err, next) => {
    if (!err.statusCode) {
        err.statusCode = 500;
    }
    next(err);
};

const customErrorHandler = (errText, statusCode) => {
    const error = new Error(errText)
    error.statusCode = statusCode;
    throw error;
}

exports.signup = (req, res, next) => {
    //**Collect errors from validator which is in the request*/
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error("Validation failed.");
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    bcrypt.hash(password , 12)
        .then(hashedPw => {
           const user = new User({
               email,
               password: hashedPw,
               name,
           });
           return user.save()
        })
        .then(result => {
            res.status.json({message: "User created successfully", userId: result._id})
        })
        .catch(err => errorHandler(err , next))
};

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({email})
        .then(user => {
            if (!user) {
                customErrorHandler("There is no user with this email.", 401)
            }
            loadedUser = user;
            return bcrypt.compare(password, user.password);
        })
        .then(isEqual => {
            if(!isEqual){
                customErrorHandler("Wrong password", 401)
            }
            //**We can add any data we want to the token.*/
            const token = jwt.sign({
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            },
            "SomeSuperPrivateKey",
            {expiresIn: "1h"}
            );
            res.status(200).json({token, userId: loadedUser._id.toString()})
        })
        .catch(err => errorHandler(err, next))
}
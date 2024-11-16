const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');

const getToken = asyncHandler(async req => {
    let token;
    try {
        // get token from header
        token = req.headers.authorization.split(' ')[1];

        // decode the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select('-password');
    }
    catch (err) {
        return [null, err];
    }

    return [token, null];
});

const authorize = asyncHandler(async (req, res, next) => {
    let token, err;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer"))
        [token, err] = await getToken(req);

    if (err) {
        res.status(401);
        throw new Error("Not authorized!");
    }

    if (!token) {
        res.status(401);
        throw new Error("Not authorized, no token!");
    }

    next();
});

const checkUser = asyncHandler(async (req, res, next) => {
    await getToken(req);
    next();
});

module.exports = { authorize, checkUser };
const asyncHandler = require('express-async-handler');
const BanList = require('../models/banUserModel');

const banUser = asyncHandler(async (req, res) => {
    const {banEmail, reason} = req.body
    const accountType = req.user.accountType
    if (accountType !== "admin") {
        res.status(401);
        throw new Error("Permission denied")
    }

    const banUserExists = await BanList.findOne({email: banEmail});
    if (banUserExists) {
        res.status(400);
        throw new Error("The email is already banned");
    }

    const banUser = await BanList.create({
        user: req.user.id,
        reason: reason || 'unknow',
    });

    res.json(banUser);
});

module.exports = { banUser }

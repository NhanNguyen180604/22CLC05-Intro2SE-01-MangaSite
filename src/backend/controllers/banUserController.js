const asyncHandler = require('express-async-handler');
const BanList = require('../models/banUserModel');

const banUser = asyncHandler(async (req, res) => {
    const {id, reason} = req.body
    const accountType = req.user.accountType
    if (accountType !== "admin") {
        res.status(401);
        throw new Error("Permission denied")
    }

    const banUserExists = await BanList.findOne({user: id});
    if (banUserExists) {
        res.status(400);
        throw new Error("The user is already banned");
    }

    const banUser = await BanList.create({
        user: req.user.id,
        reason: reason || 'unknow',
    });

    res.json(banUser);
});

const unbanUser = asyncHandler(async (req, res) => {
    const {id} = req.body
    const accountType = req.user.accountType
    if (accountType !== "admin") {
        res.status(401);
        throw new Error("Permission denied")
    }

    const banUserExists = await BanList.findOne({user: id});
    if (!banUserExists) {
        res.status(400);
        throw new Error("Fails to un-ban (lacking id/user not found in banned list)");
    }

    await BanList.deleteOne({ user: req.user.id });

    res.json({message: "success"});
});

module.exports = { banUser, unbanUser }

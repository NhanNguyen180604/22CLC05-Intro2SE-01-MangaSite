const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Approval = require('../models/approvalRequestModel');
const BanList = require('../models/banUserModel');
const UserNoti = require("../models/userNotificationModel");
const MangaNoti = require("../models/mangaNotificationModel");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cloudinaryWrapper = require('../others/cloudinaryWrapper');

const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('name email accountType avatar.url');
    if (!user) {
        res.status(401);
        throw new Error('You are not logged in');
    }
    res.json(user);
});

const getUsers = asyncHandler(async (req, res) => {
    const { accountType } = await User.findById(req.user.id);
    if (accountType !== 'admin') {
        res.status(401);
        throw new Error('You are not admin');
    }

    let page = req.query.page ? parseInt(req.query.page) : 1;
    const per_page = req.query.per_page ? parseInt(req.query.per_page) : 20;

    // Validation.
    if (Number.isNaN(page) || !Number.isSafeInteger(page) || page <= 0) {
        res.status(400);
        throw new Error("Bad Request: Invalid query page.");
    }

    if (Number.isNaN(per_page) || !Number.isSafeInteger(per_page) || per_page <= 0) {
        res.status(400);
        throw new Error("Bad Request: Invalid query per_page.");
    }

    const filter = { accountType: { $ne: 'admin' }, deletedDate: { $exists: false } };
    const count = await User.countDocuments(filter);
    const total_pages = Math.ceil(count / per_page);
    page = Math.min(page, total_pages);
    page = Math.max(page, 1);
    const skip = (page - 1) * per_page;

    const users = await User.find(filter)
        .skip(skip)
        .limit(per_page)
        .select('email name accountType avatar.url');

    res.status(200).json({
        users: users,
        page: page,
        per_page: per_page,
        total: count,
        total_pages: total_pages,
    });
});

const getUserById = asyncHandler(async (req, res) => {
    const { accountType } = await User.findById(req.user.id);
    if (accountType !== 'admin') {
        res.status(401);
        throw new Error('You are not admin');
    }
    const user = await User.findById(req.params.id).select('email name accountType avatar.url');
    if (!user) {
        res.status(400);
        throw new Error('Wrong user id');
    }
    res.json(user);
});

const updateUserById = asyncHandler(async (req, res) => {
    const { _id } = await User.findById(req.user.id);
    if (!_id) {
        res.status(400);
        throw new Error('You are not logged in');
    }
    if (!req.body.email && !req.body.name) {
        res.status(401);
        throw new Error('No email or name');
    }
    const userUpdate = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
    if (!userUpdate) {
        res.status(402);
        throw new Error('Cannot update user');
    }
    res.json(userUpdate);
});

const changeUserRole = asyncHandler(async (req, res) => {
    const { accountType } = await User.findById(req.user.id);
    if (accountType !== 'admin') {
        res.status(401);
        throw new Error('You are not admin');
    }
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('Wrong user id');
    }

    if (user.accountType === 'admin') {
        res.status(405);
        throw new Error("Not allowed");
    }
    const userUpdate = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('email name accountType');

    if (req.body.accountType === 'approved') {
        await Approval.deleteOne({ user: user._id });
    }

    const userNoti = await UserNoti.create({
        user: user._id,
        message: req.body.accountType === 'approved' ? 'You have become an approved user' : 'You are no longer an approved user',
        read: false,
        createdAt: new Date(),
    });
    res.json(userUpdate);
});

const generateToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET);
}

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        res.status(400);
        throw new Error('Email is not registered');
    }
    if (!await bcrypt.compare(password, user.password)) {
        res.status(401);
        throw new Error('Wrong password');
    }
    if (await BanList.findOne({ user: user._id })) {
        res.status(402);
        throw new Error('The user is banned');
    }
    if (user.deletedDate) {
        res.status(400);
        throw new Error("The user doesn't exist");  // have to xiaoloz
    }
    res.status(201).json({ token: generateToken(user._id) });
});

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Lack of name, email or password');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('Email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
        name,
        email,
        password: hashPassword,
        accountType: 'user',
    });
    res.status(201).json(user);
});

const requestApproval = asyncHandler(async (req, res) => {
    const { _id } = await User.findById(req.user.id);
    if (!_id) {
        res.status(401);
        throw new Error('You are not logged in');
    }

    if (req.user.accountType === 'approved') {
        res.status(400);
        throw new Error("You are already an approved user");
    }

    const approvalExist = await Approval.findOne({ user: _id });
    if (approvalExist) {
        res.status(400);
        throw new Error("Your request form is waiting to be processed");
    }

    const approval = await Approval.create({
        user: _id,
        reason: req.body.reason,
        createdAt: new Date()
    });
    res.json(approval);
});

const getApprovalRequests = asyncHandler(async (req, res) => {
    const accountType = req.user.accountType;
    if (accountType !== "admin") {
        res.status(401);
        throw new Error("Permission denied");
    }

    const approvalRequests = await Approval.find();
    res.json(approvalRequests);
});

const getLibrary = asyncHandler(async (req, res) => {
    const { library } = await User.findById(req.user.id);
    if (!library) {
        res.status(401);
        throw new Error('You are not logged in');
    }
    const lib = await library.populate([
        { path: 'reading', model: 'Manga' },
        { path: 're_reading', model: 'Manga' },
        { path: 'completed', model: 'Manga' }
    ]);
    res.json(lib);
});

const getLibraryTab = asyncHandler(async (req, res) => {
    const { library } = await User.findById(req.user.id);
    const { tab } = req.params;
    if (!library) {
        res.status(401);
        throw new Error("You are not logged in");
    }
    const validTab = ['reading', 're_reading', 'completed'];
    if (!validTab.includes(tab)) {
        res.status(404);
        throw new Error("Invalid tab name");
    }
    const mangaList = await library.populate({ path: 'reading', model: 'Manga' });
    res.json(
        mangaList[tab]
    );
});

const updateLibrary = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    const { tab } = req.params;
    const { id } = req.body;
    if (!user) {
        res.status(401);
        throw new Error("You are not logged in");
    }
    const validTab = ['reading', 're_reading', 'completed'];
    if (!validTab.includes(tab)) {
        res.status(400);
        throw new Error("Invalid tab name");
    }
    validTab.forEach(t => {
        if (t !== tab) {
            user.library[t] = user.library[t].filter(mangaId => mangaId.toString() !== id);
        }
    })
    if (!user.library[tab].includes(id)) {
        user.library[tab].push(id);
    }
    await user.save();
    res.json({
        tab,
        mangas: user.library[tab]
    });
});

const deleteFromLibrary = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    const { tab, id } = req.params;
    if (!user) {
        res.status(401);
        throw new Error("You are not logged in");
    }
    const validTab = ['reading', 're_reading', 'completed'];
    if (!validTab.includes(tab)) {
        res.status(400);
        throw new Error("Invalid tab name");
    }
    if (!user.library[tab].includes(id)) {
        res.status(404);
        throw new Error("Manga not found in the library");
    }
    user.library[tab] = user.library[tab].filter(mangaId => mangaId.toString() !== id);
    await user.save();
    res.json({
        tab,
        mangas: user.library[tab]
    });
});

const getBlacklist = asyncHandler(async (req, res) => {
    const { blacklist } = await User.findById(req.user.id);
    if (!blacklist) {
        res.status(401);
        throw new Error("You are not logged in");
    }
    const realblacklist = await blacklist.populate([{ path: 'authors', model: 'Author' }
        , { path: 'categories', model: 'Category' }]);

    res.json(realblacklist);
});

const updateBlacklist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        res.status(401);
        throw new Error("You are not logged in");
    }
    if (!req.body.blacklist && !req.body.blacklist.categories && !req.body.blacklist.authors) {
        res.status(400);
        throw new Error("No categories or authors");
    }
    const updateUser = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
    res.json(updateUser.blacklist);
});

const banUser = asyncHandler(async (req, res) => {
    const { id, reason } = req.body
    const accountType = req.user.accountType
    if (accountType !== "admin") {
        res.status(401);
        throw new Error("Permission denied")
    }

    const banUserExists = await BanList.findOne({ user: id });
    if (banUserExists) {
        res.status(400);
        throw new Error("The user is already banned");
    }

    const banUser = await BanList.create({
        user: id,
        reason: reason || 'unknow',
    });

    const userNoti = await UserNoti.create({
        user: id,
        message: "You are banned, reason: " + reason,
        read: false,
        createdAt: new Date(),
    });

    res.json(banUser);
});

const unbanUser = asyncHandler(async (req, res) => {
    const { id } = req.body
    const accountType = req.user.accountType
    if (accountType !== "admin") {
        res.status(401);
        throw new Error("Permission denied")
    }

    const banUserExists = await BanList.findOne({ user: id });
    if (!banUserExists) {
        res.status(400);
        throw new Error("Fails to un-ban (lacking id/user not found in banned list)");
    }

    await banUserExists.deleteOne();

    res.json({ message: "success" });
});

const getBannedUser = asyncHandler(async (req, res) => {
    const accountType = req.user.accountType
    if (accountType !== "admin") {
        res.status(401);
        throw new Error("Permission denied")
    }

    const bannedUsers = await BanList.find();
    res.status(200).json(bannedUsers);
});

const notifyUser = asyncHandler(async (req, res) => {
    const { id: userId, message } = req.body;

    if (req.user.accountType !== "admin") {
        res.status(401);
        throw new Error("Permission denied");
    }

    const userNotification = await UserNoti.create({
        user: userId,
        message,
        createdAt: new Date(),
    });

    res.json(userNotification);
});

const getUserNoti = asyncHandler(async (req, res) => {
    const userNotifications = await UserNoti.find({
        user: req.user.id,
    });

    const library = [
        ...req.user.library.reading,
        ...req.user.library.completed,
        ...req.user.library.re_reading,
    ]

    library.forEach(async( manga) => {
        const mangaNotis = await MangaNoti.find({
            manga: manga
        })
        mangaNotis.forEach(async mangaNoti => {
            if (
              !userNotifications.some((userNoti) =>
                mangaNoti._id.equals(userNoti.mangaNoti),
              )
            ) {
              const newUserNoti = await UserNoti.create({
                  user: req.user.id,
                  message: mangaNoti.message,
                  mangaNoti: mangaNoti._id,
                  createdAt: mangaNoti.createdAt,
              })
              userNotifications.push(newUserNoti)
            }
        })
    })

    res.json(userNotifications);
});

const readUserNoti =  asyncHandler(async (req, res) => {
    const noti = await UserNoti.findById(req.params.id)
    if (!noti.user.equals(req.user._id)) {
        res.status(401)
        throw new Error('Permission denied')
    }
    const updated = await noti.updateOne({read: true})
    res.json(updated)
})

const updateUserAvatar = asyncHandler(async (req, res) => {
    const { avatar } = req.files;
    const user = await User.findById(req.user.id);
    if (!user) {
        res.status(401);
        throw new Error("You are not logged in");
    }
    if (!avatar) {
        res.status(400);
        throw new Error("No image provided");
    }
    if (user.avatar && user.avatar.publicID) {
        await cloudinaryWrapper.deleteResources(user.avatar.publicID);
    }
    const [publicID, url] = await cloudinaryWrapper.uploadSingleImage(avatar.data, `avatar/${req.user.id}`);
    if (!publicID || !url) {
        res.status(402);
        throw new Error("Failed to upload image to cloudinary");
    }
    const newAvatar = {
        avatar: { url, publicID }
    };
    const updateAvatarUser = await User.findByIdAndUpdate(req.user.id, newAvatar, { new: true });
    // user.updateOne(newAvatar, {new: true})
    if (!updateAvatarUser) {
        res.status(500);
        throw new Error("Failed to update user avatar");
    }
    res.status(201).json(updateAvatarUser.avatar.url);
});

const deleteUserAvatar = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) {
        res.status(401);
        throw new Error("You are not logged in");
    }
    if (!user.avatar.publicID) {
        res.status(400);
        throw new Error("You don't have an avatar");
    }

    await cloudinaryWrapper.deleteResources(user.avatar.publicID);
    const deletedAvatar = {
        avatar: { url: "", publicID: "" }
    };
    await User.findByIdAndUpdate(req.user.id, deletedAvatar, { new: true });
    // user.updateOne(newAvatar, {new: true})    
    res.json({ message: 'Succesfully deleted avatar' });
});

const deleteMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user.deletedDate) {
        res.status(400);
        throw new Error("What the hellllllll");
    }

    user.deletedDate = new Date();
    await user.save();
    res.status(200).json({ deletedDate: user.deletedDate });
});

module.exports = {
    getMe,
    getUsers,
    getUserById,
    registerUser,
    loginUser,
    requestApproval,
    getApprovalRequests,
    changeUserRole,
    getLibrary,
    updateLibrary,
    deleteFromLibrary,
    getLibraryTab,
    getBlacklist,
    updateBlacklist,
    banUser,
    unbanUser,
    getBannedUser,
    notifyUser,
    getUserNoti,
    readUserNoti,
    updateUserAvatar,
    deleteUserAvatar,
    updateUserById,
    deleteMe,
};


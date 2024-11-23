const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const Approval = require('../models/approvalRequestModel');
const BanList = require('../models/banUserModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('name email accountType');
    if(!user){
        res.status(401);
        throw new Error('You are not logged in');
    }
    res.json(user);
});

const getUsers = asyncHandler(async (req, res) => {
    const { accountType } = await User.findById(req.user.id);
    if( accountType !== 'admin'){
        res.status(401);
        throw new Error('You are not admin');
    }
    const users = await User.find().select('email name accountType');
    res.json(users.filter(user => user.accountType !== 'admin'));
});

const getUserById = asyncHandler(async (req, res) => {
    const { accountType } = await User.findById(req.user.id);
    if( accountType !== 'admin'){
        res.status(401);
        throw new Error('You are not admin');
    }
    const user = await User.findById(req.params.id).select('email name accountType');
    if(!user){
        res.status(400);
        throw new Error('Wrong user id');
    }
    res.json(user);
});

const changeUserRole = asyncHandler(async (req, res) => {
    const { accountType } = await User.findById(req.user.id);
    if( accountType !== 'admin'){
        res.status(401);
        throw new Error('You are not admin');
    }
    const user = await User.findById(req.params.id);
    if(!user){
        res.status(404);
        throw new Error('Wrong user id');
    }
    const userUpdate = await User.findByIdAndUpdate(req.params.id, req.body, {new: true}).select('email name accountType');
    res.json(userUpdate);    
});

const generateToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET);
}

const loginUser = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if(!user){
        res.status(400);
        throw new Error('Email is not registered');
    }
    if(!await bcrypt.compare(password, user.password)){
        res.status(400);
        throw new Error('Wrong password');
    } 
    if(await BanList.findOne({user: user._id})){
        res.status(401);
        throw new Error('The user is banned');
    }    
    res.status(201).json({token: generateToken(user._id)});    
});

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if ( !name || !email || !password ){
        res.status(400);
        throw new Error('Lack of name, email or password');
    }

    const userExists = await User.findOne({email});
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
    res.status(201).json({ token: generateToken(user._id)});
});

const requestApproval = asyncHandler(async (req, res) => {
    const { _id } = await User.findById(req.user.id);
    if(!_id){
        res.status(401);
        throw new Error('You are not logged in');
    }
    const approval = await Approval.create({
        user: _id,
        reason: req.body.reason,
        createdAt: new Date()
    });
    res.json(approval);
});

const getLibrary = asyncHandler(async (req, res) => {
    const {library} = await User.findById(req.user.id);
    if(!library){
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
    const {library} = await User.findById(req.user.id);
    const {tab} = req.params;
    if(!library){
        res.status(401);
        throw new Error("You are not logged in");
    }
    const validTab = ['reading', 're_reading', 'completed'];
    if(!validTab.includes(tab)){
        res.status(404);
        throw new Error("Invalid tab name");
    }
    const mangaList = await library.populate({path: 'reading', model: 'Manga'});
    res.json(
        mangaList[tab]
    );
});

const updateLibrary = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    const {tab} = req.params;
    const {id} = req.body;
    if(!user){
        res.status(401);
        throw new Error("You are not logged in");
    }
    const validTab = ['reading', 're_reading', 'completed'];
    if(!validTab.includes(tab)){
        res.status(400);
        throw new Error("Invalid tab name");
    }
    validTab.forEach(t => {
        if(t !== tab){
            user.library[t] = user.library[t].filter(mangaId => mangaId.toString() !== id);
        }
    })
    if (!user.library[tab].includes(id)){
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
    const {tab, id} = req.params;
    if(!user){
        res.status(401);
        throw new Error("You are not logged in");
    }
    const validTab = ['reading', 're_reading', 'completed'];
    if(!validTab.includes(tab)){
        res.status(400);
        throw new Error("Invalid tab name");
    }
    if (!user.library[tab].includes(id)){
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
    const {blacklist} = await User.findById(req.user.id);
    if(!blacklist){
        res.status(401);
        throw new Error("You are not logged in");
    }
    res.json(blacklist);
});

const updateBlacklist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if(!user){
        res.status(401);
        throw new Error("You are not logged in");
    }
    if(!req.body.blacklist.categories && !req.body.blacklist.authors){
        res.status(400);
        throw new Error("No categories or authors");
    }
    const updateUser = await User.findByIdAndUpdate(req.user.id, req.body, {new: true}); 
    res.json(updateUser.blacklist);
});


module.exports = {getMe, getUsers, getUserById, registerUser, loginUser, requestApproval, changeUserRole, getLibrary, updateLibrary, deleteFromLibrary, getLibraryTab, getBlacklist, updateBlacklist};


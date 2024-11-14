const mongoose = require('mongoose');

const userNotiSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    manga: {
        type: String,
    },
    read: {
        type: Boolean,
        default: false,
        required: true,
    },
    createdAt: {
        type: Date,
        expires: '180d',
        required: true,
    },
});

module.exports = mongoose.model('UserNoti', userNotiSchema);
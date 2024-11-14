const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    manga: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manga',
        required: true,
    },
    chapter: {
        type: Number,
        required: true,
    },
},
    { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);
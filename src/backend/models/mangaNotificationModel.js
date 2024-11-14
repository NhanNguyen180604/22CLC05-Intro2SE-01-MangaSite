const mongoose = require('mongoose');

const mangaNotiSchema = new mongoose.Schema({
    manga: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manga',
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        expires: '50d',
        required: true,
    },
});

module.exports = mongoose.model('MangaNoti', mangaNotiSchema);
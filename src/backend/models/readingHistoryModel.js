const mongoose = require('mongoose');

const readingHistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    manga: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manga',
        required: true,
    },
    chapters: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chapter',
            required: true,
        }
    ],
});

module.exports = mongoose.model('ReadingHistory', readingHistorySchema);
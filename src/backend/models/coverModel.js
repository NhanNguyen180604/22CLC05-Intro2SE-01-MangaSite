const mongoose = require('mongoose');

const coverSchema = new mongoose.Schema({
    manga: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manga',
        required: true,
    },
    number: {
        type: Number,
        required: true,
    },
    imageURL: {
        type: String,
        required: true,
    },
    imagePublicID: {
        type: String,
    },
});

coverSchema.index({ manga: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('Cover', coverSchema);
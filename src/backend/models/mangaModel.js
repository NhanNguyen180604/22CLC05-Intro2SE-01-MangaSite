const mongoose = require('mongoose');

const mangaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    authors: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Author',
            required: true,
        }
    ],
    categories: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        }
    ],
    cover: {
        type: String,
    },
    description: {
        type: String,
        required: true,
        default: '',
    },
    status: {
        type: String,
        required: true,
        enum: ['In progress', 'Completed', 'Suspended'],
    },
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    canComment: {
        type: Boolean,
        required: true,
        default: true,
    }
},
    { timestamps: true }
);

mangaSchema.index({ name: 'text' });

module.exports = mongoose.model('Manga', mangaSchema);
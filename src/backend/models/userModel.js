const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        url: {
            type: String
        },
        publicID:{
            type: String
        }
    },
    library: {
        reading: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Manga'
            }
        ],
        completed: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Manga'
            }
        ],
        re_reading: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Manga'
            }
        ],
    },
    blacklist: {
        categories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Category'
            }
        ],
        authors: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Author'
            }
        ]
    },
    accountType: {
        type: String,
        required: true,
        enum: ["admin", "approved", "user"]
    }
});

module.exports = mongoose.model('User', userSchema);
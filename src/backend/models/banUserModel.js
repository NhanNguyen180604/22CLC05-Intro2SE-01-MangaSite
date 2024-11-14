const mongoose = require('mongoose');

const banUserSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('BanUser', banUserSchema);
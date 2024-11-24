const mongoose = require('mongoose');
const Manga = require('./mangaModel');

const ratingSchema = new mongoose.Schema({
    manga: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Manga',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    score: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
});

ratingSchema.post('save', async function () {
    const Rating = this.constructor;
    const mangaID = this.manga;

    const stats = await Rating.aggregate([
        { $match: { manga: mangaID } },
        { $group: { _id: '$manga', averageRating: { $avg: '$score' } } },
    ]);

    const averageRating = stats.length > 0 ? stats[0].averageRating : 0;

    // update the manga's overall rating
    await Manga.findByIdAndUpdate(mangaID, { overallRating: averageRating });
});

module.exports = mongoose.model('Rating', ratingSchema);
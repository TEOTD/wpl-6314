const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
    user_id: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    activity_type: {
        type: String,
        enum: ['photo-upload', 'comment-added', 'user-registered', 'user-login', 'user-logout'],
        required: true
    },
    photo_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Photo', default: null},
    comment_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Photo', default: null},
    comment_owner_id: {type: mongoose.Schema.Types.ObjectId, ref: 'Photo', default: null},
    timestamp: {type: Date, default: Date.now}
});

const Activity = mongoose.model('Activity', ActivitySchema);
module.exports = Activity;
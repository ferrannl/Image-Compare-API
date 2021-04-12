const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const SubmissionSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    photo: {
        type: String,
        required: true,
        unique: true,
    },
    target: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Target'
    },
    score: {
        type: Number
    }
});

const SubmissionModel = mongoose.model('Submission', SubmissionSchema);

module.exports = SubmissionModel;
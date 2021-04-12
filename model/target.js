const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TargetSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: false,
    },
    photo: {
        type: String,
        required: true,
    },
    lon: {
        type: Number,
        required: true,
        unique: false
    },
    lat: {
        type: Number,
        required: true,
        unique: false
    },
    radius: {
        type: Number,
        required: true,
        unique: false
    },
    description: {
        type: String,
        unique: false
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    submissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Submission'
    }],
    votes: [{
        user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
        vote: {
            type: Number,
            required: true,
            min: [-1, 'Vote is to low!'],
            max: [1, 'Vote is to high!']

        }
    }],
},
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        timestamps: true
    });


TargetSchema.virtual('reputation').get(function () {
    const target = this;
    let rep = 0;
    target.votes.forEach(element => {
        rep += element.vote;
    });
    return rep;
});

const TargetModel = mongoose.model('Target', TargetSchema);

module.exports = TargetModel;

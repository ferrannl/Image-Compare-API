const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const RoleSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
});

const RoleModel = mongoose.model('Role', RoleSchema);

module.exports = RoleModel;
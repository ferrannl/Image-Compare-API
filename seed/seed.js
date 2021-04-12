require('dotenv').config();
const config = require('../config/config');
const url = config.mongo_connection_string

const mongoose = require('mongoose');

mongoose.set("useCreateIndex", true);
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('database connected');
    mongoose.connection.dropDatabase();
    console.log('database dropped');
    require('./seedData');
    console.log('database seeded');


}).catch(err => {
    console.error(err);
});
const dotenv = require('dotenv');
dotenv.config({ path: '.env' });
const express = require('express');
const mongoose = require('mongoose');
const config = require('./config/config');
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require('path');
var app = express();
const socket = require("socket.io");
const resultController = require("./controller/result");
mongoose.connect(config.mongo_connection_string, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
mongoose.set("useCreateIndex", true);
mongoose.connection.on('error', error => console.log(error));

var dir = path.join(__dirname, 'public');

app.use(express.static(dir));

const index = require('./routes/index');
const targetsRoute = require('./routes/targets');
const usersRoute = require('./routes/users');
app.use('/', index);
app.use('/users', usersRoute);

app.use('/targets', targetsRoute);

// Handle errors.
app.use(function (err, req, res, next) {
  if (!err.statusCode) err.statusCode = 500;
  return res
    .status(err.statusCode)
    .send(resultController.getResult({ error: err.toString() }, req));
});

const server = app.listen(config.port, () => {
  console.log('Server started.')
});
const io = socket(server);

io.on("connection", function (socket) {
  console.log("Made socket connection");
});
module.exports = app;

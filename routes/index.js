var express = require('express');
var router = express.Router();
var userController = require('../controller/user');
const auth = require('../middleware/authJwt');

/* GET home page. */
router.get('/', function (req, res, next) {
  res.send({ welcome: 'Welcome to api' });
});
router.post('/login', userController.login);
router.post('/signup', userController.create);
router.get('/achievements', auth.verifyToken, auth.authenticateRole(["user", "admin"]), userController.getAchievements);

module.exports = router;

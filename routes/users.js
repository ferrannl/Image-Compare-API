var express = require('express');
var router = express.Router();
var userController = require('../controller/user');
const auth = require('../middleware/authJwt');

/* GET home page. */
router.get('/', auth.verifyToken, auth.authenticateRole(["admin"]), userController.getAll);
router.delete('/:id', auth.verifyToken, auth.authenticateRole(["admin"]), userController.delete);
router.get('/:id', auth.verifyToken, auth.authenticateRole(["admin"]), userController.getOne);
router.put('/:id', auth.verifyToken, auth.authenticateRole(["admin"]), userController.update);
router.get('/:id/targets/:tname/votes/:vote', auth.verifyToken, auth.authenticateRole(["admin"]), userController.getVotes);

module.exports = router;

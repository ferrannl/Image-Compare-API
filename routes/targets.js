const express = require('express');
const router = express.Router();
const auth = require('../middleware/authJwt');
const controller = require('../controller/target');
const uploadController = require('../controller/upload');

router.post('/:id/submissions', auth.verifyToken, auth.authenticateRole(["user", "admin"]), uploadController.uploader, controller.createSubmission);
router.get('/submissions/:id', auth.verifyToken, auth.authenticateRole(["user", "admin"]), controller.getOneSubmission)
router.get('/nearby/:lon/:lat', auth.verifyToken, auth.authenticateRole(["user", "admin"]), controller.getNearby);
router.delete('/submissions/:id', auth.verifyToken, auth.authenticateRole(["admin"]), controller.deleteSubmission);
router.delete('/:id', auth.verifyToken, auth.authenticateRole(["admin"]), controller.delete);
router.get('/', auth.verifyToken, auth.authenticateRole(["user", "admin"]), controller.getAll);
router.get('/:id', auth.verifyToken, auth.authenticateRole(["user", "admin"]), controller.getOne);
router.get('/:id/submissions', auth.verifyToken, auth.authenticateRole(["user", "admin"]), controller.getAllSubmissions);
router.post('/', auth.verifyToken, auth.authenticateRole(["user", "admin"]), uploadController.uploader, controller.create);
router.put('/:id', auth.verifyToken, auth.authenticateRole(["user", "admin"]), controller.update);
router.put('/:id/vote', auth.verifyToken, auth.authenticateRole(["user", "admin"]), controller.reputation);

module.exports = router;
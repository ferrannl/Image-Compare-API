const multer = require('multer');
const mime = require('mime');
var fs = require('fs');

// multer options
const upload = multer({
    dest: 'public/images',
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            cb(new Error('Please upload an image.'))
        }
        cb(undefined, true)
    }
}).single('image');

exports.uploader = (req, res, next) => {
    upload(req, res, function (err) {
        if (req.fileValidationError) {
            return res.send(req.fileValidationError);
        } else if (!req.file) {
            return res.send('Please select an image to upload');
        } else if (err instanceof multer.MulterError) {
            return res.send(err);
        } else if (err) {
            return res.send(err);
        }
        fs.renameSync(req.file.path, req.file.path + '.' + mime.extension(req.file.mimetype));
        req.file.path = "images/" + req.file.filename +'.' + mime.extension(req.file.mimetype);
        next();
    });
};

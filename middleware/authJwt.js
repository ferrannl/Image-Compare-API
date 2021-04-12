const jwt = require("jsonwebtoken");
const config = require("../config/config.js");

exports.verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];
    if (!token) {
        return res.status(403).send({ message: "No token provided!" });
    }

    jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: "Unauthorized!" });
        }
        req.userId = decoded.user.id;
        req.role = decoded.user.role.name;
        next();
    });
};

exports.authenticateRole = (rolesArray) => (req, res, next) => {
    let decoded = jwt.verify(req.headers["x-access-token"], config.secret);
    let authorized = false;
    const roleName = decoded.user.role.name;
        for (var i = 0; i < rolesArray.length; i++) {
          authorized = roleName === rolesArray[i];
          if (authorized){
            break;
          }
        }
    if (authorized) {
        return next();
    }
    return res.status(401).json({
        success: false,
        message: 'Unauthorized',
    })
};

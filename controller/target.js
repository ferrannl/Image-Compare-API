const UserModel = require("../model/user");
const RoleModel = require("../model/role");
const TargetModel = require("../model/target");
const SubmissionModel = require("../model/submission");
const got = require('got');
const config = require('../config/config');
const jwt = require('jsonwebtoken');
const resultController = require("./result");

exports.getAll = async (req, res, next) => {
  try {
    let page = req.query.page ?? "1";
    let limit = req.query.limit ?? "5";
    let query = {};
    if (req.query.name != null) {
      query.name = req.query.name;
    }
    if (req.query.submissions != null) {
      if (req.query.submissions > 0) {
        query["submissions." + (req.query.submissions - 1).toString()] = { "$exists": true };
      } else {
        query.submissions = { $size: 0 };
      }

    }
    targets = await TargetModel.find(query).limit(limit * 1).skip((page - 1) * limit).exec();
    let returns = {
      targets: targets,
      page: page,
      limit: limit
    };

    return res.send(resultController.getResult(returns, req));
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const target = await TargetModel.findById(req.params.id);
    return res.send(resultController.getResult(target, req));
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.userId);
    const target = {
      name: req.body.name,
      user: req.userId,
      photo: req.file.path ?? 'undefined.jpeg',
      lon: req.body.lon,
      lat: req.body.lat,
      radius: req.body.radius,
    };
    const createdTarget = await TargetModel.create(target);
    user.targets.push(createdTarget._id);
    await user.save();
    return res.send(resultController.getResult(createdTarget, req));
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    let usingTarget = await TargetModel.findById(req.params.id);

    if (usingTarget.userId != req.userId && req.role != "admin") {
      return res.status(401).send({ message: "Unauthorized!" });
    }
     usingTarget.name = req.body.name ?? usingTarget.name;
     usingTarget.lon = req.body.lon ?? usingTarget.lon;
     usingTarget.lat = req.body.lat ?? usingTarget.lat;
     usingTarget.radius = req.body.radius ?? usingTarget.radius;
     usingTarget.description = req.body.description ?? usingTarget.description;
    const result = await usingTarget.save();
    return res.send(resultController.getResult(result, req));
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const target = await TargetModel.deleteOne({ _id: req.params.id });
    let user = await UserModel.findOne({ targets: req.params.id });
    if (user != null) {
      const index = user.targets.indexOf(req.params.id);
      user.targets.splice(index, 1);
      const userEdited = await user.save();
    }
    const submissions = await SubmissionModel.deleteMany({ target: req.params.id });
    return res.send(resultController.getResult({ message: "Target and submissions deleted" }, req));
  } catch (err) {
    next(err);
  }
};

exports.getAllSubmissions = async (req, res, next) => {
  try {
    let submissions = await SubmissionModel.find({ target: req.params.id }).populate("target").populate("user");
    submissionsList = [];
    submissions.forEach((item, i) => {
      let submission = {
        id: item._id,
        score: item.score,
        user: item.user.email,
        userId: item.user._id,
        target: item.target.name,
        targetId: item.target._id,
      };
      submissionsList.push(submission);
    });
    return res.send(resultController.getResult(submissionsList, req));
  } catch (err) {
    next(err);
  }
};

exports.getOneSubmission = async (req, res, next) => {
  try {
    const submission = await SubmissionModel.findById(req.params.id).populate("target").populate("user");
    let submissionForReturn = {
      id: submission._id,
      score: submission.score,
      user: submission.user.email,
      userId: submission.user._id,
      target: submission.target.name,
      targetId: submission.target._id,
    }
    return res.send(resultController.getResult(submissionForReturn, req));
  } catch (err) {
    next(err);
  }
};

exports.deleteSubmission = async (req, res, next) => {
  try {
    const target = await TargetModel.findOne({ submissions: req.params.id });
    if (target != null) {
      const index = target.submissions.indexOf(req.params.id);
      target.submissions.splice(index, 1);
      const targetEdited = await target.save();
    }
    const submission = await SubmissionModel.findById(req.params.id).remove();
    return res.send(resultController.getResult({ message: "Submission deleted" }, req));
  } catch (err) {
    next(err);
  }
};

exports.createSubmission = async (req, res, next) => {
  try {
    let usingTarget = await TargetModel.findById(req.params.id);
    let imageUrl;
    let image2Url;
    if (config.host.includes("localhost")) {
      imageUrl = "https://images-na.ssl-images-amazon.com/images/I/51IMoEwxy6L._AC_SX466_.jpg";
      image2Url = "https://images-na.ssl-images-amazon.com/images/I/61sr-aUoz4L._AC_SL1000_.jpg";
    } else {
      imageUrl = config.host + "/" + req.file.path;
      image2Url = config.host + "/" + usingTarget.photo;
    }
    const score = await imageCompare(imageUrl, image2Url, next);
    const submission = {
      user: req.userId,
      photo: req.file.path,
      score: (100-score),
      target: req.params.id
    };
    const createdSubmission = await SubmissionModel.create(submission);
    usingTarget.submissions.push(createdSubmission);
    const result = await usingTarget.save();
    return res.send(resultController.getResult(createdSubmission, req));
  } catch (err) {
    next(err);
  }
};

exports.reputation = async (req, res, next) => {
  try {
    let usingTarget = await TargetModel.findById(req.params.id);
    const vote = {
      user: req.userId,
      vote: req.body.vote
    };
    usingTarget.votes.push(vote);
    let result = await usingTarget.save();
    return res.send(resultController.getResult(result, req));
  } catch (err) {
    next(err);
  }
};

async function imageCompare(imageUrl, imageUrl2, next) {
  try {
    const apiKey = 'acc_622abc6c3a506e0';
    const apiSecret = 'a4a0847759e78e8d64b2a25a35d571c1';
    const categorizer = "general_v3";
    const url = 'https://api.imagga.com/v2/images-similarity/categories/' + categorizer + '?image_url=' + encodeURIComponent(imageUrl) + '&image2_url=' + encodeURIComponent(imageUrl2);
    const response = await got(url, { username: apiKey, password: apiSecret });
    const distance = (JSON.parse(response.body).result.distance * 50);
    return distance;
  } catch (err) {
    next(err);
  }
}

exports.getNearby = async (req, res, next) => {
  try {
    let nearbyTargets = [];
    let usingTargets = await TargetModel.find();
    usingTargets.forEach(element => {
      let distance = Math.sqrt((req.params.lon - element.lon) ** 2 + (req.params.lat - element.lat) ** 2)
      if ((distance * 100) <= 5) {
        nearbyTargets.push(element);
      }
    });
    return res.send(resultController.getResult(nearbyTargets, req));
  } catch (err) {
    next(err);
  }
}

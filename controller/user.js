const UserModel = require("../model/user");
const RoleModel = require("../model/role");
const TargetModel = require("../model/target");
const SubmissionModel = require("../model/submission");
const resultController = require("./result");

const config = require('../config/config');
const jwt = require('jsonwebtoken');


exports.getAll = async (req, res, next) => {
  try {
    let page = req.query.page ?? "1";
    let limit = req.query.limit ?? "5";
    let query = {};
    if (req.query.email != null) {
      query.email = req.query.email;
    }
    if (req.query.role != null) {
      const userRole = await RoleModel.findOne({ name: req.query.role });
      if (userRole != null) {
        query.role = userRole._id;
      }
    }
    let users = await UserModel.find(query).populate("role").limit(limit * 1).skip((page - 1) * limit).exec();
    let userList = [];
    users.forEach((item, i) => {
      let user = {
        id: item._id,
        email: item.email,
        role: item.role.name
      };
      userList.push(user);
    });

    let returns = {
      users: userList,
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

    let user = await UserModel.findById(req.params.id).populate("role");
    let userResponse = {
      id: user._id,
      email: user.email,
      role: user.role.name,
      targets: user.targets
    }
    return res.send(resultController.getResult(userResponse, req));
  } catch (err) {
    next(err);
  }

};
exports.getAchievements = async (req, res, next) => {
  try {
    let submissions = await SubmissionModel.find({ user: req.userId }).populate("target");
    achievementList = [];
    submissions.forEach((item, i) => {
      let achievementsResponse = {
        id: item._id,
        score: item.score,
        achieved: (item.score >= 80),
        target: item.target.name,
        targetId: item.target._id
      }
      achievementList.push(achievementsResponse);
    });
    return res.send(resultController.getResult(achievementList, req));
  } catch (err) {
    next(err);
  }

};
exports.create = async (req, res, next) => {
  try {
    const userRole = await RoleModel.findOne({ name: "user" });
    let email = req.body.email;
    let password = req.body.password;
    const user = await UserModel.create({ email, password, role: userRole._id });
    return res.send(resultController.getResult(user, req));
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    let user = await UserModel.findById(req.params.id).populate("role");
    const userRole = await RoleModel.findOne({ name: req.body.role ?? user.role.name });
    user.email = req.body.email ?? user.email;
    user.role = userRole._id;
    const result = await user.save();
    return res.send(resultController.getResult(user, req));
  } catch (err) {
    next(err);
  }
};

exports.delete = async (req, res, next) => {
  try {
    const target = await TargetModel.deleteMany({ user: req.params.id });
    const submissions = await SubmissionModel.deleteMany({ user: req.params.id });
    const user = await UserModel.deleteOne({ _id: req.params.id });
    return res.send(resultController.getResult({ message: "Target and submissions deleted" }, req));
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await UserModel.findOne({ email });

    if (!user) {
      return res.send(resultController.getResult({ message: 'User not found' }, req));
    }

    const validate = await user.isValidPassword(password);

    if (!validate) {
      return res.send(resultController.getResult({ message: 'Wrong Password' }, req));
    }
    const role = await RoleModel.findOne({ _id: user.role });
    const body = { id: user._id, email: user.email, role: role };
    const token = jwt.sign({ user: body }, config.secret);
    return res.send(resultController.getResult({ token: token }, req));
  } catch (err) {
    next(err);
  }
};

exports.getVotes = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id).populate("targets");
    let result = [];
    user.targets.forEach(element => {
      if (element.name == req.params.tname) {
        element.votes.forEach(vote => {
          if(vote.vote == req.params.vote){
            result.push(vote);
          }
        });
      }
    });
    return res.send(resultController.getResult(result, req));
  } catch (err) {
    next(err);
  }
}

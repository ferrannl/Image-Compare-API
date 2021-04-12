const UserModel = require('../model/user');
const RoleModel = require('../model/role');
const TargetModel = require('../model/target');
const SubmissionModel = require('../model/submission');

(async () => {
    let adminRole1 = await RoleModel.create({ name: 'admin' });

    let userRole1 = await RoleModel.create({ name: 'user' });

    let adminRole = await RoleModel.find({ name: 'admin' });

    let userRole = await RoleModel.find({ name: "user" });

    let adminUser = await UserModel.create({ email: 'adminUser@user.nl', password: 'Welkom01', role: adminRole[0]._id });

    let userUser = await UserModel.create({ email: 'userUser@user.nl', password: 'Welkom01', role: userRole[0]._id });

    let submission = await SubmissionModel.create({ user: adminUser._id, photo: "moet op foto1 lijken", score: 0 });

    let submission2 = await SubmissionModel.create({ user: userUser._id, photo: "moet op foto2 lijken", score: 1 });

    // let target = await TargetModel.create({ name: 'nick', photo: 'foto1', lon: 5.342345237731934, lat: 51.77390670776367, radius: 69, user: adminUser._id });
    let target = await TargetModel.create({ name: 'nick', photo: 'foto1', lon: 5.342345237731934, lat: 51.77390670776367, submissions: [submission, submission2], radius: 69, user: adminUser._id });
    adminUser.targets.push(target._id);
    adminUser.save();
    // let target2 = await TargetModel.create({ name: 'ferran', photo: 'foto2', lon: 5.3125224113464355, lat: 51.704593658447266, radius: 69, user: userUser._id });

    let submissionEdit = { target: target._id };

    submission = await SubmissionModel.findByIdAndUpdate(submission._id, submissionEdit);

    submission2 = await SubmissionModel.findByIdAndUpdate(submission2._id, submissionEdit);


})().exit;

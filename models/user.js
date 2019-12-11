var mongoose = require("mongoose"),
    passportLocalMongoose = require("passport-local-mongoose");


var UserSchema = new mongoose.Schema({
    username: {type:String, unique: true, required: true},
    password: String,
    //設定管理者權限參數
    avatar: String,
    firstName: String,
    lastName: String,
    email: {type: String, unique: true, required: true},
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isAdmin: {type: Boolean, default: false}
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",  UserSchema);
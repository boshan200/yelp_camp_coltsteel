//all the middleware goes here
var middlewareObj = {};
var Campground = require("../models/campground"),
    Comment = require("../models/comment");
//檢查使用者登入以及使用者是否等於創建者
middlewareObj.checkCampgroundOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        // is user logged in   
        Campground.findById(req.params.id, function(err, foundCampground){
            if(err){
                req.flash("error", "Campground not found");
                res.redirect("back");
            }else{
                // does user own the campground?
                if(foundCampground.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error", "you dont have permission!");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to LoggedIn!!");
        res.redirect("back");
    }
}

//檢查使用者登入以及使用者是否等於創建者
middlewareObj.checkCommentOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        // is user logged in   
        Comment.findById(req.params.comment_id, function(err, foundComment){
            if(err){
                req.flash("error", "Campground not found!!");
                res.redirect("back");
            }else{
                // does user own the campground?
                if(foundComment.author.id.equals(req.user._id)){
                    next();
                } else {
                    req.flash("error", "You do not have permission!!");
                    res.redirect("back");
                }
            }
        });
    } else {
        res.redirect("back");
    }
}

//middleware to check if user is logged or not
middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please Login First!");
    res.redirect("/login");

}


module.exports = middlewareObj
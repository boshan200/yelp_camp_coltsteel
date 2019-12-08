var express    = require("express");
var router     = express.Router(),
    passport   = require("passport"),
    User       = require("../models/user");
    Campground = require("../models/campground");

//root route
router.get("/", function(req, res){
    res.render("landing");
});

//register form
router.get("/register", function(req, res){
    res.render("register", {page: 'register'});
});

//handle sign up logic
router.post("/register", function(req, res){
    var newUser = new User(
        {
            username: req.body.username, 
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            avatar: req.body.avatar
        });
    //管理者更新
    //如果在創建帳戶時提供特定通行碼則設為管理員
    if (req.body.adminCode === 'boshan200'){
        newUser.isAdmin = true;
    }
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render("register", {error: err.message});
        }
        //將使用者的資訊透過local傳給註冊的函式進行註冊
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to Yelpcamp" + user.username)
            res.redirect("/campgrounds");
        });
    });
});

//show login form
router.get("/login", function(req, res){
    res.render("login", {page: 'login'});
});

//handlong login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect:"/campgrounds",
        failureRedirect:"/login" 
    }), function(req, res){
});

//logout route
router.get("/logout", function(req, res){
    req.logout();
    req.flash("success", "Successfully Logged out!!");
    res.redirect("/campgrounds");
});

//user profile
router.get("/users/:id", function(req, res){
    User.findById(req.params.id, function(err, foundUser){
        if(err){
            req.flash("error", "Something goes worng :(");
            return res.redirect("/");
        }
        Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds){
            if(err){
                req.flash("error", "Something goes worng :(");
                return res.redirect("/");
            }
            res.render("users/show", {user:foundUser, campgrounds:campgrounds});
        });
    });
});


module.exports = router;
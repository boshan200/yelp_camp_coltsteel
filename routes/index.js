var express    = require("express");
var router     = express.Router(),
    passport   = require("passport"),
    User       = require("../models/user");
    Campground = require("../models/campground");
    async      = require("async");
    nodemailer = require("nodemailer");
    crypto     = require("crypto");

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
    if (req.body.adminCode === process.env.ADMIN_CODE){
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
        Campground.find().where('author.id').equals(foundUser._id).exec((err, campgrounds)=>{
            if(err){
                req.flash("error", "Something goes worng :(");
                return res.redirect("/");
            }
            res.render("users/show", {user:foundUser, campgrounds:campgrounds});
        });
    });
});

// forgot password
router.get('/forgot', (req, res)=> {
    res.render('forgot');
  });
  
  router.post('/forgot', (req, res, next)=> {
    async.waterfall([
      (done)=> {
        crypto.randomBytes(20, (err, buf)=> {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      (token, done)=> {
        User.findOne({ email: req.body.email }, (err, user)=> {
          if (!user) {
            req.flash('error', 'No account with that email address exists.');
            return res.redirect('/forgot');
          }
  
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  
          user.save((err)=> {
            done(err, token, user);
          });
        });
      },
      (token, user, done)=> {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: '1104108119@nkust.edu.tw',
            pass: process.env.GMAILPW
          }
        });
        var mailOptions = {
          to: user.email,
          from: '1104108119@nkust.edu.tw',
          subject: 'Node.js Password Reset',
          text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
            'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
            'http://' + req.headers.host + '/reset/' + token + '\n\n' +
            'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        smtpTransport.sendMail(mailOptions, (err)=> {
          console.log('mail sent');
          req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
          done(err, 'done');
        });
      }
    ], (err)=> {
      if (err) return next(err);
      res.redirect('/forgot');
    });
  });
  
  router.get('/reset/:token', (req, res)=> {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
      if (!user) {
        req.flash('error', 'Password reset token is invalid or has expired.');
        return res.redirect('/forgot');
      }
      res.render('reset', {token: req.params.token});
    });
  });
  
  router.post('/reset/:token', (req, res)=> {
    async.waterfall([
      function(done) {
        User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('back');
          }
          if(req.body.password === req.body.confirm) {
            user.setPassword(req.body.password, function(err) {
              user.resetPasswordToken = undefined;
              user.resetPasswordExpires = undefined;
  
              user.save(function(err) {
                req.logIn(user, function(err) {
                  done(err, user);
                });
              });
            })
          } else {
              req.flash("error", "Passwords do not match.");
              return res.redirect('back');
          }
        });
      },
      (user, done)=> {
        var smtpTransport = nodemailer.createTransport({
          service: 'Gmail', 
          auth: {
            user: 'learntocodeinfo@gmail.com',
            pass: process.env.GMAILPW
          }
        });
        var mailOptions = {
          to: user.email,
          from: 'learntocodeinfo@mail.com',
          subject: 'Your password has been changed',
          text: 'Hello,\n\n' +
            'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        smtpTransport.sendMail(mailOptions, function(err) {
          req.flash('success', 'Success! Your password has been changed.');
          done(err);
        });
      }
    ], (err)=> {
      res.redirect('/campgrounds');
    });
  });

module.exports = router;
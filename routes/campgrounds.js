var express    = require("express");
var router     = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");

//INDEX - SHOW ALL Campgrounds
router.get("/", function(req, res){
    var noMatch = null;
    if (req.query.search){
        //確認搜尋字串並且過濾
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    //search filter更新,新增以正則表達式做為關鍵字
        Campground.find({name: regex}, function(err, allcampgrounds){
            if(err){
                console.log(err);
            } else {
                if(allcampgrounds.length < 1){
                    noMatch = "No campgrounds match that query, please try again.";
                }
                res.render("campgrounds/index", {campgrounds:allcampgrounds, noMatch:noMatch, page: 'campgrounds'});
            }
        });
    } else {
        Campground.find({}, function(err, allCampgrounds){
            if(err){
                console.log(err);
            } else {
               res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch: noMatch, page: 'campgrounds'});
            }
         });
    }
});

//create a new campground and save to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    var Newname=req.body.name;
    var Newimage=req.body.image;
    var Newdescription = req.body.description;
    var Newprice = req.body.price;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: Newname,price: Newprice, image: Newimage, description: Newdescription, author: author};
    
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
});

//show new campgrounds form
router.get("/new", middleware.isLoggedIn,function(req, res){
    res.render("campgrounds/new");
});

router.get("/:id", function(req, res){
    //find campground with provided ID
    //render show template with that campground
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if(err){
            console.log(err);
        }else{
            res.render("campgrounds/show", {campground:foundCampground});
        }
    }); 
});

//edit campground route
router.get("/:id/edit", middleware.checkCampgroundOwnership,function(req, res){
        Campground.findById(req.params.id, function(err, foundCampground){
            res.render("campgrounds/edit", {campground: foundCampground});
        });     
});

//update campground route
router.put("/:id", middleware.checkCampgroundOwnership,function(req, res){
    //find and update correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
            res.redirect("/campgrounds/" + req.params.id);
    });
    //redirect somewhere(show page)
});

//Destory campground route
router.delete("/:id", middleware.checkCampgroundOwnership,function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
            res.redirect("/campgrounds");
    });
});

function escapeRegex(text){
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};


//export routes
module.exports = router;
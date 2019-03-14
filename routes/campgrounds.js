var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var User = require("../models/user");
var Notification = require("../models/notification");
var Review = require("../models/review");
//middleware
var middleware = require("../middleware/index");
// img upload
var multer = require('multer');
var storage = multer.diskStorage({
    filename: function(req, file, callback) {
        callback(null, Date.now() + file.originalname);
    }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,//process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET // process.env.CLOUDINARY_API_SECRET
});


// INDEX ROUTE -show all campgrounds
router.get("/", (req,res)=>{
    var nomatch = null;
    if(req.query.search){
        const regex = new RegExp(escapeRegex(req.query.search), 'gi'); //g-global i-ignore case
        //Get all campgrounds from DB
        Campground.find({name: regex}, (err, allcampgrounds) => {
            if (err) {
                console.log(err);
            } else {
                if(allcampgrounds.length < 1){
                     nomatch = "No campground match that query, please try again"
                }
                    res.render("campgrounds/index", {campgrounds: allcampgrounds, page: "campgrounds", nomatch: nomatch});

            }
        })
    }else {
        //Get all campgrounds from DB
        Campground.find({}, (err, allcampgrounds) => {
            if (err) {
                console.log(err);
            } else {
                res.render("campgrounds/index", {campgrounds: allcampgrounds, page: "campgrounds", nomatch: nomatch});
            }
        })
    }
    // rendering the campground from data
});
//following the naming convention
// if you want to add new campground you should use the same get url
//CREATE - Add new campground to DB
router.post("/", middleware.isLoggedIn, upload.single('image'), function(req, res) {    //upload a single image
    cloudinary.v2.uploader.upload(req.file.path, async function(err, result) {
        if(err){
            req.flash("error", err.message);
            return res.redirect('back');
        }
        // add cloudinary url for the image to the campground object under image property
        req.body.campground.image = result.secure_url;
        // add image's public_id to campground object
        req.body.campground.imageId = result.public_id;
        // add author to campground
        req.body.campground.author = {
            id: req.user._id,
            username: req.user.username
        };
        try {
            let campground = await Campground.create(req.body.campground);
            let user = await User.findById(req.user._id).populate('followers').exec();
            let newNotification = {
                username: req.user.username,
                campgroundId: campground.id
            };
            for(const follower of user.followers) {
                let notification = await Notification.create(newNotification);
                follower.notifications.push(notification);
                follower.save();
            }

            //redirect back to campgrounds page
            res.redirect(`/campgrounds/${campground.id}`);
        }catch(err) {
            req.flash('error', err.message);
            res.redirect('back');
        }
    });

});

//NEW - Show form to create new campground
router.get("/new",middleware.isLoggedIn ,(req, res)=>{

    // form to add new campground
    res.render("campgrounds/new");
    // new make a post request to campground
    // campground processes the data and redirect to campground(get)
});
// SHOW - shows more info about one campground
router.get("/:id", (req, res)=>{
    // find the campground with provided ID and associate it with its comment(s)
    Campground.findById(req.params.id).populate("comments").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec((err, foundCampground)=>{
        if(err){
            console.log(err);
        }else{
            console.log(foundCampground);
            // render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
} );

//  EDIT CAMPGROUND ROUTE
router.get("/:id/edit",middleware.checkCampgroundOwnership,(req, res)=>{
    Campground.findById(req.params.id, (err, foundCampground)=>{
        res.render("campgrounds/edit",{campground: foundCampground});
    });
});

//  UPDATE CAMPGROUND ROUTE
router.put("/:id",middleware.checkCampgroundOwnership, upload.single('image'), (req,res)=>{

   // find and update the correct campground
    Campground.findById(req.params.id, async function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            if (req.file) {
                try {
                    // remove the previous image from cloudinary
                    await cloudinary.v2.uploader.destroy(campground.imageId);   // wait for this to finish running before continuing
                    // upload new picture to cloudinary
                    var result = await cloudinary.v2.uploader.upload(req.file.path);
                    campground.imageId = result.public_id;
                    campground.image = result.secure_url;
                } catch(err) {
                    req.flash("error", err.message);
                    return res.redirect("back");
                }
            }
            campground.name = req.body.name;
            campground.cost = req.body.cost;
            campground.location = req.body.location ;
            campground.description = req.body.description;
            campground.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });

});



// DESTROY CAMPGROUND ROUTE
router.delete("/:id",middleware.checkCampgroundOwnership ,(req,res)=>{
    Campground.findById(req.params.id, async function(err, campground) {
        if(err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        try {
            await cloudinary.v2.uploader.destroy(campground.imageId);
            // deletes all comments associated with the campground
            Comment.remove({"_id": {$in: campground.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/campgrounds");
                }
                // deletes all reviews associated with the campground
                Review.remove({"_id": {$in: campground.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/campgrounds");
                    }
                });
            });
            //  delete the campground
            campground.remove();
            req.flash('success', 'Campground deleted successfully!');
            res.redirect('/campgrounds');
        } catch(err) {
            if(err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
        }
    });
});


// for fuzzy search
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports = router;
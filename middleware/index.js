var Campground = require("../models/campground");
var Comment = require("../models/comment");
var Review = require("../models/review");
// all the middleware goes here
var middlewareObj ={};

middlewareObj.checkCampgroundOwnership = (req, res, next)=>{
    // logged in
    if(req.isAuthenticated()){
        Campground.findById(req.params.id, (err, foundCampground)=>{
            if(err){
                req.flash("error","Campground not found");
                res.redirect("back")
            }  else{
                // does user own the campground?
                if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
                    next();
                }else{
                    req.flash("error","you don't have permission to do that!");
                    res.redirect("back");
                }
            }
        });
        //  res.redirect("/campgrounds");
    }else{
        // if not redirect
        req.flash("error","you need to be logged in to that!");
        res.redirect("back");  // take the user to= the previous page
    }
};

middlewareObj.checkCommentOwnership = (req, res, next)=>{
    if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, (err, foundComment)=>{
            if(err){
                res.redirect("back")
            }  else{
                // does user own the comment?
                if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin  ){
                    next();
                }else{
                    req.flash("error", "You dont have permission to do that!");
                    res.redirect("back");
                }
            }
        });
        //  res.redirect("/campgrounds");
    }else{
        req.flash("error", "You need to be logged in to do that!");
        // if not redirect
        res.redirect("back");  // take the user to= the previous page
    }
};

middlewareObj.isLoggedIn = (req, res, next)=>{
    if(req.isAuthenticated()){
        return next();
    }
    // in the flash add this string for the next req
    req.flash("error", "You need to logged in to do that!");
    res.redirect("/login");
};

//checkReviewOwnership is something that we've already seen for both campgrounds and comments routes,
// but checkReviewExistence is new - it checks if the user already reviewed the campground and disallows further actions if they did.

middlewareObj.checkReviewOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Review.findById(req.params.review_id, function(err, foundReview){
            if(err || !foundReview){
                res.redirect("back");
            }  else {
                // does user own the comment?
                if(foundReview.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkReviewExistence = function (req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id).populate("reviews").exec(function (err, foundCampground) {
            if (err || !foundCampground) {
                req.flash("error", "Campground not found.");
                res.redirect("back");
            } else {
                // check if req.user._id exists in foundCampground.reviews
                var foundUserReview = foundCampground.reviews.some(function (review) {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("/campgrounds/" + foundCampground._id);
                }
                // if the review was not found, go to the next middleware
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};

module.exports = middlewareObj;
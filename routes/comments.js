var express = require("express");
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");

//middleware
var middleware = require("../middleware/index.js");
// =======================
// COMMENTS ROUTES
// =======================
// comments new
router.get("/new",middleware.isLoggedIn ,(req,res)=>{
    //find campground by id
    Campground.findById(req.params.id, (err, campground)=>{
        if(err){
            console.log(err)
        }else{
            res.render("comments/new",{campground: campground})
        }
    });

});

// comments create
router.post("/",middleware.isLoggedIn ,(req,res)=>{
    // lookup campground using ID
    Campground.findById(req.params.id, (err,campground)=>{
        if(err){
            console.log(err);
            res.redirect("/campgrounds");
        }else{
            Comment.create(req.body.comment, (err, comment)=>{
                if (err){
                    req.flash("error", "Something went wrong");
                    console.log(err)
                } else{
                    // add the comment
                    // add username and id to comment
                   // req.user.username
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "Successfully added comment");
                    res.redirect("/campgrounds/"+ campground._id);
                }
            });
        }
    });
    // create new comment to campground
    // connect new comment to campground
    //redirect to campground show page

});

// EDIT COMMENT ROUTE
router.get("/:comment_id/edit",middleware.checkCommentOwnership ,(req, res)=>{
    Comment.findById(req.params.comment_id, (err, foundComment)=>{
        if(err){
            res.redirect("back")
        }else{
            res.render("comments/edit",{campground_id: req.params.id, comment: foundComment})
        }
    });
});

//  COMMENT UPDATE
router.put("/:comment_id",middleware.checkCommentOwnership ,(req, res)=>{
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, (err, updatedComment)=>{
       if(err){
           res.redirect("back");
       }else{
           res.redirect("/campgrounds/"+ req.params.id)
       }
   })
});

//  COMMENT DESTROY ROUTE
router.delete("/:comment_id",middleware.checkCommentOwnership ,(req, res)=>{
   //findbyIdAndRemove
    Comment.findByIdAndRemove(req.params.comment_id, (err)=>{
        if(err){
            res.redirect("back")
        } else{
            req.flash("success", "Comment deleted");
            res.redirect("/campgrounds/" + req.params.id)
        }
    })

});


// middleware


module.exports = router;
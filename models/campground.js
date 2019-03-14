var mongoose = require("mongoose");
// SCHEMA SETUP
let campgroundSchema = new mongoose.Schema({
    name: String,
    cost: Number,
    image: String,
    imageId: String,    // for deleting in cloudinary
    description: String,
    // for map
    location : String,
    lat: Number,
    lng: Number,
    //time stamp
    createdAt: { type: Date, default: Date.now},
    // to get the person who created the campground
    author: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    rating: {
        type: Number,
        default: 0
    }
});
var Campground = mongoose.model("Campground", campgroundSchema);
module.exports = Campground;
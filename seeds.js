// this clears our campground data base and fills it with sample data
var moongose = require("mongoose");
var Campground = require("./models/campground");
var Comment = require("./models/comment");

var seeds = [
    {
        name: "Cloud's Rest",
        image:"https://images.unsplash.com/photo-1518174279714-c9728bd758c3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid asperiores aut autem consequuntur corporis delectus doloremque eligendi eos error et eveniet excepturi expedita facilis fugit hic ipsam iste itaque iusto laboriosam magni maiores molestias necessitatibus nihil officiis placeat, praesentium quae quia quos recusandae repudiandae rerum sed soluta sunt tempore totam vitae voluptatem. Amet dolor hic id inventore, maxime porro vitae."
    },
    {
        name: "Mountain Mesa",
        image:"https://images.unsplash.com/photo-1518173568976-11ba0004d864?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1183&q=80",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid asperiores aut autem consequuntur corporis delectus doloremque eligendi eos error et eveniet excepturi expedita facilis fugit hic ipsam iste itaque iusto laboriosam magni maiores molestias necessitatibus nihil officiis placeat, praesentium quae quia quos recusandae repudiandae rerum sed soluta sunt tempore totam vitae voluptatem. Amet dolor hic id inventore, maxime porro vitae."
    },
    {
        name: "Grassy Tents",
        image:"https://images.unsplash.com/photo-1528433556524-74e7e3bfa599?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1050&q=80",
        description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid asperiores aut autem consequuntur corporis delectus doloremque eligendi eos error et eveniet excepturi expedita facilis fugit hic ipsam iste itaque iusto laboriosam magni maiores molestias necessitatibus nihil officiis placeat, praesentium quae quia quos recusandae repudiandae rerum sed soluta sunt tempore totam vitae voluptatem. Amet dolor hic id inventore, maxime porro vitae."
    }
];
async function seedDB(){
    // Refactor Callbacks with Async + Await
    // remove all campgrounds
    await Comment.remove({});
    await Campground.remove({});
    for(const seed of seeds){
        let campground = await Campground.create(seed);
        console.log("Campground created");
        let comment = await Comment.create({
            text: "This place is great, but i wish there was internet",
            author: "Praise"
        });
        console.log("Comment created");
        campground.comments.push(comment);
        campground.save();
        console.log("Comment added to campground");
    }




}

module.exports = seedDB;

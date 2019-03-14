// adding review system

 require("dotenv").config();  // dotenv for api stuff
// //cofigure dotenv
// require("dotenv").load();

var express         = require("express"),
    app             = express(),
    mongoose        = require("mongoose"),
    bodyParser      = require("body-parser"),
    cookieParser    = require("cookie-parser"),
    flash           = require("connect-flash"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    methodOverride  = require("method-override"),
    Campground      = require("./models/campground"),
    Comment         = require("./models/comment"),
    User            = require("./models/user"),
    seedDB          = require("./seeds");



// requiring routes
var commentRoutes    = require("./routes/comments"),
    reviewRoutes     = require("./routes/reviews"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes       = require("./routes/index");

console.log(process.env.DATABASEURL);
// when working locally i dont want to use the online db
var url = process.env.DATABASEURL  ||  "mongodb://localhost:27017/yelp_camp_v16";
mongoose.connect(url, {useNewUrlParser: true});
//mongoose.connect("mongodb://localhost:27017/yelp_camp_v16", {useNewUrlParser: true}); // connecting to mongo online db
// mongodb+srv://praise2112:<password>@yelpcamp-plywo.mongodb.net/test?retryWrites=true
//mongoose.connect("mongodb+srv://praise2112:oluwabamise2112@yelpcamp-plywo.mongodb.net/test?retryWrites=true", {useNewUrlParser: true});
//mongodb+srv://Praise2112:Oluwabamise%402112@cluster0-pjuzw.mongodb.net/test?retryWrites=true


mongoose.set("useCreateIndex", true);
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
var path = require('path');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/public'));  // to link to partial
app.use(methodOverride("_method"));
app.use(cookieParser('secret'));
app.use(flash());
// seedDB();  // seed the database

// for time
app.locals.moment = require('moment');

//  PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "One again Rusty wins the cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// making a middleware for all routes on the page to get current user
app.use(async function (req, res, next) {
    res.locals.currentUser = req.user;
    // for notification
    if(req.user) {
        try {
            let user = await User.findById(req.user._id).populate('notifications', null, { isRead: false }).exec(); //find notification that has not been read
            res.locals.notifications = user.notifications.reverse();
        } catch(err) {
            console.log(err.message);
        }
    }
    //
    res.locals.error =  req.flash("error");
    res.locals.success =  req.flash("success");
    next();
});


// using the routes we required
app.use("/",indexRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);
// all campground route should start with "/campgrounds"
app.use("/campgrounds",campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.listen(process.env.PORT || 3000, process.env.IP,()=>{
    console.log("The YelpCamp Server has Started!");
});


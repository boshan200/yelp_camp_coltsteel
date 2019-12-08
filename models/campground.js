var mongoose = require("mongoose");

//schema setup
var campgroundSchema = new mongoose.Schema({
    name: String, 
    price: String,
    image: String,
    description :String,
    location :String,
    lat: Number,
    lng: Number,
    createdAt: {type: Date, default:Date.now},
    author:{
        id:    {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        }
    ]
});

//model setup
module.exports = mongoose.model("Campground", campgroundSchema);
var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
    text: String,
    //下面這個只能在mongo等資料庫裡面做
    author: {
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    }
});


module.exports = mongoose.model("Comment", commentSchema);
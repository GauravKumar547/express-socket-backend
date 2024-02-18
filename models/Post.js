const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
    {
        user_id: {
            type: String,
            require: true,
        },
        username: {
            type: String,
            require: true,
        },
        description: {
            type: String,
            max: 500,
            require: true,
        },
        likes: {
            type: Array,
            default: [],
        },
        comments: {
            type: Array,
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Post", PostSchema);

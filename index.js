const express = require("express");
const mongoose = require("mongoose");
const User = require("./models/User");
const cors = require("cors");
const Post = require("./models/Post");
const app = express();
app.use(cors());
app.use(express.json());

mongoose
    .connect("mongodb+srv://gauravkhanna547:llvueXKgtDcRaL7C@feedcluster.nc5io5j.mongodb.net/")
    .then(() => {
        console.log("DB connected");
    });

app.get("/health-check", (req, res) => {
    res.send("Server health status is good");
});
app.post("/post", async (req, res) => {
    const { description, user_id, username } = req.body;
    if (description && user_id) {
        const post = await Post.create({ description, user_id, username });
        if (post) {
            res.status(200).json({ post: post });
        } else {
            res.status(500).json({ message: "Something went wrong" });
        }
    } else {
        res.status(400).json({ message: "data is not complete" });
    }
});
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        const user = await User.findOne({
            username,
            password,
        });
        if (user) {
            return res.status(200).json({ _id: user._id, username: user.username });
        } else {
            return res.status(404).json({ message: "user not found" });
        }
    } else {
        res.status(400).json({ message: "credentials incomplete" });
    }
});
app.put("/like", async (req, res) => {
    if (req.body.user_id && req.body.post_id) {
        try {
            const post = await Post.findById(req.body.post_id);
            if (post.likes.includes(req.body.user_id)) {
                await post.updateOne({ $pull: { likes: req.body.user_id } });
                res.status(200).json("post has been disliked");
            } else {
                await post.updateOne({ $push: { likes: req.body.user_id } });
                res.status(200).json("post has been liked");
            }
        } catch (error) {
            res.status(500).json(error);
        }
    } else {
        return res.status(404).json({ message: "data is not complete" });
    }
});
app.put("/comment", async (req, res) => {
    if (req.body.user_id && req.body.comment) {
        try {
            const post = await Post.findById(req.body.post_id);

            await post.updateOne({ $push: { comments: req.body.comment } });
            res.status(200).json("comment has been added");
        } catch (error) {
            res.status(500).json(error);
        }
    } else {
        return res.status(404).json({ message: "data is not complete" });
    }
});
app.get("/feed", async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).limit(20);
        res.status(200).json({ posts: posts });
    } catch (error) {
        res.status(500).json(error);
    }
});
const io = require("socket.io")(8080, {
    cors: {
        origin: "*",
    },
});
io.on("connection", (socket) => {
    console.log("Client connected");

    // Handle disconnection
    socket.on("disconnect", () => {
        console.log("Client disconnected");
    });
});
let postchangeStreams = Post.watch();
postchangeStreams.on("change", async (change) => {
    const post = await Post.findById(change.documentKey._id);
    io.emit("updated", post);
});
app.listen(8000, () => {
    console.log("server is up");
});

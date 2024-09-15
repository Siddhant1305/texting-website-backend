const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const Chat = require("./models/chat.js");
const methodOverride = require("method-override");
const ExpressError = require("./ExpressError.js");

app.set("views", path.join(__dirname, "views"));
app.set("views engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));

main()
    .then(() => {
        console.log("Connection Successful")
    })
    .catch(err => console.log(err));


async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/whatsapp');
}

// Index Route
app.get("/chats", async (req, res) => {
    try {
        let chats = await Chat.find();
        // console.log(chats);
        res.render("index.ejs", {chats});
    } catch (err) {
      next(err);
    }
});

// New Route
app.get("/chats/new", (req, res) => {
    // throw new ExpressError(404, "Page not Found");
    res.render("new.ejs");
});

// // Create Route - 1
// app.post("/chats", async (req, res) => {
//     let {from, to, msg} = req.body;
//     let newChat = new Chat({
//         from: from,
//         to: to,
//         msg: msg,
//         created_at: new Date()
//     });

//     newChat
//         .save()
//         .then((res) => {
//             console.log("chat was saved");
//         })
//         .catch((err) => {
//             console.log(err);
//         });
//     res.redirect("/chats");
// });


// Create Route - 2
app.post("/chats", asyncWrap(async (req, res, next) => {

    let {from, to, msg} = req.body;
    let newChat = new Chat({
        from: from,
        to: to,
        msg: msg,
        created_at: new Date()
    });

    await newChat.save();
    res.redirect("/chats");
}));

// AsyncWrap Function
function asyncWrap(fn) {
    return function(req, res, next) {
        fn(req, res, next).catch(err => next(err));
    };
}

// New - Show Route
app.get("/chats/:id", asyncWrap (async (req, res, next) => {
    let { id } = req.params;
    let chat = await Chat.findById(id);
    if (!chat) {
        next(new ExpressError(404, "Chat not Found"));
    }
    res.render("edit.ejs", { chat });
}));

// Edit Route
app.get("/chats/:id/edit", asyncWrap (async (req, res) => {
    let {id} = req.params;
    let chat = await Chat.findById(id);
    res.render("edit.ejs", { chat });
}));

// Update Route
app.put("/chats/:id", asyncWrap (async (req, res) => {
    let {id} = req.params;
    let {msg: newMsg} = req.body;
    let updatedChat = await Chat.findByIdAndUpdate(
        id, 
        {msg: newMsg}, 
        {runValidators: true, new: true}
    );
    console.log(updatedChat);
    res.redirect("/chats");
}));

// Delete Route
app.delete("/chats/:id", asyncWrap(async (req, res) => {
    let {id} = req.params;
    let deletedChat = await Chat.findByIdAndDelete(id);
    console.log(deletedChat);
    res.redirect("/chats");
}));

// Root Route
app.get("/", (req, res) => {
    res.send("root is working");
});


const handleValidationError = (err) => {
    console.log("This was a Validation error, Please follow Rules");
    console.dir(err.message);
    return err;
}


// Priniting Error Name - Error Handling Middleware
app.use((err, req, res, next) => {
    console.log(err.name);
    if(err.name === "ValidationError") {
        err = handleValidationError(err);
    }
    next(err);
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    let {status=500, message="Some Error Occurred"} = err;
    res.status(status).send(message);
});

app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});
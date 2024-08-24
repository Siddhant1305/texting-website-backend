const mongoose = require("mongoose");
const Chat = require("./models/chat.js");

main()
    .then(() => {
        console.log("Connection Successful")
    })
    .catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/whatsapp');
}

let allChats = [
    {
        from: "siddhant",
        to: "aditi",
        msg: "send me your notes",
        created_at: new Date() 
    },
    {
        from: "siddhant",
        to: "saishree",
        msg: "Hello Good Morning",
        created_at: new Date()  
    },
    {
        from: "siddhant",
        to: "hardik",
        msg: "MBA Chaiwala",
        created_at: new Date()  
    },
    {
        from: "aditi",
        to: "aditya",
        msg: "Velorant",
        created_at: new Date()  
    },
];


Chat.insertMany(allChats);
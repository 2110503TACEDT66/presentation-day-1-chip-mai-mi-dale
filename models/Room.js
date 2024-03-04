const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  name:{
    type: String,
    required: [true, "Please add a room's name"],
    unique: true,
  },
  coworking: {
    type: mongoose.Schema.ObjectId,
    ref: "CoworkingSpace",
    required: true,
  },
  capacity:{
    type: Number,
    required: [true, "Please add room's capacity"],
    
  }
});

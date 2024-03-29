const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({
  bookDate: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  room: {
    type: mongoose.Schema.ObjectId,
    ref: "Room",
    required: true,
  },
  coworkingspace: {
    type: mongoose.Schema.ObjectId,
    ref: "CoworkingSpace",
    required: true,
  },
  people: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Reservation", ReservationSchema);

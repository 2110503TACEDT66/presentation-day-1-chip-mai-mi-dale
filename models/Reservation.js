const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({
  reserveDate: {
    type: string,
    required: true,
  },
  start: {
    type: string,
    required: true,
  },
  end: {
    type: string,
    required: true,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  coworking: {
    type: mongoose.Schema.ObjectId,
    ref: "CoworkingSpace",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Reservation", ReservationSchema);

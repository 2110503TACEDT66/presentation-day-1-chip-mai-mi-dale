const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({

  startdate: {
    type: Date,
    required: true,
  },
  enddate: {
    type: Date,
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
  createdAt: {
    type: Date,
    default: Date.now,
  },
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },

});

ReservationSchema.virtual("coworkingSpace", {
  ref: "CoworkingSpace",
  localField: "_id",
  foreignField: "reservation",
  //justOne: false
});

//Room populate with virtuals
// ReservationSchema.virtual("room", {
//   ref: "Room",
//   localField: "_id",
//   foreignField: "reservation",
//   //justOne: false,
// });

module.exports = mongoose.model('Reservation', ReservationSchema);

/* 
# changed code lists
- changed hospital to coworkingSpace & appointment to reservation
*/

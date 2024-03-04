const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a room's name"],
      unique: true,
    },
    coworkingspace: {
      type: mongoose.Schema.ObjectId,
      ref: "CoworkingSpace",
      required: true,
    },
    capacity: {
      type: Number,
      required: [true, "Please add room's capacity"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Before delete a room
RoomSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    console.log(
      `Reservations being removed from Co-working space's room ${this._id}`
    );
    await this.model("Reservation").deleteMany({ room: this._id });
    next();
  }
);

// Reverse populate with virtuals
RoomSchema.virtual("reservations", {
  ref: "Reservation",
  localField: "_id",
  foreignField: "room",
  justOne: false,
});

module.exports = mongoose.model("Room", RoomSchema);

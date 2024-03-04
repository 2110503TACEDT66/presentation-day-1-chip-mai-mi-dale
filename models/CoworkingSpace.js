const mongoose = require("mongoose");

const CoworkingSpaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      maxlength: [100, "Name can not be more than 100 characters"],
    },

    address: {
      type: String,
      required: [true, "Please add an address"],
    },

    tel: {
      type: String,
      required: [true, "Please add a telephone number"],
      unique: true,
    },

    openTime: {
      type: String,
      required: [true, "Please add open time"],
    },

    closeTime: {
      type: String,
      required: [true, "Please add close time"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//Before delete a coworking-space
CoworkingSpaceSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    console.log(`Reservations being removed from Co-working space ${this._id}`);
    await this.model("Reservation").deleteMany({ coworking: this._id });
    console.log(`Rooms being removed from Co-working space ${this._id}`);
    await this.model("Room").deleteMany({ coworking: this._id });
    next();
  }
);

// Reverse populate with virtuals
CoworkingSpaceSchema.virtual("reservations", {
  ref: "Reservation",
  localField: "_id",
  foreignField: "coworkingSpace",
  justOne: false,
});

// Room populate with virtuals
CoworkingSpaceSchema.virtual("rooms", {
    ref: "Room",
    localField: "_id",
    foreignField: "coworkingSpace",
    justOne: false,
  });

module.exports = mongoose.model("CoworkingSpace", CoworkingSpaceSchema);

/* 
# changed code lists
- changed hospital to coworking & appointment to reservation
- adjust maxlength of name
- add time
- delete some fields
*/

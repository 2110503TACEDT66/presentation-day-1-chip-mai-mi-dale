const mongoose = require("mongoose");
const Room = require("./Room");

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
      required: [true, "Please add tel"],
    },
    opentime: {
      type: String,
      required: [true, "Please add open time"],
    },

    closetime: {
      type: String,
      required: [true, "Please add close time"],
    },
    roomcount: {
      type: Number,
      default: 0,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Define a method to calculate room count
CoworkingSpaceSchema.methods.calculateRoomCount = async function() {
  try {
    const roomCount = await Room.countDocuments({ coworkingspace: this._id });
    return roomCount;
  } catch (error) {
    console.error("Error calculating room count:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

CoworkingSpaceSchema.pre("save", async function(next) {
  try {
    this.roomcount = await this.calculateRoomCount();
    next();
  } catch (error) {
    console.error("Error in pre-save hook:", error);
    next(error); // Pass the error to the next middleware
  }
});

// Define method to calculate total seconds from time string (e.g., "09:30" => 34200)
CoworkingSpaceSchema.methods.calculateSecondsFromTime = function(timeString) {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 3600 + minutes * 60;
};

// Define method to check if opening time is before closing time
CoworkingSpaceSchema.methods.isValidTimeRange = function() {
  const openSeconds = this.calculateSecondsFromTime(this.opentime);
  const closeSeconds = this.calculateSecondsFromTime(this.closetime);
  return openSeconds < closeSeconds;
};

// Define pre-save hook to check time validity before saving
CoworkingSpaceSchema.pre("save", function(next) {
  if (!this.isValidTimeRange()) {
    return next(new Error("Invalid time range: Opening time must be before closing time"));
  }
  next();
});

//Cascade delete appointments when a hospital is deleted
CoworkingSpaceSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    console.log(`Reservations being removed from Co-working space ${this._id}`);
    await this.model("Room").deleteMany({ coworkingSpace: this._id });
    next();
  }
);

//Reverse populate with virtuals
CoworkingSpaceSchema.virtual("reservations", {
  ref: "Reservation",
  localField: "_id",
  foreignField: "coworkingspace",
  justOne: false,
});

//Room populate with virtuals
CoworkingSpaceSchema.virtual("rooms", {
  ref: "Room",
  localField: "_id",
  foreignField: "coworkingspace",
  justOne: false,
});

module.exports = mongoose.model("CoworkingSpace", CoworkingSpaceSchema);

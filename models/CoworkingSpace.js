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
      validate: {
        validator: function (value) {
          // Regular expression to match HH:mm format
          const timePattern = /^(?:2[0-4]|[01]?[0-9]):[0-5][0-9]$/;

          //Check Pattern
          if (!timePattern.test(value)) {
            return false;
          }

          // Extract hours and minutes parts
          const [hours, minutes] = value.split(":").map(Number);

          // Check if time is less than or equal to 24:00
          return hours < 24 || (hours === 24 && minutes === 0);
        },
        message: (props) =>
          `${props.value} is not a valid time format (HH:mm) or exceeds 24:00`,
      },
    },

    closetime: {
      type: String,
      required: [true, "Please add close time"],
      validate: {
        validator: function (value) {
          // Regular expression to match HH:mm format
          const timePattern = /^(?:2[0-4]|[01]?[0-9]):[0-5][0-9]$/;

          //Check Pattern
          if (!timePattern.test(value)) {
            return false;
          }

          // Extract hours and minutes parts
          const [hours, minutes] = value.split(":").map(Number);

          // Check if time is less than or equal to 24:00
          return hours < 24 || (hours === 24 && minutes === 0);
        },
        message: (props) =>
          `${props.value} is not a valid time format (HH:mm) or exceeds 24:00`,
      },
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
CoworkingSpaceSchema.methods.calculateRoomCount = async function () {
  try {
    const roomCount = await Room.countDocuments({ coworkingspace: this._id });
    return roomCount;
  } catch (error) {
    console.error("Error calculating room count:", error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

CoworkingSpaceSchema.pre("save", async function (next) {
  try {
    this.roomcount = await this.calculateRoomCount();
    next();
  } catch (error) {
    console.error("Error in pre-save hook:", error);
    next(error); // Pass the error to the next middleware
  }
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

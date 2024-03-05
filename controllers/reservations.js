const Reservation = require("../models/Reservation");
const Room = require("../models/Room");
const CoworkingSpace = require("../models/CoworkingSpace");

//@desc     Get all Reservations
//@route    GET /api/v1/Reservations
//@access   Public
exports.getReservations = async (req, res, next) => {
  let query;

  //General users can see only their reservations
  if (req.user.role !== "admin") {
    query = Reservation.find({ user: req.user.id })
      .populate({
        path: "user",
        select: "name",
      })
      .populate({
        path: "room",
        select: "name",
      })
      .populate({
        path: "coworkingspace",
        select: "name address tel",
      });
  } else {
    //admin
    if (req.params.coworkingSpaceId) {
      console.log(req.params.coworkingSpaceId);
      query = Reservation.find({
        coworking: req.params.coworkingSpaceId,
      })
        .populate({
          path: "user",
          select: "name",
        })
        .populate({
          path: "room",
          select: "name",
        })
        .populate({
          path: "coworkingspace",
          select: "name address tel",
        });
    } else {
      query = Reservation.find()
        .populate({
          path: "user",
          select: "name",
        })
        .populate({
          path: "room",
          select: "name",
        })
        .populate({
          path: "coworkingspace",
          select: "name address tel",
        });
    }
  }

  try {
    const reservations = await query;

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Reservations" });
  }
};

//@desc     Get single reservation
//@route    GET /api/v1/reservations/:id
//@access   Public
exports.getReservation = async (req, res, next) => {
  try {
    //note : want to show username and room
    const reservation = await Reservation.findById(req.params.id)
      .populate({
        path: "user",
        select: "name",
      })
      .populate({
        path: "room",
        select: "name",
      })
      .populate({
        path: "coworkingspace",
        select: "name address tel",
      });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: `No reservation with the id of ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find Reservation" });
  }
};

//@desc     Add reservation
//@route    POST /api/v1/coworking/:coworkingId/reservations
//@access   Private
exports.addReservation = async (req, res, next) => {
  try {
    req.body.coworkingSpace = req.params.coworkingSpaceId;

    const coworkingSpace = await CoworkingSpace.findById(
      req.params.coworkingSpaceId
    );

    if (!coworkingSpace) {
      return res.status(404).json({
        success: false,
        message: `No coworking with the id of ${req.params.coworkingSpaceId}`,
      });
    }

    const room = await Room.findById(req.body.room);

    if (!room) {
      return res.status(404).json({
        success: false,
        message: `No room id: ${req.body.room} in Coworking id: ${req.params.coworkingSpaceId}`,
      });
    }

    if (room.capacity < req.body.people) {
      return res.status(400).json({
        success: false,
        message: `Have many people more than ${room.capacity}`,
      });
    }

    // const dateString = coworkingSpace;
    // console.log(dateString.closetime);

    const splitTimeS = coworkingSpace.opentime.split(":"); // Splits the opentime string into ["09", "30"]
    const openH = splitTimeS[0]; // Parses the hours part into an integer: 9
    const openM = splitTimeS[1];

    const splitTimeE = coworkingSpace.closetime.split(":"); // Splits the closetime string into ["18", "00"]
    const closeH = splitTimeE[0]; // Parses the hours part into an integer: 18
    const closeM = splitTimeE[1];

    // // Assuming req.body.startdate is in UTC timezone
    // const startDate = new Date(req.body.startdate); // Assuming req.body.startdate is '2024-03-12T07:30:00.000+00:00'
    // const startDateInLocalTimezone = new Date(
    //   startDate.toLocaleString("en-US", { timeZone: "America/New_York" })
    // ); // Convert to New York timezone

    // const startH = startDateInLocalTimezone.getHours(); // Should give you the correct hour value in the desired timezone
    // const startM = startDateInLocalTimezone.getMinutes(); // Should give you the correct minute value in the desired timezone

    const startH = new Date(req.body.startdate).getHours();
    const startM = new Date(req.body.startdate).getMinutes();

    const endH = new Date(req.body.enddate).getHours();
    const endM = new Date(req.body.enddate).getMinutes();

    console.log(openH, openM, closeH, closeM, startH, startM, endH, endM);

    const sumOpenTime = parseInt(openH) * 60 * 60 + parseInt(openM) * 60;
    const sumCloseTime = parseInt(closeH) * 60 * 60 + parseInt(closeM) * 60;
    const sumStartTime = parseInt(startH) * 60 * 60 + parseInt(startM) * 60;
    const sumEndTime = parseInt(endH) * 60 * 60 + parseInt(endM) * 60;
    console.log(sumOpenTime, sumCloseTime, sumStartTime, sumEndTime);

    // const [openH, openM] = coworkingSpace.opentime.split(':').map(num => parseInt(num));
    // const [closeH, closeM] = coworkingSpace.closetime.split(':').map(num => parseInt(num));
    // Check Time
    if (sumStartTime < sumOpenTime) {
      return res.status(400).json({
        success: false,
        message: `Unavailable time`,
      });
    }

    if (sumEndTime > sumCloseTime) {
      return res.status(400).json({
        success: false,
        message: `Unavailable time`,
      });
    }

    //add user Id to req.body
    req.body.user = req.user.id;
    //Check for existed reservation
    const existedReservations = await Reservation.find({ user: req.user.id });
    //If the user is not an admin, they can only create 3 reservation.
    if (existedReservations.length >= 3 && req.user.role !== "admin") {
      return res.status(400).json({
        success: false,
        message: `The user with ID ${req.user.id} has already made 3 reservations`,
      });
    }

    const reservation = await Reservation.create(req.body);

    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Cannot create Reservation",
    });
  }
};

//@desc     Update reservation
//@route    PUT /api/v1/reservations/:id
//@access   Private
exports.updateReservation = async (req, res, next) => {
  try {
    let reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: `No reservation with the id of ${req.params.id}`,
      });
    }

    //Make sure user is the reservation owner
    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to update this reservation`,
      });
    }

    reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Cannot update Reservation" });
  }
};

//@desc     Delete reservation
//@route    DELETE /api/v1/reservations/:id
//@access   Private
exports.deleteReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: `No reservation with the id of ${req.params.id}`,
      });
    }

    //Make sure user is the reservation owner
    if (
      reservation.user.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(401).json({
        success: false,
        message: `User ${req.user.id} is not authorized to delete this reservation`,
      });
    }

    await reservation.deleteOne();
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Cannot delete Reservation" });
  }
};

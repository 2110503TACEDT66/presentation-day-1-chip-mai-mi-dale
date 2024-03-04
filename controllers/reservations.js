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
    query = Reservation.find({ user: req.user.id }).populate(
      {
        path: "coworking",
        //   select: "name address tel",
      },
      {
        path: "room",
        //   select: "name address tel",
      }
    );
  } else {
    //admin
    if (req.params.coworkingId) {
      console.log(req.params.coworkingId);
      query = Reservation.find({
        coworking: req.params.coworkingId,
      }).populate(
        {
          path: "coworking",
          //   select: "name address tel",
        },
        {
          path: "room",
          //   select: "name address tel",
        }
      );
    } else {
      query = Reservation.find().populate(
        {
          path: "coworking",
          //   select: "name address tel",
        },
        {
          path: "room",
          //   select: "name address tel",
        }
      );
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
    const reservation = await Reservation.findById(req.params.id).populate(
      {
        path: "coworking",
        //   select: "name description tel",
      },
      {
        path: "room",
        //   select: "name address tel",
      }
    );

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
//@route    POST /api/v1/coworking/:coworkingId/reservation
//@access   Private
exports.addReservation = async (req, res, next) => {
  try {
    req.body.coworking = req.params.coworkingId;

    const coworking = await CoworkingSpace.findById(req.params.coworkingId);

    if (!coworking) {
      return res.status(404).json({
        success: false,
        message: `No coworking with the id of ${req.params.coworkingId}`,
      });
    }

    // const room = await CoworkingSpace.findById(req.body.room);

    // if (!room) {
    //   return res.status(404).json({
    //     success: false,
    //     message: `No room id: ${req.body.room} in Coworking id: ${req.params.coworkingId}`,
    //   });
    // }

    //add user Id to req.brsody
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

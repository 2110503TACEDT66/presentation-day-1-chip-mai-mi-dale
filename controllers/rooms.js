const Room = require("../models/Room");
const CoworkingSpace = require("../models/CoworkingSpace");

//@desc     Get all rooms
//@route    GET /api/v1/rooms
//@access   Public
exports.getRooms = async (req, res, next) => {
  const reqQuery = { ...req.query };
  const removeFields = ["select", "sort", "page", "limit"];
  removeFields.forEach((param) => delete reqQuery[param]);
  let queryStr = JSON.stringify(reqQuery).replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );
  // Finding resource
  let query = Room.find(JSON.parse(queryStr));
  // Select
  if (req.query.select) {
    query = query.select(req.query.select.split(",").join(" "));
  }
  // Sort
  query = req.query.sort
    ? query.sort(req.query.sort.split(",").join(" "))
    : query.sort("-createdAt");
  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIdx = (page - 1) * limit;
  const endIdx = page * limit;
  const total = await Room.countDocuments();
  query = query.skip(startIdx).limit(limit);
  try {
    const rooms = await query;

    const pagination = {};
    if (endIdx < total) {
      pagination.next = { page: page + 1, limit };
    }
    if (startIdx > 0) {
      pagination.prev = { page: page - 1, limit };
    }

    res.status(200).json({
      success: true,
      count: rooms.length,
      pagination,
      data: rooms,
    });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc     Get single room
//@route    GET /api/v1/rooms/:id
//@access   Public
exports.getRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(400).json({ success: false });
    }

    res.status(200).json({ success: true, data: room });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc     Create a room
//@route    POST /api/v1/rooms
//@access   Private
exports.createRoom = async (req, res, next) => {
  const room = await Room.create(req.body);
  const {coId} = req.body.data;
  const coworkingspace = CoworkingSpace.findById(coId);
  console.log(coworkingspace);
  // await coworkingspace.save();
  res.status(201).json({
    success: true,
    data: room,
  });
};

//@desc     Update single room
//@route    PUT /api/v1/rooms/:id
//@access   Private
exports.updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!room) {
      return res.status(400).json({ success: false });
    }

    res.status(200).json({ success: true, data: room });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc     Delete single room
//@route    DELETE /api/v1/rooms/:id
//@access   Private
exports.deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(400).json({
        success: false,
        message: `Bootcamp not found with id of ${req.params.id}`,
      });
    }

    await room.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

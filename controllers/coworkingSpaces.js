const CoworkingSpace = require("../models/CoworkingSpace");

//@desc     Get all coworkingSpaces
//@route    GET /api/v1/coworkingSpaces
//@access   Public
exports.getCoworkingSpaces = async (req, res, next) => {
  let query;

  //Copy req.query
  const reqQuery = { ...req.query };

  //Fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];

  //Loop over remove fields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);
  console.log(reqQuery);

  //Create query string
  let queryStr = JSON.stringify(req.query);
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  //finding resource
  query = CoworkingSpace.find(JSON.parse(queryStr));

  //Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }
  //Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("name");
  }

  //Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 5;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  try {
    const total = await CoworkingSpace.countDocuments();
    query = query.skip(startIndex).limit(limit);

    //Executing query
    const coworkingSpaces = await query;

    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    //Calculate rooms of coworking spaces
    for (const co of coworkingSpaces) {
      co.roomcount = await co.calculateRoomCount();
      await co.save();
    }

    res.status(200).json({
      success: true,
      count: coworkingSpaces.length,
      pagination,
      data: coworkingSpaces,
    });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc     Get single co-working space
//@route    GET /api/v1/coworkingSpaces/:id
//@access   Public
exports.getCoworkingSpace = async (req, res, next) => {
  try {
    const coworkingSpace = await CoworkingSpace.findById(
      req.params.id
    ).populate({
      path: "rooms",
      select: "name capacity -coworkingspace",
    });

    if (!coworkingSpace) {
      return res.status(404).json({
        success: false,
        message: `Couldn't find Coworking Space with id: ${req.params.id}`,
      });
    }

    res.status(200).json({ success: true, data: coworkingSpace });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//@desc     Create a co-working space
//@route    POST /api/v1/coworkingSpaces
//@access   Private
exports.createCoworkingSpace = async (req, res, next) => {
  try {
    // Create the coworking space
    const coworkingSpace = new CoworkingSpace(req.body);

    // Ensure the time range is valid before creating the coworking space
    if (!coworkingSpace.isValidTimeRange()) {
      return res.status(400).json({
        success: false,
        msg: "Invalid time range: Opening time must be before closing time",
      });
    }

    // Save the coworking space
    await coworkingSpace.save();

    res.status(201).json({
      success: true,
      data: coworkingSpace,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "Cannot create Coworking Space",
    });
  }
};

//@desc     Update single co-working space
//@route    PUT /api/v1/coworkingSpaces/:id
//@access   Private
exports.updateCoworkingSpace = async (req, res, next) => {
  try {
    const coworkingSpace = await CoworkingSpace.findById(req.params.id);

    if (!coworkingSpace) {
      return res.status(400).json({
        success: false,
        msg: `Couldn't find Coworking Space id: ${req.params.id}`,
      });
    }

    // Ensure the time range is valid before updating
    if (!coworkingSpace.isValidTimeRange()) {
      return res.status(400).json({
        success: false,
        msg: "Invalid time range: Opening time must be before closing time",
      });
    }

    // Update the coworking space
    await coworkingSpace.updateOne(req.body, {
      new: true,
      runValidators: true,
    });

    // Fetch the updated coworking space after the update
    const updatedCoworkingSpace = await CoworkingSpace.findById(req.params.id);

    // Calculate the room count and update the roomcount field
    const roomCount = await updatedCoworkingSpace.calculateRoomCount();
    updatedCoworkingSpace.roomcount = roomCount;
    await updatedCoworkingSpace.save();

    res.status(200).json({ success: true, data: updatedCoworkingSpace });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

//@desc     Delete single co-working space
//@route    DELETE /api/v1/coworkingSpaces/:id
//@access   Private
exports.deleteCoworkingSpace = async (req, res, next) => {
  try {
    const coworkingSpace = await CoworkingSpace.findById(req.params.id);

    if (!coworkingSpace) {
      return res.status(400).json({
        success: false,
        message: `Couldn't find Coworking Space id: ${req.params.id}`,
      });
    }

    await coworkingSpace.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false });
  }
};

const CoworkingSpace = require('../models/CoworkingSpace')

//@desc     Get all coworkingSpaces
//@route    GET /api/v1/coworkingSpaces
//@access   Public
exports.getCoworkingSpaces= async (req,res,next) => {
    let query;

    //Copy req.query
    const reqQuery = {...req.query};

    //Fields to exclude
    const removeFields=['select', 'sort', 'page', 'limit'];

    //Loop over remove fields and delete them from reqQuery
    removeFields.forEach(param=>delete reqQuery[param]);
    console.log(reqQuery);

    //Create query string
    let queryStr=JSON.stringify(req.query);
    queryStr=queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    //finding resource
    query = CoworkingSpace.find(JSON.parse(queryStr)).populate('reservations').populate('rooms');

    //Select Fields
    if(req.query.select) {
        const fields=req.query.select.split(',').join(' ');
        query=query.select(fields);
    }
    //Sort
    if(req.query.sort){
        const sortBy=req.query.sort.split(',').join(' ');
        query=query.sort(sortBy);
    } else {
        query=query.sort('name');
    }

    //Pagination
    const page=parseInt(req.query.page,10)||1;
    const limit=parseInt(req.query.limit,10)||25;
    const startIndex=(page-1)*limit;
    const endIndex=page*limit;

    try{
        const total=await CoworkingSpace.countDocuments();
        query = query.skip(startIndex).limit(limit);
        
        //Executing query
        const coworkingSpaces = await query;

        const pagination = {};

        if(endIndex<total){
            pagination.next={
                page:page+1,
                limit
            }
        }

        if(startIndex>0){
            pagination.prev={
                page:page-1,
                limit
            }
        }
    
        res.status(200).json({
            success:true, 
            count:coworkingSpaces.length,
            pagination,
            data:coworkingSpaces
        });
    } catch (err) {
        res.status(400).json({success:false});
    }
};

//@desc     Get single co-working space
//@route    GET /api/v1/coworkingSpaces/:id
//@access   Public
exports.getCoworkingSpace= async (req,res,next) => {
    try{
        const coworkingSpace = await CoworkingSpace.findById(req.params.id);

        if(!coworkingSpace){
            return res.status(400).json({success:false});
        }

        res.status(200).json({success:true,data:coworkingSpace});
    } catch (err) {
        res.status(400).json({success:false});
    }
};

//@desc     Create a co-working space
//@route    POST /api/v1/coworkingSpaces
//@access   Private
exports.createCoworkingSpace= async (req,res,next) => {
    const coworkingSpace = await CoworkingSpace.create(req.body);
    res.status(201).json({
        success:true, 
        data: coworkingSpace
    });
};

//@desc     Update single co-working space
//@route    PUT /api/v1/coworkingSpaces/:id
//@access   Private
exports.updateCoworkingSpace= async(req,res,next) => {
    try{
        const coworkingSpace = await CoworkingSpace.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        
        if(!coworkingSpace){
            return res.status(400).json({success:false});
        }

        res.status(200).json({success:true, data:coworkingSpace});
    } catch (err) {
        res.status(400).json({success:false});
    }
};

//@desc     Delete single co-working space
//@route    DELETE /api/v1/coworkingSpaces/:id
//@access   Private
exports.deleteCoworkingSpace= async(req,res,next) => {
    try{
        const coworkingSpace = await CoworkingSpace.findById(req.params.id);

        if(!coworkingSpace){
            return res.status(400).json({success:false, message:`Bootcamp not found with id of ${req.params.id}`});
        }

        await coworkingSpace.deleteOne();
        res.status(200).json({success:true, data: {}});
    } catch (err) {
        res.status(400).json({success:false});
    }
};


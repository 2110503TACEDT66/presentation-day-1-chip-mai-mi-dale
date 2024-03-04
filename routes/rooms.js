const express = require('express');
const {getRooms, getRoom, addRoom, updateRoom, deleteRoom} = require('../controllers/rooms');

const router = express.Router({mergeParams: true});

const {protect, authorize} = require('../middleware/auth');

router.route('/')
    .get(protect, getRooms)
    .post(protect, authorize('admin', 'user'), addRoom);
router.route('/:id')
    .get(protect, getRoom)
    .put(protect, authorize('admin', 'user'), updateRoom)
    .delete(protect, authorize('admin', 'user'), deleteRoom);

module.exports = router;
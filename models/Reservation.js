const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
    resDate: {
        type: Date,
        required: true 
        // in range of co-open time - co-close time***
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    coworkingSpace: {
        type: mongoose.Schema.ObjectId,
        ref: 'CoworkingSpace',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Reservation', ReservationSchema);

/* 
# changed code lists
- changed hospital to coworkingSpace & appointment to reservation
*/

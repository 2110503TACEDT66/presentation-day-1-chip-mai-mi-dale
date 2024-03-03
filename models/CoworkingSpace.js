const mongoose = require('mongoose');

const CoworkingSpaceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        unique: true,
        trim: true,
        maxlength: [100, 'Name can not be more than 100 characters']
    },

    address: {
        type: String,
        required: [true, 'Please add an address']
    },

    tel: {
        type: String,
        required: [true, 'Please add a telephone number'],
        unique: true,
    },

    time: {
        type: Date,
        required: [true, 'Please add an open-close time']
    }
},
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    });

    CoworkingSpaceSchema.pre('deleteOne', {document: true, query: false}, async function(next) {
        console.log(`Reservations being removed from Co-working space ${this._id}`);
        await this.model('Reservation').deleteMany({coWorking: this._id});
        next();
    });

    // Reverse populate with virtuals
    CoworkingSpaceSchema.virtual('reservations', {
    ref: 'Reservation',
    localField: '_id',
    foreignField: 'coworkingSpace',
    justOne: false
});

module.exports = mongoose.model('CoworkingSpace', CoworkingSpaceSchema);

/* 
# changed code lists
- changed hospital to coworking & appointment to reservation
- adjust maxlength of name
- add time
- delete some fields
*/
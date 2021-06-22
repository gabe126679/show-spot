const mongoose = require('mongoose');

const showSchema = mongoose.Schema({
    headliner :{
        type: String,
        required: true
    },
    hlLast :{
        type: String,
        required: true
    },
    almost :{
        type: String,
        required: false
    },
    alLast :{
        type: String,
        required: false
    },
    middle :{
        type: String,
        required: false
    },
    mdLast :{
        type: String,
        required: false
    },
    nextartist :{
        type: String,
        required: false
    },
    naLast :{
        type: String,
        required: false
    },
    opener:{
        type: String,
        required: false
    },
    opLast :{
        type: String,
        required: false
    },
    venueChoice:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        required: false
    },
    spotter:{
        type: String,
        required: false
    },
    headlinerAccept:{
        type: Number,
        default: 0
    },
    venueAccept:{
        type: Number,
        default: 0
    }
})


const Show = mongoose.model('Show', showSchema)
module.exports.Show = Show
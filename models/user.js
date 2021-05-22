const mongoose = require('mongoose')

// UserSchema
const UserSchema = mongoose.Schema({
    username: {
    type: String,
    required: true
    },    
    password: {
      type: String,
      required: true
    },
    firstname: {
      type: String,
      default: null
    },    
    lastname: {
      type: String,
      default: null
    },
    maininstrument: {
      type: String,
      default: null
    },
    venuename: {
      type: String,
      default: null
    },    
    address: {
      type: String,
      default: null
    },
    maxcap: {
      type: String,
      default: null
    },
    artistVerification: {
      type: Number,
      default: 0
    }
})
  
const User = mongoose.model('User', UserSchema)
module.exports.User = User

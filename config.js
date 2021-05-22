const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const { User } = require('./models/user')

module.exports = async (passport) => {

passport.use(new LocalStrategy(function (username, password, done) {
    // Match Username
    let query = { username: username }
    User.findOne(query, function (err, user) {
    if (user == null) {
      return done(null, false, { message: 'No user with that name' })
    }

      // Match Password
      bcrypt.compare(password, user.password, function (err, isMatch) {
        if (err) throw err
        if (isMatch) {
          return done(null, user)
        } else {
          return done(null, false, { message: 'Wrong password' })
        }
      })
    })
}))

passport.serializeUser(function (user, done) {
    done(null, user.id)
})
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
    done(err, user)
})
})
}


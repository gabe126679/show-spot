const express = require('express')
const path = require('path')
const flash = require('connect-flash')
const session = require('cookie-session')
const mongoose = require('mongoose')
const passport = require('passport')
const bcrypt = require('bcrypt')
const methodOverride = require('method-override')

const app = express()

MONGODB_URI="mongodb+srv://gabe126:retard7861BT@cluster0.u93vl.mongodb.net/cluster0?retryWrites=true&w=majority"

// mongodb connection 
mongoose.connect(MONGODB_URI) || 'mongodb://localhost/origin', {useNewUrlParser: true, useUnifiedTopology: true}

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function() {
  console.log('bro, you are SO connected!')
})

const { Show } = require('./models/shows')
const { User } = require('./models/user')


app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(flash())
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}))
require('./config')(passport);
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

// home route
app.get('/', checkAuthenticated, (req, res) => {
    Show.find({}, function (err, shows) {
      if (err) {
        console.log(err)
      } else {
        res.render('index', {
          headliner: 'Shows',
          shows: shows
        })
      }
    })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login')
})

// Login Process
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))
  

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register')
})

// Register Proccess
app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const newUser = await User.create({
      username: req.body.username,
      password: hashedPassword
    })
      newUser.save()
        res.redirect('/login')
      } catch {
        res.redirect('/register')
      }
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

// // ROUTES ROUTES ROUTES ROUTES ROUTES
app.get('/artReg', checkAuthenticated, async (req, res) => {
  res.render('artistRegister')
})

app.post('/artReg', checkAuthenticated, async (req, res) => {
  try {
    await User.findOneAndUpdate({_id: req.user._id},
      {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        maininstrument: req.body.maininstrument,
        artistVerification: 1
      }, {new : true})
      res.render('artistDashboard')
  } catch (error) {
    res.redirect('/artReg')
  }   
})

app.get('/artDash', checkAuthenticated, isArtist, (req, res) => {
  res.render('artistDashboard')
})

app.get('/promoteAshow', checkAuthenticated, (req, res) => {
  res.render('promoteAshow')
})

app.post('/promoteAshow', checkAuthenticated, async (req, res) => {
  try {
    let show = await Show.create({
      headliner: req.body.headliner,
      almost: req.body.almost,
      middle: req.body.middle,
      next: req.body.nextArt,
      opener: req.body.opener,
      venueChoice: req.body.venueChoice,
      spotter: req.user._id
    })
    show.save()
    req.flash('success', 'you promoted a show!')
  
        res.render('index')
  } catch (error) {
    res.redirect('/promoteAshow')
  }
})

app.get('/showBank', checkAuthenticated, (req, res) => {
  Show.find({}, function (err, shows) {
    if (err) {
      console.log(err)
    } else {
      res.render('showbank', {
        title: 'shows',
        shows: shows
      })
    }
  })
})

// 'shows' = a passable result of the method 'find' used on the model 'Show' real neat stuff
app.get('/inviteArtist', checkAuthenticated, artistInvited, async (req, res) => {
  const query = Show.where({ headlinerAccept: 0 })
  await query.find({ headliner: req.user.firstname }, function (err, shows) {
      if (err) {
      console.log(err)
      } else {
        res.render('artInvite', {
          title: 'shows',
          shows: shows
      })}
})
})

app.get('/artInviteForm/:id', checkAuthenticated, headlinerInvited, async (req, res) => {
  const show = await Show.findById(req.params.id) 
  res.render('artInviteForm', {
    show: show
  })
})

app.post('/artInviteForm/:id', checkAuthenticated, async (req, res) => {
  const query = Show.where({ headlinerAccept: 0 })
  await query.findOneAndUpdate({ headliner: req.user.firstname },
    { headlinerAccept: 1 }, 
    {new : true})
    let show = await Show.findById(req.params.id) 
      res.render('artistDashboard', {
        show: show
      })
})

app.get('/inviteVenue', checkAuthenticated, venueInvited, async (req, res) => {
  const query = Show.where({ venueAccept: 0 })
  await query.find({ venueChoice: req.user.venuename }, function (err, shows) {
      if (err) {
      console.log(err)
      } else {
        res.render('venInvite', {
          title: 'shows',
          shows: shows
      })}
})
})

app.get('/venInviteForm/:id', checkAuthenticated, venueChoiceInvited, async (req, res) => {
  const show = await Show.findById(req.params.id) 
  res.render('venInviteForm', {
    show: show
  })
})

app.post('/venInviteForm/:id', checkAuthenticated, async (req, res) => {
  const query = Show.where({ venueAccept: 0 })
  await query.findOneAndUpdate({ venueChoice: req.user.venuename },
    { venueAccept: 1 }, 
    {new : true})
    let show = await Show.findById(req.params.id) 
      res.render('venDashboard', {
        show: show
      })
})

app.get('/showBill/:id', checkAuthenticated, async (req, res) => {   

    let show = await Show.findById(req.params.id)
    let user = await User.findById(show.spotter)
      res.render('viewBill', {
        show: show,
        artists: user.headliner
      })
})

app.get('/showBillDelete/:id', checkAuthenticated, async (req, res) => {
  let show = await Show.findById(req.params.id)
  res.render('viewBillDelete', {
    show: show
  }) 
})

app.post('/showBillDelete/:id', checkAuthenticated, async (req, res) => {
  await Show.findOneAndDelete({ _id: req.params.id })
  let shows = await Show.find({ spotter: req.user._id })
  res.render('promotedShows', {
    title: 'shows',
    shows: shows
  })
})

app.get('/venReg', checkAuthenticated, async (req, res) => {
  res.render('venRegister')
})

app.post('/venReg', checkAuthenticated, async (req, res) => {
    try {
      await User.findOneAndUpdate({_id: req.user._id},
        {
          venuename: req.body.venuename,
          address: req.body.address,
          maxcap: req.body.maxcap
        }, {new : true})
  
          res.render('venDashboard')
    
    } catch (error) {
      res.redirect('/venReg')
    }

})

app.get('/venDash', checkAuthenticated, isVenue, (req, res) => {
  res.render('venDashboard')
})

app.get('/promotedShows', checkAuthenticated, async (req, res) => {
      let shows = await Show.find({ spotter: req.user._id })
      res.render('promotedShows', {
        title: 'shows',
        shows: shows
      })
})

app.get('/attendedShows', checkAuthenticated, async (req, res) => {
  res.render('attendedShows')
})

app.get('/artists', checkAuthenticated, async (req, res) => {
  await User.find({ artistVerification: 1 }, (err, user) => {
    res.render('artists', {
      title: 'artists',
      user: user
  })
  })
})

app.get('/artistProfile/:id', checkAuthenticated, async (req, res) => {
  const artists = await User.findById(req.params.id) 
  res.render('artistProfile', {
    artists: artists
  })
})

app.get('/pendingShows', checkAuthenticated, (req, res) => {
  Show.find({
    headlinerAccept: 1,
    venueAccept: 1
  }, function (err, shows) {
    if (err) {
      console.log(err)
    } else {
      res.render('pendingShows', {
        title: 'Pending shows',
        shows: shows
      })
    }
  })
})

app.get('/bands', async (req, res) => {
  res.render('bands')
})

app.get('/playedShows', async (req, res) => {
  res.render('playedShows')
})

app.get('/hostedShows', async (req, res) => {
  res.render('hostedShows')
})

app.get('/rules', async (req, res) => {
  res.render('rules')
})

app.get('/schedule', async (req, res) => {
  res.render('schedule')
})

app.get('/youSure', checkAuthenticated, async (req, res) => {
  User.find({ _id: req.user._id }, function (err, users) {
    res.render('youSure', { 
      users: users 
    })
  })
})

app.get('/artPenShows', async (req, res) => {
  Show.find({
    headlinerAccept: 1,
    venueAccept: 1
  }, function (err, shows) {
    if (err) {
      console.log(err)
    } else {
      res.render('artPenShows', {
        title: 'Pending shows',
        shows: shows
      })
    }
  })
})

app.get('/venPenShows', async (req, res) => {
  Show.find({
    headlinerAccept: 1,
    venueAccept: 1
  }, function (err, shows) {
    if (err) {
      console.log(err)
    } else {
      res.render('venPenShows', {
        title: 'Pending shows',
        shows: shows
      })
    }
  })
})

app.get('/artShowBank', async (req, res) => {
  Show.find({}, function (err, shows) {
    if (err) {
      console.log(err)
    } else {
      res.render('artShowBank', {
        title: 'shows',
        shows: shows
      })
    }
  })
})

app.get('/venShowBank', async (req, res) => {
  Show.find({}, function (err, shows) {
    if (err) {
      console.log(err)
    } else {
      res.render('venShowbank', {
        title: 'shows',
        shows: shows
      })
    }
  })
})




// MIDDLEWARE MIDDLEWARE MIDDLEWARE MIDDLEWARE MIDDLEWARE!!!!!!!!!!!!!!!!!!!!!!!!!!!!

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

function isArtist (req, res, next) {

    if (req.user.firstname !== null) {
      return next()
    } else {
      res.redirect('/artReg')
    }
}

function isVenue (req, res, next) {

  if (req.user.venuename !== null) {
    return next()
  } else {
    res.redirect('/venReg')
  }
}

function artistInvited (req, res, next) {  
  let show = Show.find({ headliner: req.user._id.firstname }) 
  if (show) {
    return next()
  } else {
    res.redirect('/')
  }
}


function venueInvited (req, res, next) {  
  let show = Show.find({ venueChoice: req.user._id.venuename }) 
  if (show) {
    return next()
  } else {
    res.redirect('/')
  }
}

function headlinerInvited (req, res, next) {  
  const show = Show.findById(req.params.id)
  let now = Show.find({ headliner: show.headliner }) 
  if (now) {
    return next()
  } else {
    res.redirect('/artDash')
  }
}

function venueChoiceInvited (req, res, next) {  
  const show = Show.findById(req.params.id)
  let now = Show.find({ venueChoice: show.venueChoice }) 
  if (now) {
    return next()
  } else {
    res.redirect('/artDash')
  }
}
port = process.env.PORT || 3000
app.listen(port)

//require dev dependencies
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}



const express = require('express');
const app = express();
//for hashing passwords
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser')

const initializePassport = require('./passport-config')

initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

// store credentials locally
const users = [];

app.set('view-engine', 'ejs');
app.use(cookieParser())
// app.use(express.session({ secret: 'one piece' }))
app.use(express.urlencoded({extended: false}))

app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET || 'inka',
  resave: false,
  saveUninitialized: false
}))

//make sure the session persists
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/',(req, res) => {
	//redirect to register if not authenticated
	if(!req.isAuthenticated){
		res.render('index.ejs')
	} else {
		res.redirect('/register')
	}
})

// for the login form 
app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

// for the register form 
app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/register' , checkNotAuthenticated, async (req,res) => {
	try{
		// async...use await
		const hashedPassword = await bcrypt.hash(req.body.password, 10)
		users.push({
	      id: Date.now().toString(),
	      name: req.body.name,
	      email: req.body.email,
	      password: hashedPassword
  	 })
		// redirect to the login page
		res.redirect('/login')
	} catch{
		res.redirect('/register') // if it fails
	}
	console.log(users)
})

//logout
app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

//protect user information by redirecting
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

//if not authenticated redirect to login
function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.listen(process.env.PORT || 3000);
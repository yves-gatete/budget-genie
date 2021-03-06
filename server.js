//require dev dependencies
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}



const express = require('express');
const app = express();
//for hashing passwords
const bcrypt = require('bcrypt')
const

passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser')

var mongo_uri = process.env.MONGODB_URI;
var users;

const MongoClient = require('mongodb').MongoClient;
MongoClient.connect(mongo_uri, (err, database) => {
  if(err) throw err;
  db = database;
  console.log(database);
  bg = db.db("budget_genie");
  users = bg.collection("users");

  // Start the app after the db connection is ready
  app.listen(process.env.PORT || 3000);
})



const initializePassport = require('./passport-config')

initializePassport(
  passport,
  email => users.findOne({email: email}).then(user => user), 
  id => users.findOne({id: id}).then(user => user) 
)

// get

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

// use folder for static files
app.use(express.static(__dirname + '/static'));

//make sure the session persists
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

// home page
app.get('/',(req, res) => {
	//redirect to register if not authenticated
	if(!req.isAuthenticated){
		res.render('home.ejs')
	} else {
		res.redirect('/register')
	}
})

// for the login form 
app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, async (req, res) => {
	users.findOne({ email: req.body.email}, function (err, user) {
		if (err) {
			res.redirect('/login')
		} if (!user) { 
			res.redirect('/login') 
		} else {
			bcrypt.compare(req.body.password, user.password, function(error, isMatch) {
				if(error) res.redirect('/login')
				if(isMatch) {
					res.render('home.ejs')
				} else {
					res.render('login.ejs')
				}
			})
		}
	})
})

// for the register form 
app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/register' , checkNotAuthenticated, async (req,res) => {
	try{
		// async...use await
		const hashedPassword = await bcrypt.hash(req.body.password, 10)
		// add to db
		new_user  = {
	      id: Date.now().toString(),
	      name: req.body.name,
	      email: req.body.email,
	      password: hashedPassword
  	 	};
		users.insertOne(new_user);
		// redirect to the login page
		res.redirect('/login')
	} catch{
		res.redirect('/register') // if it fails
	}
	console.log(new_user)
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


//require an https module 
const https = require("https"); 
//const express = require("express"); 
const body_parser = require("body-parser"); 
const fs = require('fs'); 
//const app = express(); 
var html = fs.readFileSync('./views/chart.html');//changed from chart.html 
app.use(body_parser.urlencoded({extended: true})); 
app.get("/display", function(req, res){ res.sendFile(__dirname + "/home.ejs"); }); 
app.post("/display", function(req, resp){ 
const apikey = "4fb9488043a6d8f20a8cbffd2ab2aa9099933c83"; 
const url = "https://zenquotes.io/api/random/" + apikey ; 
//console.log(url); 
https.get(url, function(response){ 
response.on("data", function(data){ const quote = JSON.parse(data);
const q = quote[0].q; 
const author = quote[0].a; 
//resp.write("<p >The Quote of the day is: </p><br>"); 
resp.write("<p style='text-align:center' ><em>" + q + " </em></p><br>"); 
resp.write("<p style='text-align:center'><em> -" + author + " <e/m></p>"); resp.write(html); 
//resp.write("<canvas color='red' id='myChart' width='400' height='400'> </canvas>"); //resp.send("<p>"+q+"</p>"); 
}); }); 
}); 
//app.listen(3000, function(){ 
console.log("App is running on port 3000."); 
//})



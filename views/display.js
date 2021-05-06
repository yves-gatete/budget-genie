//jshint esversion:6 
//require an https module 
const https = require("https"); 
const express = require("express"); 
const body_parser = require("body-parser"); 
const fs = require('fs'); 
const app = express(); 
var html = fs.readFileSync('./chart.html');//changed from chart.html 
app.use(body_parser.urlencoded({extended: true})); 
app.get("/", function(req, res){ res.sendFile(__dirname + "/home.ejs"); }); 
app.post("/", function(req, resp){ 
const url = "https://zenquotes.io/api/today"; 
https.get(url, function(response){ 
response.on("data", function(data){ const quote = JSON.parse(data); //console.log(quote); const q = quote[0].q; //console.log(q); 
const author = quote[0].a; 
resp.write("<p>The Quote of the day is: </p><br>"); 
resp.write("<p><em>" + q + " </em></p><br>"); 
resp.write("<p><em> -"+ author+" <e/m></p>"); 
resp.write(html); 
//resp.write("<canvas color='red' id='myChart' width='400' height='400'> </canvas>"); //resp.send("<p>"+q+"</p>"); 
}); }); 
}); 
app.listen(3000, function(){ 
console.log("App is running on port 3000."); 
})

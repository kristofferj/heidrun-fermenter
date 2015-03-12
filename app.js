var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var browserify = require('browserify-middleware');

var fs = require('fs');
var sys = require('sys');
var sqlite3 = require('sqlite3');

var routes = require('./routes/index');
var users = require('./routes/users');
var Firebase = require("firebase");

var app = express();

var tempDevice = '/sys/bus/w1/devices/28-000006a98b41/w1_slave';


// Firebase setup
var myFirebaseRef = new Firebase("https://shining-fire-1483.firebaseio.com/");

// DB
var db = new sqlite3.Database('./piTemps.db');

app.get('/js/app.js', browserify('./browser/app.js'));

function insertTemp(data){
   // data is a javascript object
   var statement = db.prepare("INSERT INTO temperature_records VALUES (?, ?)");
   // Insert values into prepared statement
   statement.run(data.temperature_record[0].unix_time, data.temperature_record[0].celsius);
   // Execute the statement
   statement.finalize();
}

// Read current temperature from sensor
function readTemp(callback){

  fs.readFile('/sys/bus/w1/devices/28-000006a98b41/w1_slave', function(err, buffer)
	{
      if (err){
         console.error('Could not find device');
         console.error(err);
         var data = {
            temperature_record:[{
            unix_time: Date.now(),
            celsius: 25.0
         }]};
         callback(data);
         return;
         //process.exit(1);
      }

      // Read data from file (using fast node ASCII encoding).
      var data = buffer.toString('ascii').split(" "); // Split by space

      // Extract temperature from string and divide by 1000 to give celsius
      var temp  = parseFloat(data[data.length-1].split("=")[1])/1000.0;

      // Round to one decimal place
      temp = Math.round(temp * 10) / 10;

      // Add date/time to temperature
   	var data = {
            temperature_record:[{
            unix_time: Date.now(),
            celsius: temp
            }]};

      // Execute call back with data
      callback(data);
   });
};

// Create a wrapper function which we'll use specifically for logging
function logTemp(interval){
      // Call the readTemp function with the insertTemp function as output to get initial reading
      readTemp(insertTemp);
      // Set the repeat interval (milliseconds). Third argument is passed as callback function to first (i.e. readTemp(insertTemp)).
      setInterval(readTemp, interval, insertTemp);
};

// Get temperature records from database
function selectTemp(num_records, start_date, callback){
   // - Num records is an SQL filter from latest record back trough time series,
   // - start_date is the first date in the time-series required,
   // - callback is the output function
   var current_temp = db.all("SELECT * FROM (SELECT * FROM temperature_records WHERE unix_time > (strftime('%s',?)*1000) ORDER BY unix_time DESC LIMIT ?) ORDER BY unix_time;", start_date, num_records,
      function(err, rows){
         if (err){
			   response.writeHead(500, { "Content-type": "text/html" });
			   response.end(err + "\n");
			   console.log('Error serving querying database. ' + err);
			   return;
				      }
         data = {temperature_record:[rows]}
         callback(data);
   });
};

// Start temperature logging (every 5 min).
var msecs = (60 * 5) * 1000; // log interval duration in milliseconds
logTemp(msecs);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

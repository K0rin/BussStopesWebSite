const express = require("express");
//secure from injections
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());

app.get('/', (req, res) => {
  res.send('Welcome to my server!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
const mysql = require('mysql');

var con = mysql.createConnection({
  host: "d26893.mysql.zonevs.eu",
  user: "d26893_busstops",
  password: "3w7PYquFJhver0!KdOfF",
  database: "d26893_busstops"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  con.query('SELECT * FROM `galitski_stops` ORDER BY `stop_area` ASC', function (err, result) {
    if (err) throw err;
    console.log("Result: " + JSON.stringify(result[0]));

  });
});

app.get("/getAriaList", (request, response ) => {
  con.query("SELECT DISTINCT stop_area FROM galitski_stops ORDER BY stop_area", function (err, result){
    response.send(JSON.stringify(result));
  });
});

app.get("/getBussStops/:stopArea", (request, response ) => {
  con.query("SELECT * FROM galitski_stops WHERE stop_area = '" + request.params.stopArea +"' ORDER BY stop_name", function (err, result){
    response.send(JSON.stringify(result));
  });
});

app.get("/getBuss/:stopId", (request, response ) => {
  con.query("SELECT * FROM galitski_routes WHERE route_id in (SELECT route_id FROM galitski_trips WHERE trip_id IN (SELECT trip_id FROM galitski_stop_times WHERE stop_id = '" + request.params.stopId + "'" + "))", function (err, result){
    response.send(JSON.stringify(result));
  });
});

app.get("/getStopsList", (request, response ) => {
  con.query("SELECT * FROM galitski_stops", function (err, result){
    response.send(JSON.stringify(result));
  });
});

app.get("/getBussTime/:routeId", (request, response ) => {
  con.query("SELECT * FROM galitski_stop_times WHERE trip_id in (SELECT trip_id FROM galitski_trips WHERE route_id = '" + request.params.routeId + "'" + ")", function (err, result){
    response.send(JSON.stringify(result));
  });
});

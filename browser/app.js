

var ref = new Firebase('https://shining-fire-1483.firebaseio.com');


function updateTemps(temps) {
  console.log(temps);
  var lastTemp = temps[temps.length-1].temp;
  $('#bigtemp').html(lastTemp + '˚C');
}

function paintChart(temps) {

  var margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 50
    },
  width = window.innerWidth - margin.left - margin.right,
  height = window.innerHeight - margin.top - margin.bottom;

  var parseDate = d3.time.format("%d-%b-%y").parse;

  var x = d3.time.scale()
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

  var line = d3.svg.line()
      .x(function(d) { return x(d.timestamp); })
      .y(function(d) { return y(d.temp); });

  var svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  // temps.forEach(function(d) {
  //   d.timestamp = parseDate(d.date);
  //   d.temp = +d.temp;
  // });

  x.domain(d3.extent(temps, function(d) { return d.timestamp; }));
  y.domain(d3.extent(temps, function(d) { return d.temp; }));

  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("˚C");

  svg.append("path")
      .datum(temps)
      .attr("class", "line")
      .attr("d", line);

}

$(document).ready( function() {

  // Reads temps from firebase
  ref.on("value", function(snapshot) {
    var temps = snapshot.val();
    temps = $.map(temps.temps, function(value, index) {
      return [value];
    });
    updateTemps(temps);
    paintChart(temps);
    //console.log(snapshot.val());
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
});

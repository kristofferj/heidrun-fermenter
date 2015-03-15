

var ref = new Firebase('https://shining-fire-1483.firebaseio.com');


function updateTemps(temps) {
  var lastTemp = temps.fermenter[temps.fermenter.length-1].temp;
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
      .x(function(d) {
        return x(d.timestamp);
      })
      .y(function(d) {
        return y(d.temp);
      });

  var svg = d3.select("#chart").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  // temps.forEach(function(d) {
  //   d.timestamp = parseDate(d.date);
  //   d.temp = +d.temp;
  // });

  var yMaxFermenter = d3.max( temps.fermenter );
  var yMaxRoom = d3.max( temps.room );
  var yMinFermenter = d3.max( temps.fermenter );
  var yMinRoom = d3.max( temps.room );

  var yMax = Math.max(yMaxFermenter.temp, yMaxRoom.temp);
  var yMin = Math.min(yMinFermenter.temp, yMinRoom.temp)



  x.domain(d3.extent(temps.fermenter, function(d) { return d.timestamp; }));
  y.domain([yMin-5,yMax+5]);

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

  //var fermenter = svg.append("g");
  //var room = svg.append("g");

  svg.append("path")
      .datum(temps.fermenter)
      .attr("class", "line fermenter")
      .attr("d", line);

  svg.append("path")
      .datum(temps.room)
      .attr("class", "line room")
      .attr("d", line);

}


$(document).ready( function() {

  // Reads temps from firebase
  ref.on("value", function(snapshot) {
    var values = snapshot.val();
    fermenter = $.map(values.fermenter, function(value, index) {
      return [value];
    });
    room = $.map(values.room, function(value, index) {
      return [value];
    });
    var temps = {fermenter:fermenter, room:room};
    updateTemps(temps);
    paintChart(temps);
    //console.log(snapshot.val());
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });
});

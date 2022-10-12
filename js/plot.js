// Created by Chen Gong 10/2022

var margin = {top: 10, right: 40, bottom: 30, left: 30},
width = 450 - margin.left - margin.right,
height = 400 - margin.top - margin.bottom;

xrange = [0,100]
x_start = 60
yrange = [0,100]

expect_input_num = 3
// create our outer SVG element with a size of 500x100 and select it
var svg = d3.select("#scatter_area")
.attr("align","center")
.append("svg")
.attr("id", "plot")
.attr("width", width + margin.left + margin.right)
.attr("height", height + margin.top + margin.bottom)
// translate this svg element to leave some margin.
.append("g")
.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// svg repositioning
// $("svg").css({top: 100, left: 100, position:'absolute'});

// X scale and Axis
var x = d3.scaleLinear()
  .domain(xrange)         // This is the min and the max of the data: 0 to 100 if percentages
  .range([0 , width]);       // This is the corresponding value I want in Pixel

var orignal_x = d3.scaleLinear()
  .domain([0,width])
  .range(xrange)

// X scale and Axis
var y = d3.scaleLinear()
  .domain(yrange)         // This is the min and the max of the data: 0 to 100 if percentages
  .range([height, 0]);       // This is the corresponding value I want in Pixel

var orignal_y = d3.scaleLinear()
  .domain([height,0])
  .range(yrange)

const xAxisGrid = d3.axisBottom(x).tickSize(-height).tickFormat('').ticks(10);
const yAxisGrid = d3.axisLeft(y).tickSize(-width).tickFormat('').ticks(10);

// Create grids.
svg.append('g')
.attr('class', 'x axis-grid')
.attr('transform', 'translate(' + 0 + ',' + height + ')')
.call(xAxisGrid);
svg.append('g')
.attr('class', 'y axis-grid')
.call(yAxisGrid);

// x y axis
svg
.append('g')
.attr("transform", "translate(" + 0 + "," + height + ")")
.call(d3.axisBottom(x)); // remove number .tickFormat("");
svg
.append('g')
.call(d3.axisLeft(y));


// Create data
var data = [ {x:10, y:20}, {x:30, y:90}, {x:50, y:50} ]
var user_data = []
user_data.push(data[data.length-1])
// Add dots 
svg
.selectAll("whatever")
.data(data)
.enter()
.append("circle")
  .attr("cx", function(d){ return x(d.x) })
  .attr("cy", function(d){ return y(d.y) })
  .attr("r", 5)

// Add the line
svg.append("path")
.attr("id", "line")
.datum(data)
.attr("fill", "none")
.attr("stroke", "black")
.attr("stroke-width", 1.5)
.attr("d", d3.line()
  .curve(d3.curveNatural) // Just add that to have a curve instead of segments
  .x(function(d) { return x(d.x) })
  .y(function(d) { return y(d.y) })
  )


// create all hint point transparent for now, listen for mouse event 
for (let i = x_start; i <= xrange[1]; i+=10) {
  for (let j = 0; j <= yrange[1]; j+=10) {
    svg.append("circle")
    .attr("id", "hint-point")
    .attr("cx", x(i))
    .attr("cy", y(j))
    .attr("r", 10)
    .style("opacity", 0)
    .on("mouseenter", function(){
      d3.select(this).transition().duration(100).ease(d3.easeLinear).style("opacity", 0.8).attr("r",9);
    })
    .on("mouseleave",  function(){d3.select(this).transition().duration(100).ease(d3.easeLinear).style("opacity", 0).attr("r",10)})
  }
}



function update_data(x, y) { // each x value can only have one data
  var update = false
  for (let i=0; i < user_data.length; i++) {
    if (user_data[i].x == x) {
      update = true
      user_data[i] = {x: x, y:y}
    }
  }
  if (!update) user_data.push({x: x, y: y});
  
  if (user_data.length > expect_input_num) {
    enableSubmit()
  }
}


function distance(x1, y1, x2, y2) {
  return Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2))
}

function valid_mouse_pos(raw_x, raw_y) {
  for (let i = x_start; i <= xrange[1]; i+=10) {
    for (let j = 0; j <= yrange[1]; j+=10) {
      dis = distance(orignal_x(raw_x), orignal_y(raw_y), i, j);
      if (dis <= 3) {
        console.log("valid")
        console.log(i,j);
        return [i, j];
      }
    }
  }
  return -1
}

svg
.attr("pointer-events", "all")  // fix the issue on call sometime doesn't work
.on("click", function() {
  let pos = d3.mouse(this);
  console.log(pos)
  var valid_pos = valid_mouse_pos(pos[0], pos[1]) // check if mouse position is valid (on grid)
  console.log(valid_pos)
  if (valid_pos[0] >= 0) {
    var pos_x = valid_pos[0]
    var pos_y = valid_pos[1]
    console.log("enter")
    update_data(pos_x, pos_y)
    old_point = d3.selectAll("#x" + String(pos_x))
    old_point.remove()
    console.log(old_point)
    d3.select(this)
      .append("circle")
      .attr("id", "x" + String(pos_x))
      .attr("cx", x(pos_x))
      .attr("cy", y(pos_y))
      .attr("r", 5)
  }
  // remove old curve
  d3.selectAll("#user_path").remove()
  // add new curve using all selected points
  d3.select(this)
    .append("path")
    .attr("id", "user_path")
    .datum(user_data)
    .attr("fill", "none")
    .attr("stroke", "black")
    .attr("stroke-width", 1.5)
    .attr("d", d3.line()
      .curve(d3.curveNatural) // Just add that to have a curve instead of segments
      .x(function(d) { return x(d.x) })
      .y(function(d) { return y(d.y) })
      )
})


function enableSubmit() {
  document.getElementById("submit-button").disabled = false;
}


// svg
// .attr("pointer-events", "all")
// .on("mousemove", function(){
//   let pos = d3.mouse(this);
//   var valid_pos = valid_mouse_pos(pos[0], pos[1])
//   if (valid_pos[0] >= 0) {
//     var pos_x = valid_pos[0]
//     var pos_y = valid_pos[1]
//     d3.select(this)
//     .append("circle")
//     .attr("id", "hint-circle")
//     .attr("cx", x(pos_x))
//     .attr("cy", y(pos_y))
//     .attr("r", 5)
//     .on("mouseleave", function(){ d3.select(this).selectAll("#hint-circle").remove()})
//   }
// })

// svg.selectAll("#hint-circle")
//   .on("mouseleave", function(){ d3.selectAll("#hint-circle").remove()})


function SubmitEvent() {
  console.log("submit")
  d3.selectAll('*').remove()
  console.log(user_data)
}
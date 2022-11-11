// Created by Chen Gong 10/2022

// import Timer from "./timer.js";
// =====================================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js";
import { getFirestore, doc, setDoc } from 'https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js';
const firebaseConfig = {
  apiKey: "AIzaSyAjyjdZQxPKki7o_bcD28DIvNvK1YDM7ZU",
  authDomain: "trend-survey.firebaseapp.com",
  projectId: "trend-survey",
  storageBucket: "trend-survey.appspot.com",
  messagingSenderId: "269130863233",
  appId: "1:269130863233:web:a9444b1824f73455347380"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================================ set up plot scale and variables =======================================

const margin = {top: 10, right: 40, bottom: 30, left: 30}
const width = 450 - margin.left - margin.right
const height = 400 - margin.top - margin.bottom

var xrange = [0,100]
var x_start = 60
var yrange = [0,100]
var page = 0
var plotInfo = ""
var expect_input_num = 5       // enable submit after expected number
// var uuid = Date.now()

var curr_url = new URL(window.location.href)
var uuid = curr_url.searchParams.get("prolific_id");

// try {
//   const docRef = await setDoc(doc(db, "users", `${uuid}`), {["user_id"]: user_id}, {merge: true});
// } catch (e) {
//   console.error("Error adding document: ", e);
// }

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

// ========================================= define Timer  ==============================
// var timer = new Timer(updateHtmlTimer, 100)
var start = Date.now();
function Timer(fn, t) {

  var timerObj = setInterval(fn, t);

  this.stop = function() {
      if (timerObj) {
          clearInterval(timerObj);
          timerObj = null;
      }
      return this;
  }

  // start timer using current settings (if it's not already running)
  this.start = function() {
    start = Date.now();
    console.log("restart")
      if (!timerObj) {
          this.stop();
          timerObj = setInterval(fn, t);
      }
      return this;
  }

  // start with new or original interval, stop current interval
  this.restart = function() {
      // console.log("1")
      return this.stop().start();
  }
}

function updateHtmlTimer() {
  var delta = Date.now() - start; // milliseconds elapsed since start
  var time = (Math.round(delta/1000 * 100) / 100).toFixed(2) // format print time
  // console.log(time)
  document.getElementById("timer").innerHTML = "Time: " + time;
}

var timer = new Timer(updateHtmlTimer, 100)

// sleep for ms time, use in async function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// cover original plot after n seconds
async function cover(svg, time) {
  console.log("waiting")
  await sleep(time*1000)
  svg.append("rect")
  .attr("x", x(-1))
	.attr("y", y(100))
	.attr("width", x(49)-x(-1))
	.attr("height", y(0)- y(100))
	.attr("fill", d3.color(randomColor));
}

function updatePlotCount(count) {
  document.getElementById("plot_num").innerHTML = "Plot: " + count;
}

// ======================================== Get all plots ============================
const colors = ["red", "green", "black"]
const plotTypes = ["line", "area"]
const time = {"short":2,"long":5}
const randomColor = colors[Math.floor(Math.random() * colors.length)]; // choose a random color from red green black
console.log(randomColor)

var all_data = [[{x:0, y:50}, {x:10, y:60}, {x:20, y:40}, {x:30, y:50}, {x:40, y:50},  {x:50, y:60}], 
                [{x:0, y:50}, {x:10, y:60}, {x:20, y:40}, {x:30, y:50}, {x:40, y:50},  {x:50, y:50}], 
                [{x:0, y:50}, {x:10, y:60}, {x:20, y:40}, {x:30, y:50}, {x:40, y:50},  {x:50, y:40}]]

const data_map = {"pos":all_data[0], "neu":all_data[1], "neg":all_data[2]}
var user_data = []

const data_path = 'https://raw.githubusercontent.com/cgong99/trend-survey/main/public/data/plots.json'

// var all_plots

fetch(data_path)
  .then((response) => response.json())
  .then((data) => {
  console.log(data)
  var all_plots = []
  
  for (let key in data) {

    all_plots.push(data[key])
  }
  all_plots = shuffleArray(all_plots)
  console.log(all_plots)

  render()

  // ============================================== render function ====================================
  function render() {
    timer.restart()
    // Set data by page
    // var data = [ {x:10, y:20}, {x:30, y:90}, {x:50, y:50} ]
    console.log("render")
    var curr_plot = all_plots[page]
    console.log(curr_plot)
    var data = data_map[curr_plot["data"]]
    var timeLimit = time[curr_plot["time"]]
    var plotType = curr_plot["plotType"]
    user_data = []
    user_data.push({x:data[data.length-1].x+0.4, y:data[data.length-1].y}) // add an offset to x to prevent overlapping

    plotInfo = curr_plot["data"] + "-" + curr_plot["time"] + "-" + curr_plot["plotType"]
    // console.log(plotInfo)
    document.getElementById("info").innerHTML = plotInfo
    document.getElementById("submit-button").addEventListener("click", submitPoints);
    updatePlotCount(page+1)
    disableSubmit()
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



    // Add all dots 
    // svg
    // .selectAll("whatever")
    // .data(data)
    // .enter()
    // .append("circle")
    //   .attr("cx", function(d){ return x(d.x) })
    //   .attr("cy", function(d){ return y(d.y) })
    //   .attr("r", 5)
    //   .style("fill", d3.color(randomColor))

    // Add the last dot
    svg
    .append("circle")
      .attr("cx",  x(data[data.length-1].x) )
      .attr("cy",y(data[data.length-1].y) )
      .attr("r", 5)
      .style("fill", d3.color(randomColor))
    
    // console.log(data[data.length-1].x, data[data.length-1].y)

    if (plotType == "line") {
      // Add the initial line
      svg.append("path")
      .attr("id", "line")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", randomColor)
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .curve(d3.curveNatural) // Just add that to have a curve instead of segments
        .x(function(d) { return x(d.x) })
        .y(function(d) { return y(d.y) })
        )
    } else {
      // Add the area
    svg.append("path")
      .attr("id", "line")
      .datum(data)
      .attr("fill", randomColor)
      .attr("opacity", 0.6)
      .attr("stroke", randomColor)
      .attr("stroke-width", 1.5)
      .attr("d", d3.area()
        .x(function(d) { return x(d.x) })
        .y0(y(0))
        .y1(function(d) { return y(d.y) })
        )
    }



    // create all hint point transparent for now, listen for mouse event 
    for (let i = x_start; i <= xrange[1]; i+=10) {
      for (let j = 0; j <= yrange[1]; j+=10) {
        svg.append("circle")
        .attr("id", "hint-point")
        .attr("cx", x(i))
        .attr("cy", y(j))
        .attr("r", 10)
        .style("opacity", 0)
        .style("fill", d3.color(randomColor))
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
      // console.log(user_data)
      user_data.sort(function(a,b){return a.x - b.x})
      // console.log(user_data)
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
          var dis = distance(orignal_x(raw_x), orignal_y(raw_y), i, j);
          if (dis <= 3) {
            // console.log("valid")
            // console.log(i,j);
            return [i, j];
          }
        }
      }
      return -1
    }

    // Add the cover after some time
    cover(svg, timeLimit)

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
        // console.log("enter")
        update_data(pos_x, pos_y)
        d3.selectAll("#x" + String(pos_x)).remove()
        d3.select(this)
          .append("circle")
          .attr("id", "x" + String(pos_x))
          .attr("cx", x(pos_x))
          .attr("cy", y(pos_y))
          .attr("r", 5)
          .style("fill", d3.color(randomColor))
      }
      // remove old curve
      d3.selectAll("#user_path").remove()
      // add new curve using all selected points
      if (plotType == "line") {
        d3.select(this)
        .append("path")
        .attr("id", "user_path")
        .datum(user_data)
        .attr("fill", "none")
        .attr("stroke", randomColor)
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
          .curve(d3.curveNatural) // Just add that to have a curve instead of segments
          .x(function(d) { return x(d.x) })
          .y(function(d) { return y(d.y) })
          )
      } else {
        svg.append("path")
        .attr("id", "user_path")
        .datum(user_data)
        .attr("fill", randomColor)
        .attr("opacity", 0.6)
        .attr("stroke", randomColor)
        .attr("stroke-width", 1.5)
        .attr("d", d3.area()
          .x(function(d) { return x(d.x) })
          .y0(y(0))
          .y1(function(d) { return y(d.y) })
          )
      }
    })



  }

  // render()

  function enableSubmit() {
    document.getElementById("submit-button").disabled = false
  }

  function disableSubmit() {
    document.getElementById("submit-button").disabled = true
  }

  function toggleSubmit() {
    document.getElementById("submit-button").disabled = !document.getElementById("submit-button").disabled;
  }

  async function submitPoints() {
    console.log("submit")
    d3.selectAll('#plot').remove()
    page += 1
    console.log(user_data)
    var plot_number = "plot" + page

    try {
      const docRef = await setDoc(doc(db, "users", `${uuid}`), {[plotInfo]: user_data}, {merge: true});
    } catch (e) {
      console.error("Error adding document: ", e);
    }

    if (page < Object.keys(all_plots).length) {
      render() // move to the next question
    } else {
      d3.selectAll('#question').remove()
      document.getElementById("end").style.display = "inline";
    }
  }
});



/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = array[i];
      array[i] = array[j];
      array[j] = temp;
  }
  return array
}
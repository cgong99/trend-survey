// Created by Chen Gong 10/2022

var start = Date.now();
export function Timer(fn, t) {

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
      console.log("1")
      return this.stop().start();
  }
}

export function updateHtmlTimer() {
  var delta = Date.now() - start; // milliseconds elapsed since start
  time = (Math.round(delta/1000 * 100) / 100).toFixed(2) // format print time
  // console.log(time)
  document.getElementById("timer").innerHTML = "Time: " + time;
}

// var timer = new Timer(updateHtmlTimer, 100)
// console.log(start)
// timer.start()



// sleep for ms time, use in async function
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// async function wait() {
//   console.log(`Waiting `);
//   await sleep(3000);
//   timer.restart()
//   console.log(start)
// }





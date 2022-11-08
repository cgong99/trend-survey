const input = document.querySelector('input');
const startButton = document.getElementById("start-button");
var link = document.getElementById('survey-link');

input.addEventListener('input', updateValue);

function updateValue(e) {
  if (e.target.value.length > 0) {
    startButton.disabled = false;
  } else {
    startButton.disabled = true
  }
  const linkString=  "plot_experiment.html?identifier=" + e.target.value
  // console.log(link)
  link.setAttribute('href', linkString);
}
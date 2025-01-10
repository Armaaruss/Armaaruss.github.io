"use strict";

import { spanishMode, translate } from "./index.js";

let labels = [];
let bars = [];
let classes;
var song1air = new Audio('https://dl.dropboxusercontent.com/scl/fi/dtag9d02zn53p3v74orwz/p_33251689_910.mp3?rlkey=ll5ha1damo08vwe2ixt8gt31b&st=i5bcbpq8&.mp3dl=0');
// This function makes the bar graph
// it takes in a URL to a teachable machine model,
// so we can retrieve the labels of our classes for the bars
export async function setupBarGraph(URL) {
  // the metatadata json file contains the text labels of your model
  const metadataURL = `${URL}metadata.json`;
  // get the metadata fdrom the file URL
  const response = await fetch(metadataURL);
  const json = await response.json();
  // get the names of the labels from the metadata of the model
  labels = json.wordLabels;
  // get the area of the webpage we want to build the bar graph
  // classes = document.getElementById('graph-wrapper');
  classes = document.getElementsByClassName("classes")[0];
  // make a bar in the graph for each label in the metadata
  labels.forEach((label, index) => makeBar(label, index));
}

// This function makes a bar in the graph
function makeBar(label, index) {
  // make the elements of the bar
  let barWrapper = document.createElement("div");
  // barWrapper.classList.add('probability');

  let barEl = document.createElement("progress");
  // barEl.classList.add('probability');
  // let percentEl = document.createElement('span');
  let labelText;
  // let labelEl = document.createElement('span');
  if (label === "_background_noise_") {
    labelText = spanishMode ? "Ruido de fondo" : "Background noise";
      
 
  } else {
       
    labelText = spanishMode ? translate(label) : label;
  }

  barEl.setAttribute("data-label", labelText);
  // assemble the elements
  // barWrapper.appendChild(labelEl);
  barWrapper.appendChild(barEl);
  // barWrapper.appendChild(percentEl);
  let classes = document.getElementsByClassName("classes")[0];
  classes.appendChild(barWrapper);

  // save references to each element, so we can update them later
  bars.push({
    bar: barEl
    // percent: percentEl
  });
}

// This function takes data (retrieved in the model.js file)
// The data is in the form of an array of objects like this:
// [{ className:class1, probability:0.75 }, { className:class2, probability:0.25 }, ... ]
// it uses this data to update the progress and labels of of each bar in the graph
export function updateBarGraph(data) {
  // iterate through each element in the data
  data.forEach((probability, index) => {
    // get the HTML elements that we stored in the makeBar function
    let barElements = bars[index];
    let barElement = barElements.bar;
    // let percentElement = barElements.percent;
    // set the progress on the bar

    //         // let's assume only 1 progress element on our page.
    // var p = document.querySelector('progress');
    // // where val is our new value
    barElement.setAttribute("value", probability);

    // set the percent value on the label
    // percentElement.innerText = convertToPercent(probability);
  });
}

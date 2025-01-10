"use strict";

window.AudioContext = window.AudioContext || window.webkitAudioContext;
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

var gui = new dat.GUI();
var canvas = document.getElementById("canvas");

var videoctx = canvas.getContext("2d");
var audioctx;

var started = false;

var settings = {
  fftSize: 1024,
  fftTime: 500,
  minDecibels: -100,
  maxDecibels: -30,
  minFrequency: 0,
  maxFrequency: 20000
};

var source, analyser;
var freqdata, imagedata;

var tid;
var minbin,
  maxbin,
  test = 0;
var time = canvas.width;

function draw() {
  analyser.getByteFrequencyData(freqdata);

  imagedata = videoctx.getImageData(1, 0, canvas.width - 1, canvas.height);
  // let imgData = videoctx.getImageData(1, 0, canvas.width - 1, canvas.height);
  videoctx.fillRect(0, 0, canvas.width, canvas.height);
  videoctx.putImageData(imagedata, 0, 0);

  for (var i = 0; i < freqdata.length; i++) {
    // for (var i = minbin; i < maxbin; i++) {
    var y = canvas.height - (i - minbin) - 1;
    var p = y * 4;
    var v = (2 * freqdata[i]) / 255;

    // imagedata.data[p++] = Math.max(0, 255 * v);
    // imagedata.data[p++] = Math.max(0, 255 * (v - 1));
    // imagedata.data[p++] = 54;
    // imagedata.data[p++] = 255;

    videoctx.beginPath();
    videoctx.strokeStyle = `rgba(${Math.max(0, 255 * v)}, ${Math.max(
      0,
      255 * (v - 1)
    )}, 54, 255)`;
    videoctx.moveTo(
      canvas.width - 1,
      canvas.height - i * (canvas.height / freqdata.length)
    );
    videoctx.lineTo(
      canvas.width - 1,
      canvas.height -
        (i * (canvas.height / freqdata.length) +
          canvas.height / freqdata.length)
    );
    videoctx.stroke();
  }

  // videoctx.putImageData(imagedata, time, 0);
  // imagedata = videoctx.getImageData(1, 0, canvas.width-1, canvas.height);
  // let imgData = videoctx.getImageData(1, 0, canvas.width - 1, canvas.height);
  // videoctx.fillRect(0,0,canvas.width, canvas.height);
  // videoctx.putImageData(imagedata, 0, 0);
  // analyser.getByteFrequencyData(freqdata);

  // time = (time + 1) % canvas.width;
  time = (time - 1) % canvas.width;

  if (time < 0) {
    time = 500;
  }

  // line that draws
  // for (var y = 0; y < canvas.height; y++) {
  //   var p = y * 4;
  //   imagedata.data[p++] = 255;
  //   imagedata.data[p++] = 0;
  //   imagedata.data[p++] = 0;
  //   imagedata.data[p++] = 255;
  // }
  // videoctx.putImageData(imagedata, time, 0);

  // videoctx.moveTo(-test++, 0);
}

function setFFTSize(value) {
  var npot = Math.pow(2, Math.round(Math.log(value) / Math.log(2)));
  settings.fftSize = npot;

  analyser.fftSize = npot;
  freqdata = new Uint8Array(analyser.frequencyBinCount);

  if (tid) clearInterval(tid);
  tid = setInterval(draw, (analyser.fftSize / audioctx.sampleRate) * 1000);

  setFFTRange(settings.minFrequency, settings.maxFrequency);
}

function setFFTTime(value) {
  canvas.width = value;
}

function setFFTRange(min, max) {
  function freqToBin(value) {
    return Math.floor(value / (audioctx.sampleRate / analyser.fftSize));
  }
  minbin = freqToBin(min);
  maxbin = freqToBin(max);

  canvas.height = maxbin - minbin;
  imagedata = videoctx.getImageData(0, 0, 1, canvas.height);
}

export const initSpectrogram = () => {
  if (started) {
    return;
  }

  started = true;

  audioctx = new window.AudioContext();

   navigator.getUserMedia(
    { audio: true },
    function(stream) {
      var source = audioctx.createMediaStreamSource(stream);
      analyser = audioctx.createAnalyser();
      analyser.smoothingTimeConstant = 0;

      gui.closed = true;

      gui
        .add(settings, "fftSize", 64, 2048)
        .listen()
        .onFinishChange(setFFTSize);
      gui.add(settings, "fftTime", 100, 2000).onFinishChange(setFFTTime);
      gui
        .add(settings, "minDecibels", -100, 0)
        .listen()
        .onFinishChange(function(value) {
          settings.maxDecibels = Math.max(value, settings.maxDecibels);
          analyser.minDecibels = value;
        });
      gui
        .add(settings, "maxDecibels", -100, 0)
        .listen()
        .onFinishChange(function(value) {
          settings.minDecibels = Math.min(value, settings.minDecibels);
          analyser.maxDecibels = value;
        });
      gui
        .add(settings, "minFrequency", 0, audioctx.sampleRate / 2)
        .listen()
        .onFinishChange(function(value) {
          settings.maxFrequency = Math.max(value, settings.maxFrequency);
          setFFTRange(value, settings.maxFrequency);
        });
      gui
        .add(settings, "maxFrequency", 0, audioctx.sampleRate / 2)
        .listen()
        .onFinishChange(function(value) {
          settings.minFrequency = Math.min(value, settings.minFrequency);
          setFFTRange(settings.minFrequency, value);
        });

      gui.add(analyser, "smoothingTimeConstant", 0, 1);

      source.connect(analyser);
      setFFTRange(settings.minFrequency, settings.maxFrequency);
      setFFTTime(settings.fftTime);
      setFFTSize(settings.fftSize);
    },
    function(e) {}
  );
};

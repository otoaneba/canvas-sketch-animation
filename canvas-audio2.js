const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const eases = require('eases');
const random = require('canvas-sketch-util/random');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

let audio;
let audioContext, audioData, sourceNote, analyzerNote;
let manager;
let minDb, maxDb;

const sketch = () => {

  const numCircles = 5;
  const numSlices = 9;
  const slice = Math.PI * 2 / numSlices;
  const radius = 200;
  

  const bins = [];
  const lineWidths = [];
  const rotationOffsets = [];

  let lineWidth, bin, mapped, phi;

  for (let i = 0; i < numCircles * numSlices; i++) {
    bin = random.rangeFloor(4, 64);
    bins.push(bin);
  }

  for (let i = 0; i < numCircles; i++) {
    const t = i / (numCircles - 1);
    lineWidth = eases.quadIn(t) * 200 + 20;
    lineWidths.push(lineWidth);
  }

  for (let i = 0; i < numCircles; i++) {
    rotationOffsets.push(random.range(Math.PI * -0.25, Math.PI * 0.25))
  }

  return ({ context, width, height }) => {
    context.fillStyle = '#EEEAE0';
    context.fillRect(0, 0, width, height);

    /**
     * 
     */
    if (!audioContext) return

    analyzerNote.getFloatFrequencyData(audioData);

    context.save();
    // setup canvas. Translate to center of canvas, and set line width
    context.translate(width * 0.5, height * 0.5);

    let cRadius = radius;

    // loop through circles, then slices of each circle
    for (let i = 0; i < numCircles; i++) {
      context.save();

      context.rotate(rotationOffsets[i])
      cRadius += lineWidths[i] * 0.5 + 2

      for (let j = 0; j < numSlices; j++) {
        context.rotate(slice);
        context.lineWidth = lineWidths[i];

        bin = bins[i * numSlices + j];

        mapped = math.mapRange(audioData[bin], minDb, maxDb, 0, 1, true)

        phi = slice * mapped;
      
        // draw cricle
        context.beginPath();
        context.arc(0, 0, cRadius, 0, phi) // draw cricle from 0 to slice isntead of 0 to PI*2
        context.stroke();
  
      }
      cRadius += lineWidths[i] * 0.5;
      context.restore();
    }
    context.restore();
  };
};

const addListener = () => {
  window.addEventListener('mouseup', () => {
    if (!audioContext) creaeteAudio();

    if (audio.paused) {
      audio.play();
      manager.play();
    } else {
      audio.pause();
      manager.pause();
    }
  })
}

const creaeteAudio = () => {
  audio = document.createElement('audio');
  audio.src = 'audio/nowAndThen.mp3';

  audioContext = new AudioContext();

  sourceNote = audioContext.createMediaElementSource(audio);
  sourceNote.connect(audioContext.destination);

  analyzerNote = audioContext.createAnalyser();
  analyzerNote.fftSize = 512; // value always needs to be power of 2
  analyzerNote.smoothingTimeConstant = 0.9
  sourceNote.connect(analyzerNote);

  minDb = analyzerNote.minDecibels;
  maxDb = analyzerNote.maxDecibels;

  audioData = new Float32Array(analyzerNote.frequencyBinCount);
  console.log(audioData.length);

};

const getAvg = (data) => {
  let sum  = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i];
  }
  return sum / data.length;
};

const start = async() => {
  addListener();
  manager = await canvasSketch(sketch, settings);
  manager.pause();
};

start();
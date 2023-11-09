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

  let lineWidth, bin, mapped;

  for (let i = 0; i < numCircles * numSlices; i++) {
    bin = random.rangeFloor(4, 64);
    if (random.value() > 0.5) bin = 0;
    bins.push(bin);
  }

  for (let i = 0; i < numCircles; i++) {
    const t = i / (numCircles - 1);
    lineWidth = eases.quadIn(t) * 200 + 20;
    lineWidths.push(lineWidth);
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
      for (let j = 0; j < numSlices; j++) {
        context.rotate(slice);
        context.lineWidth = lineWidths[i];

        bin = bins[i * numSlices + j];
        if (!bin) continue;

        mapped = math.mapRange(audioData[bin], minDb, maxDb, 0, 1, true)

        lineWidth = lineWidths[i] * mapped
        if (lineWidth < 1) continue;

        context.lineWidth = lineWidth
        // draw cricle
        context.beginPath();
        context.arc(0, 0, cRadius + context.lineWidth * 0.5, 0, slice) // draw cricle from 0 to slice isntead of 0 to PI*2
        context.stroke();
  
      }
      cRadius += lineWidths[i];
      context.restore();
    }

    context.restore();

    // for (let i = 0; i < bins.length; i++) {
      
    //   const bin = bins[i];
    //   const mapped = math.mapRange(audioData[bin], analyzerNote.minDecibels, analyzerNote.maxDecibels, 0, 1, true);
    //   const radius = mapped * 300;

    //   /**
    //    * Start drawing circle
    //    */
    //   // context.save();

    //   // // setup canvas. Translate to center of canvas, and set line width
    //   // context.translate(width * 0.5, height * 0.5);
    //   // context.lineWidth = 10;

    //   // // draw
    //   // context.beginPath();
    //   // context.arc(0, 0, radius, 0, Math.PI * 2) // avg could be negative. take absolute value to conver negative into positive
    //   // context.stroke();

    //   context.restore();
    // }

    // const avg = getAvg(audioData);
    // const mapped = math.mapRange(audioData[13], analyzerNote.minDecibels, analyzerNote.maxDecibels, 0, 1, true);
    // const radius = mapped * 200;

    // /**
    //  * Start drawing circle
    //  */
    // context.save();

    // // setup canvas. Translate to center of canvas, and set line width
    // context.translate(width * 0.5, height * 0.5);
    // context.lineWidth = 10;

    // // draw
    // context.beginPath();
    // context.arc(0, 0, radius, 0, Math.PI * 2) // avg could be negative. take absolute value to conver negative into positive
    // context.stroke();

    // context.restore();
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
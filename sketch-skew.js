const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const risoColors = require('riso-colors');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

const sketch = ({ context, width, height }) => {
  let x,y,w,h,fill, stroke;

  /**
   * Add grid lines 
   */
  context.save();
  context.fillStyle='black';
  context.fillRect(0,width * 0.5, width, 0.2);
  context.fillRect(height * 0.5,0, 0.2, height);
  context.stroke();
  context.restore();

  const nums = 20;
  const degrees = 30;

  const rects = [];

  const rectColors = [
    random.pick(risoColors),
    random.pick(risoColors),
    random.pick(risoColors)
  ];

  for (let i = 0; i < nums; i++) {
    x = random.range(0, width);
    y = random.range(0, height);
    w = random.range(200, 600);
    h = random.range(40, 200);

    //fill = `rgb(${random.range(0,60)},${random.range(0,150)},${random.range(0,100)})`;
    //fill = risoColors[Math.floor(Math.random() * risoColors.length)].hex;
    fill = random.pick(rectColors).hex;
    stroke = 'black';

    rects.push({x,y,w,h, fill, stroke});
  }

  /**
   * add background
   */
  context.fillStyle = random.pick(risoColors).hex;
  context.fillRect(0, 0, width, height);

  return ({ context, width, height }) => {
  
    rects.forEach(rect => {  
      const {x,y,w,h, fill, stroke} = rect;
      /**
       * Start sketch
       */
      context.save();
      context.translate(x,y);
      context.fillStyle = fill;
      context.strokeStyle = random.pick(rectColors).hex;
   
      drawSkewRect({context, w, h, degrees: -45, fill});
   
      context.shadowColor = `rgba(0,0,0,0.5)`;
      context.shadowOffsetX = -10;
      context.shadowOffsetY = 20;
      context.fill();

      context.shadowColor = null;
      context.stroke();
    
      context.restore();
    })
  };
};

const drawSkewRect = ({context, w=600, h=200, degrees=30, fill}) => {
  const angle = math.degToRad(degrees);
  const rx = Math.cos(angle) * w;
  const ry = Math.sin(angle) * w;

  context.save();
  context.translate(rx * -0.5, (ry + h) * -0.5);
  console.log(rx * -0.5, (ry + h) * -0.5)

  context.fillStyle = fill;
  console.log('context.strokeStyle', context.strokeStyle);

  context.beginPath();
  context.moveTo(0,0);
  context.lineTo(rx, ry);
  context.lineTo(rx, ry + h);
  context.lineTo(0, h);
  context.closePath(); 
  context.fill();
  context.restore();
};

canvasSketch(sketch, settings);

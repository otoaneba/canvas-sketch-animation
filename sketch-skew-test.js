const canvasSketch = require('canvas-sketch');
const math = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const risoColors = require('riso-colors');
const Color = require('canvas-sketch-util/color'); 


const seed = Date.now();

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true,
  fps: 60
};

const sketch = ({ context, width, height, playhead, frame }) => {
  random.setSeed(seed);

  let x,y,w,h,fill, stroke, blend;
  let f = 2;
  console.log(playhead)
   /**
   * Add grid lines 
   */
  context.save();
  context.fillStyle='black';
  context.fillRect(0,width * 0.5, width, 0.2);
  context.fillRect(height * 0.5,0, 0.2, height);
  context.stroke();
  context.restore();

  const nums = 1;
  const degrees = 30;

  const bgColor = random.pick(risoColors).hex;

  const mask = {
    radius: width * 0.4,
    sides: 3,
    x: width * 0.5,
    y: height * 0.58 // vertically center the polygon 
  }

  const rects = [];

  const rectColors = [
    random.pick(risoColors),
    random.pick(risoColors),
  ];

  for (let i = 0; i < nums; i++) {
    x = random.range(0, width);
    y = random.range(0, height);
    w = random.range(600, width);
    h = random.range(40, 200);

    fill = random.pick(rectColors).hex;
    stroke = random.pick(rectColors).hex;
    blend = (random.value() > 0.5) ? 'overlay' : 'source-over';

    rects.push({x,y,w,h, fill, stroke, blend});
  }


  return ({ context, width, height, playhead, frame}) => {
    
    /**
    * add background
    */
    context.fillStyle = bgColor;
    context.fillRect(0, 0, width, height);

    f += 2;
    console.log(playhead, frame)

    /**
     * draw triangle
     */
    context.save();
    context.translate(mask.x, mask.y);

    drawPolygon({context: context, radius: mask.radius, sides: mask.sides, playhead})
    
    // context.clip();
  
    rects.forEach(rect => {  
      const {x,y,w,h, fill, stroke, blend} = rect;
      let shadowColor;
      /**
       * Start sketch
       */
      context.save();
      context.translate(-mask.x, -mask.y); // align shapes to fill up the triangle 
      context.translate(x , y);
      context.fillStyle = fill;
      context.strokeStyle = stroke;
      context.lineWidth = 10;

      context.globalCompositeOperation = blend;
   
      drawSkewRect({context, w, h, degrees: -30, f});
      
      shadowColor = Color.offsetHSL(fill, 0, 0,-20);
      shadowColor.rgba[3] = 0.5;

      context.shadowColor = Color.style(shadowColor.rgba);
      context.shadowOffsetX = -10;
      context.shadowOffsetY = 20;
      
      context.fill();

      context.shadowColor = null;     
      context.stroke();

      context.globalCompositeOperation = 'source-over';

      context.lineWidth = 2;
      context.strokeStyle = 'black';
      context.stroke();
    
      context.restore();
    });

    context.restore();

    // polygon outline
    // context.save();
    // context.translate(mask.x, mask.y);
    // context.lineWidth = 30;

    // drawPolygon({context: context, radius: mask.radius - context.lineWidth, sides: mask.sides})

    // context.globalCompositeOperation = 'color-burn';
    // context.strokeStyle = rectColors[0].hex;
    // context.stroke();

    // context.restore();
  };
};

const drawSkewRect = ({context, w=600, h=200, degrees=30, f, playhead}) => {
  const angle = math.degToRad(degrees);
  const rx = Math.cos(angle) * w;
  const ry = Math.sin(angle) * w;

  context.save();
  context.translate(rx * -0.5, (ry + h) * -0.5);

  context.beginPath();
  context.moveTo(0+f,0);
  context.lineTo(rx + f, ry);
  context.lineTo(rx + f, ry + h);
  context.lineTo(0 + f, h);
  console.log(f)
  context.closePath();

  context.restore();
};

const drawPolygon = ({ context, radius=100, sides=3 }) => {
  const slice = Math.PI * 2 / sides;

  context.beginPath();
  context.moveTo(0, -radius);

  for (let i = 1; i < sides; i++) {
    const theta = i * slice - Math.PI * 0.5;
    context.lineTo(Math.cos(theta) * radius, Math.sin(theta) * radius);
  }
  context.closePath();
}

canvasSketch(sketch, settings);


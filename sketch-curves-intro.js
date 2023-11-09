const canvasSketch = require('canvas-sketch');

const settings = {
  dimensions: [ 1080, 1080 ],
  animate: true
};

let elCanvas;
let points;

const sketch = ({ canvas, context }) => {
  points = [
    new Point(200, 540),
    new Point(400, 700),
    new Point(880, 540),
    new Point(600, 700),
    new Point(640, 900)
  ];

  canvas.addEventListener('mousedown', onMouseDown);
  elCanvas = canvas;

  return ({ context, width, height }) => {
    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    context.strokeStyle = '#999';

    for (let i = 1; i < points.length; i++) {
      // context.quadraticCurveTo(points[i].x, points[i].y, points[i+1].x, points[i+1].y);
      context.lineTo(points[i].x, points[i].y);
      context.stroke();

    }
    context.beginPath();

    for (let i = 0; i < points.length-1; i++) {
      const curr = points[i];
      const next = points[i+1];

      const mx = curr.x + (next.x - curr.x) * 0.5;
      const my = curr.y + (next.y - curr.y) * 0.5;

      // draw midpoints
      // context.beginPath();
      // context.arc(mx, my, 5, 0, Math.PI * 2);
      // context.fillStyle = 'blue';
      // context.fill();

      if (i == 0) context.moveTo(curr.x, curr.y);
      else if (i < points.length - 2) context.quadraticCurveTo(curr.x, curr.y, next.x, next.y);
      else context.quadraticCurveTo(curr.x, curr.y, mx, my);
    }

    // context.quadraticCurveTo(points[1].x, points[1].y, points[2].x, points[2].y);
    // context.quadraticCurveTo(points[3].x, points[3].y, points[4].x, points[4].y);

    context.lineWith = 4;
    context.strokeStyle = 'blue';
    context.stroke();

    points.forEach(point => {
      point.draw(context);
    })
  };
};
class Point {
  constructor(x, y, control = false) {
    console.log('point created')
    this.x = x;
    this.y = y;
    this.control = control ? 'red' : 'black';
  }

  draw(context) {
    context.save();
    context.fillStyle = this.control;

    context.translate(this.x, this.y);

    context.beginPath();
    context.arc(0, 0, 10, 0, 5*2);
    context.fill();

    context.restore();
  }

  hittest(x, y) {
    const dx = this.x - x;
    const dy = this.y - y;
    const dist = Math.sqrt(dx ** 2 + dy ** 2);

    return dist < 20;
  }
}

const onMouseMove = (e) => {
  const x = e.offsetX / elCanvas.offsetWidth * elCanvas.width;
  const y = e.offsetY / elCanvas.offsetHeight * elCanvas.height;

  console.log(x, y)
  
  points.forEach(point => {
    if(point.isDragging) {
      point.x = x;
      point.y = y;
    }
  })
};

const onMouseDown = (e) => {
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);

  const x = e.offsetX / elCanvas.offsetWidth * elCanvas.width;
  const y = e.offsetY / elCanvas.offsetHeight * elCanvas.height;
  
  let hit = false;
  points.forEach(point => {
    point.isDragging = point.hittest(x, y);
    if (!hit && point.isDragging) hit = true;
  });
  if (!hit) points.push(new Point(x, y))
};

const onMouseUp = () => {
  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('mouseup', onMouseUp);

};

canvasSketch(sketch, settings);



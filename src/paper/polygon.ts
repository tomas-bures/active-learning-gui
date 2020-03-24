import paper from "paper";

export interface ICoordinate {
  x: number;
  y: number;
}

export function drawPolygon(
  vertices: Array<number>,
  start: ICoordinate,
  color: paper.Color
) {
  let polygon = new paper.Path();
  polygon.fillColor = color;
  polygon.strokeColor = color;
  polygon.opacity = 0.5;
  polygon.closed = true;
  let second = false;
  let x = 0;
  let y = 0;
  //For some reason cannot use for..of -> produces Uncaught exception: vertices[Symbol.iterator] is not a function
  for (let i = 0; i < vertices.length; i++) {
    let coordinate = vertices[i];
    if (!second) {
      x = start.x + coordinate;
      second = true;
    } else {
      y = start.y + coordinate;
      polygon.add(new paper.Point(x, y));
      second = false;
    }
  }
  polygon.onMouseEnter = function() {
    this.selected = true;
  };
  polygon.onMouseLeave = function() {
    this.selected = false;
  };
  return polygon;
}

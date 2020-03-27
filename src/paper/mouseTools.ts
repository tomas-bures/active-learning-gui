import paper from "paper";

function onMouseMove(event: any) {
  paper.project.activeLayer.selected = false;
  if (event.item) {
    event.item.selected = true;
  }
}

let hitOptions = {
  segments: true,
  stroke: true,
  fill: true,
  tolerance: 5
};

// Need to specify
let path: any;
let segment: any;
let movePath = false;

function onMouseDown(event: any) {
  segment = path = null;
  let hitResult = paper.project.hitTest(event.point, hitOptions);
  if (!hitResult) {
    return;
  }
  if (hitResult) {
    path = hitResult.item;
    console.log(path);
    if (hitResult.type == "segment") {
      segment = hitResult.segment;
    } else if (hitResult.type == "stroke") {
      let location = hitResult.location;
      segment = path.insert(location.index + 1, event.point);
    }
  }
  movePath = hitResult.type == "fill";
  if (movePath) {
    paper.project.activeLayer.addChild(hitResult.item);
  }
}

function onMouseDrag(event: any) {
  // if (segment) {
  //   segment.point += event.delta;
  // } else if (path) {
  //   path.position += event.delta;
  // }
  let a = event.downPoint.subtract(event.point);
  a = a.add(paper.view.center);
  paper.view.center = a;
}

export const mouseTool = new paper.Tool();
mouseTool.onMouseDrag = onMouseDrag;
mouseTool.onMouseMove = onMouseMove;
mouseTool.onMouseDown = onMouseDown;

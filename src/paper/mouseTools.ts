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
  tolerance: 5,
};

// Need to specify
let path: any;
let segment: any;

function onMouseDown(event: any) {
  segment = path = null;
  let hitResult = paper.project.hitTest(event.point, hitOptions);
  if (!hitResult) {
    return;
  }
  if (event.modifiers.shift) {
    if (hitResult.type == "segment") {
      hitResult.segment.remove();
    }
    return;
  }
  if (hitResult) {
    path = hitResult.item;
    if (hitResult.type == "segment") {
      segment = hitResult.segment;
    } else if (hitResult.type == "stroke") {
      let location = hitResult.location;
      segment = path.insert(location.index + 1, event.point);
    }
  }
}

function onMouseDrag(event: any) {
  // Can't use segment.point += event.delta because typescript...
  if (segment) {
    segment.point.x += event.delta.x;
    segment.point.y += event.delta.y;
  } else if (path) {
    path.position.x += event.delta.x;
    path.position.y += event.delta.y;
  } else {
    let a = event.downPoint.subtract(event.point);
    a = a.add(paper.view.center);
    paper.view.center = a;
  }
}

export const mouseTool = new paper.Tool();
mouseTool.onMouseDrag = onMouseDrag;
mouseTool.onMouseMove = onMouseMove;
mouseTool.onMouseDown = onMouseDown;

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
  bounds: true,
  tolerance: 5,
};

// Need to specify
let path: any;
let segment: any;
let selectedItem: any = null;
let selectedCorner: any;
let oppositeCorner: any;
let rotate: boolean;

function selectItem(item: any) {
  if (selectedItem != null) {
    selectedItem.bounds.selected = false;
  }
  selectedItem = item;
  selectedItem.bounds.selected = true;
}

function onMouseDown(event: any) {
  segment = path = selectedCorner = null;
  rotate = false;
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
    selectItem(path);
    if (hitResult.type == "segment") {
      segment = hitResult.segment;
    } else if (hitResult.type == "stroke") {
      let location = hitResult.location;
      segment = path.insert(location.index + 1, event.point);
    } else if (hitResult.type == "bounds") {
      path = null;
      if (event.modifiers.control) {
        rotate = true;
        return;
      }
      selectedCorner = hitResult.point;
      if (selectedCorner.isClose(selectedItem.bounds.topLeft, 1)) {
        oppositeCorner = selectedItem.bounds.bottomRight;
      } else if (selectedCorner.isClose(selectedItem.bounds.topRight, 1)) {
        oppositeCorner = selectedItem.bounds.bottomLeft;
      } else if (selectedCorner.isClose(selectedItem.bounds.bottomLeft, 1)) {
        oppositeCorner = selectedItem.bounds.topRight;
      } else if (selectedCorner.isClose(selectedItem.bounds.bottomRight, 1)) {
        oppositeCorner = selectedItem.bounds.topLeft;
      }
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
  } else if (selectedCorner) {
    selectedItem.bounds = new paper.Rectangle(oppositeCorner, event.point);
  } else if (rotate) {
    const center = new paper.Point({
      x: selectedItem.bounds.center._x,
      y: selectedItem.bounds.center._y,
    });
    const baseVec = center.subtract(event.lastPoint);
    const nowVec = center.subtract(event.point);
    const angle = nowVec.angle - baseVec.angle;
    selectedItem.rotate(angle);
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

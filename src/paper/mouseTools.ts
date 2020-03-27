import paper from "paper";

function selectOnHover(event: any) {
  paper.project.activeLayer.selected = false;
  if (event.item) {
    event.item.selected = true;
  }
}

function onMouseDrag(event: any) {
  var a = event.downPoint.subtract(event.point);
  a = a.add(paper.view.center);
  paper.view.center = a;
}

export const mouseTool = new paper.Tool();
mouseTool.onMouseDrag = onMouseDrag;
mouseTool.onMouseMove = selectOnHover;

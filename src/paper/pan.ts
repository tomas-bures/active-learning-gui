import paper from "paper";

function onMouseDrag(event: any) {
  var a = event.downPoint.subtract(event.point);
  a = a.add(paper.view.center);
  paper.view.center = a;
}

export const dragger = new paper.Tool();
dragger.onMouseDrag = onMouseDrag;

<template>
  <div>
    <canvas id="canvas"></canvas>
    <img :src="source" id="image" display="none" />
    <v-btn @click="recenter">Recenter</v-btn>
  </div>
</template>

<script>
import paper from "paper";
import "../paper/pan";
import { drawPolygon } from "../paper/polygon";
import { categoryColors } from "../paper/categoryColors";

export default {
  data: () => ({
    raster: new paper.Raster("image"),
    factor: 1.05
  }),
  computed: {
    source: function() {
      return this.$route.params.source;
    }
  },
  created() {
    paper.install(window);
    window.addEventListener("wheel", this.zoom);
  },
  mounted() {
    paper.setup("canvas");
    this.raster = new paper.Raster("image");
    this.raster.position = view.center;
    let annotations = this.$route.params.annotations;
    let annotationPolygons = [];
    for (let i = 0; i < annotations.length; i++) {
      let color = new paper.Color(
        categoryColors.get(annotations[i].category_id)
      );
      annotationPolygons.push(
        drawPolygon(
          annotations[i].segmentation[0],
          this.raster.bounds.topLeft,
          color
        )
      );
    }
  },
  destroyed() {
    // Need to remove lister, otherwise it would still fire after user exited this component
    window.removeEventListener("wheel", this.zoom);
  },
  methods: {
    recenter() {
      this.raster.position = view.center;
    },
    zoom(event) {
      // Implementation based on https://matthiasberth.com/tech/stable-zoom-and-pan-in-paperjs and https://stackoverflow.com/questions/40189777/paperjs-zoom-and-pan
      const oldZoom = paper.view.zoom;
      const oldCenter = paper.view.center;
      const viewPosition = paper.view.viewToProject(
        new paper.Point(event.layerX, event.layerY)
      );
      if (event.deltaY > 0) {
        if (paper.view.zoom < 0.2) return;
        paper.view.zoom /= this.factor;
      } else {
        paper.view.zoom *= this.factor;
      }
      const zoomScale = oldZoom / paper.view.zoom;
      const centerAdjust = viewPosition.subtract(oldCenter);
      const offset = viewPosition
        .subtract(centerAdjust.multiply(zoomScale))
        .subtract(oldCenter);
      paper.view.center = view.center.add(offset);
    }
  }
};
</script>

<style>
canvas {
  margin-top: 1%;
  width: 100%;
  height: 100%;
}
img {
  display: none;
}
</style>

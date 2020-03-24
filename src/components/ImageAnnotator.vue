<template>
  <div>
    <v-container>
      <v-row align="stretch">
        <v-col cols="9">
          <canvas id="canvas"></canvas>
          <img :src="source" id="image" display="none" />
          <v-btn @click="recenter">Recenter</v-btn>
        </v-col>
        <v-col>
          <v-card>
            <v-simple-table height="600" fixed-header>
              <thead>
                <tr>
                  <th class="text-left">ID</th>
                  <th class="text-left">Category</th>
                  <th class="text-left">IsCrowd</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in annotations"
                  :key="item.id"
                  @mouseenter="selectAnnotationPolygonOnTableItemHover"
                  @mouseleave="unselectAnnotationPolygonOnTableItemHover"
                >
                  <td>{{ item.id }}</td>
                  <td>{{ item.category }}</td>
                  <td>{{ item.iscrowd }}</td>
                </tr>
              </tbody>
            </v-simple-table>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import paper from "paper";
import "../paper/pan";
import { drawPolygon } from "../paper/polygon";
import { categoryColors } from "../paper/categoryColors";
import { database } from "../store/store";

export default {
  data: () => ({
    raster: new paper.Raster("image"),
    factor: 1.05,
    annotationPolygons: new Array(),
    categories: new Array()
  }),
  computed: {
    source: function() {
      return this.$route.params.source;
    },
    annotations: function() {
      return this.$route.params.annotations;
    },
    tableData: function() {
      let data = [];
      for (let i = 0; i < this.annotations.length; i++) {
        const item = {
          id: this.annotations[i].id,
          category: this.categories.find(
            category => category.id == this.annotations[i].category_id
          ).name,
          iscrowd: this.annotations[i].iscrowd
        };
        data.push(item);
      }
      return data;
    }
  },
  created() {
    this.loadCategories();
    paper.install(window);
    window.addEventListener("wheel", this.zoom);
  },
  mounted() {
    paper.setup("canvas");
    this.raster = new paper.Raster("image");
    this.raster.position = view.center;
    for (let i = 0; i < this.annotations.length; i++) {
      let color = new paper.Color(
        categoryColors.get(this.annotations[i].category_id)
      );
      this.annotationPolygons.push(
        drawPolygon(
          this.annotations[i].segmentation[0],
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
      // If mouse pointer is not inside canvas, make no action
      if (event.target.id != "canvas") return;
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
    },
    selectAnnotationPolygonOnTableItemHover(event) {
      this.annotationPolygons[event.target.rowIndex - 1].selected = true;
    },
    unselectAnnotationPolygonOnTableItemHover(event) {
      this.annotationPolygons[event.target.rowIndex - 1].selected = false;
    },
    async loadCategories() {
      this.categories = await database.categories.orderBy("id").toArray();
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

<template>
  <div>
    <v-container>
      <v-row align="stretch">
        <v-col cols="8">
          <canvas id="canvas"></canvas>
          <img :src="source" id="image" display="none" />
        </v-col>
        <v-spacer></v-spacer>
        <v-col cols="4">
          <v-card>
            <v-simple-table height="570" fixed-header>
              <thead>
                <tr>
                  <th class="text-left">ID</th>
                  <th class="text-left">Category</th>
                  <th class="text-left">Area</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in tableData"
                  :key="item.id"
                  @mouseenter="selectAnnotationPolygonOnTableItemHover"
                  @mouseleave="deselectAnnotationPolygonOnTableItemHover"
                >
                  <td>{{ item.id }}</td>
                  <td>{{ item.category }}</td>
                  <td>{{ item.area }}</td>
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
import "../paper/mouseTools";
import { drawPolygon } from "../paper/polygon";
import { categoryColors } from "../paper/categoryColors";
import { database, loadImagesOrderedBySelectedCritera } from "../store/store";
import { FirebaseStorage } from "@/firebase/storage";

export default {
  data: () => ({
    raster: new paper.Raster("image"),
    factor: 1.05,
    annotationPolygons: [],
    storageRef: FirebaseStorage.ref()
  }),
  computed: {
    source: function() {
      return this.$route.params.source;
    },
    annotations: function() {
      return this.$store.state.currentImage.annotations;
    },
    annotationCategories: function() {
      return this.$store.state.categories;
    },
    tableData: function() {
      let data = [];
      for (let i = 0; i < this.annotations.length; i++) {
        const item = {
          id: this.annotations[i].id,
          category: this.annotationCategories.find(
            category => category.id == this.annotations[i].category_id
          ).name,
          area: this.annotations[i].area
        };
        data.push(item);
      }
      return data;
    }
  },
  created() {
    paper.install(window);
    window.addEventListener("wheel", this.zoom);
  },
  mounted() {
    paper.setup("canvas");
    this.drawImage();
    this.drawAnnotationsPolygons();
  },
  destroyed() {
    // Need to remove listener, otherwise it would still fire after user exited this component
    window.removeEventListener("wheel", this.zoom);
  },
  methods: {
    rotateLeft() {
      view.rotate(-90);
    },
    rotateRight() {
      view.rotate(90);
    },
    drawImage() {
      this.raster = new paper.Raster("image");
      this.raster.position = view.center;
      this.raster.locked = true;
    },
    drawAnnotationsPolygons() {
      for (let i = 0; i < this.annotations.length; i++) {
        let color = new paper.Color(
          categoryColors.get(this.annotations[i].category_id)
        );
        if (Array.isArray(this.annotations[i].segmentation)) {
          const polygon = drawPolygon(
            this.annotations[i].segmentation[0],
            this.raster.bounds.topLeft,
            color
          );
          this.annotationPolygons.push(polygon);
        }
      }
    },
    recenter() {
      for (let i = 0; i < this.annotationPolygons.length; i++) {
        this.annotationPolygons[i].remove();
      }
      this.annotationPolygons = [];
      paper.view.zoom = 1;
      view.rotation = 0;
      this.raster.position = view.center;
      this.drawAnnotationsPolygons();
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
    deselectAnnotationPolygonOnTableItemHover(event) {
      this.annotationPolygons[event.target.rowIndex - 1].selected = false;
    }
  }
};
</script>

<style>
canvas {
  margin-top: 1%;
  width: 100%;
  height: 100%;
  border: orangered solid 1px;
}
img {
  display: none;
}
</style>

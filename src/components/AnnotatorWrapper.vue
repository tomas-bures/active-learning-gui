<template>
  <div>
    <image-annotator :key="key" ref="annotator" />
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-btn @click="loadPrevious" icon v-on="on">
          <v-icon>navigate_before</v-icon>
        </v-btn>
      </template>
      <span>Load previous image</span>
    </v-tooltip>
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-btn @click="rotateLeft" class="mx-2" v-on="on" icon>
          <v-icon>rotate_left</v-icon>
        </v-btn>
      </template>
      <span>Rotate left</span>
    </v-tooltip>
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-btn @click="recenter" class="mx-2" v-on="on">Recenter</v-btn>
      </template>
      <span>Recenter</span>
    </v-tooltip>
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-btn @click="rotateRight" class="mx-2" v-on="on" icon>
          <v-icon>rotate_right</v-icon>
        </v-btn>
      </template>
      <span>Rotate right</span>
    </v-tooltip>
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-btn @click="loadNext" v-on="on" icon>
          <v-icon>navigate_next</v-icon>
        </v-btn>
      </template>
      <span>Load next</span>
    </v-tooltip>
    <v-tooltip top>
      <template v-slot:activator="{ on }">
        <v-btn @click="saveChanges" v-on="on" icon>
          <v-icon>save</v-icon>
        </v-btn>
      </template>
      <span>Save changes</span>
    </v-tooltip>
  </div>
</template>

<script>
import ImageAnnotator from "./ImageAnnotator.vue";
import { database, loadImagesOrderedBySelectedCritera } from "../store/store";
import { FirebaseStorage } from "@/firebase/storage";

export default {
  components: {
    ImageAnnotator
  },
  data: () => ({
    storageRef: FirebaseStorage.ref()
  }),
  computed: {
    key: function() {
      return this.$route.fullPath;
    }
  },
  methods: {
    rotateLeft() {
      this.$refs.annotator.rotateLeft();
    },
    rotateRight() {
      this.$refs.annotator.rotateRight();
    },
    recenter() {
      this.$refs.annotator.recenter();
    },
    loadPrevious() {
      this.load(false);
    },
    loadNext() {
      this.load(true);
    },
    saveChanges() {
      this.$refs.annotator.saveChanges();
    },
    async load(next) {
      const index = next
        ? this.$store.state.currentImageIndex + 1
        : this.$store.state.currentImageIndex - 1;
      this.$store.commit("setCurrentImageIndex", index);
      const descending = this.$store.state.descendingOrder;
      const loadedItem = await loadImagesOrderedBySelectedCritera(
        this.$store.state.sortingCriteria,
        descending,
        1,
        index
      );
      const image = loadedItem[0];
      this.$store.commit("setCurrentImage", image);
      const imageURL = await this.storageRef
        .child("val2017/" + image.file_name)
        .getDownloadURL();
      this.$router.replace({
        name: "image",
        params: {
          id: image.id,
          source: imageURL
        }
      });
    }
  }
};
</script>

<style></style>

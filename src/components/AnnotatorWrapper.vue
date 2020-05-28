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
      <span>Recenter and return to last saved state</span>
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
        <v-btn @click="dialog = true" v-on="on" icon>
          <v-icon>delete</v-icon>
        </v-btn>
      </template>
      <span>Delete image and annotations from dataset</span>
    </v-tooltip>

    <v-dialog v-model="dialog" max-width="290">
      <v-card>
        <v-card-title class="headline">Delete image</v-card-title>
        <v-card-text>
          Are you sure you want to delete current image and its
          annotations?
        </v-card-text>
        <v-card-actions>
          <v-btn color="green darken-1" text @click="deleteImage">OK</v-btn>
          <v-btn color="green darken-1" text @click="dialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
    storageRef: FirebaseStorage.ref(),
    dialog: false
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
    deleteImage() {
      this.dialog = false;
      this.$refs.annotator.deleteImage();
      this.loadNext();
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

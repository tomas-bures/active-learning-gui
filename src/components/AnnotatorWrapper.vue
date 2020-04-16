<template>
  <div>
    <image-annotator :key="key" ref="test" />
    <v-btn @click="loadPrevious" icon>
      <v-icon>navigate_before</v-icon>
    </v-btn>
    <v-btn @click="rotateLeft" class="mx-2" icon>
      <v-icon>rotate_left</v-icon>
    </v-btn>
    <v-btn @click="recenter" class="mx-2">Recenter</v-btn>
    <v-btn @click="rotateRight" class="mx-2" icon>
      <v-icon>rotate_right</v-icon>
    </v-btn>
    <v-btn @click="loadNext" icon>
      <v-icon>navigate_next</v-icon>
    </v-btn>
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
      this.$refs.test.rotateLeft();
    },
    rotateRight() {
      this.$refs.test.rotateRight();
    },
    recenter() {
      this.$refs.test.recenter();
    },
    async loadPrevious() {
      const previous = await loadImagesOrderedBySelectedCritera(
        this.$store.state.sortingCriteria,
        !this.$store.state.descendingOrder,
        1,
        this.$store.state.currentImage
      );
      const previousImage = previous[0];
      this.$store.commit("setCurrentImage", previousImage);
      const imageURL = await this.storageRef
        .child("val2017/" + previousImage.file_name)
        .getDownloadURL();
      this.$router.replace({
        name: "image",
        params: {
          id: previousImage.id,
          source: imageURL
        }
      });
    },
    async loadNext() {
      const next = await loadImagesOrderedBySelectedCritera(
        this.$store.state.sortingCriteria,
        this.$store.state.descendingOrder,
        1,
        this.$store.state.currentImage
      );
      const nextImage = next[0];
      this.$store.commit("setCurrentImage", nextImage);
      const imageURL = await this.storageRef
        .child("val2017/" + nextImage.file_name)
        .getDownloadURL();
      this.$router.replace({
        name: "image",
        params: {
          id: nextImage.id,
          source: imageURL
        }
      });
      this.$refs.test.recenter();
    }
  }
};
</script>

<style></style>

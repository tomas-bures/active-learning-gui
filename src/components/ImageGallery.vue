<template>
  <div class="dataset">
    <h1>Images</h1>
    <v-slider v-model="size" min="100" max="1100" thumb-label="always"></v-slider>
    <v-container class="my-5">
      <v-layout row md5 justify-space-around>
        <v-flex class="my-4" v-for="image in images" :key="image">
          <v-lazy :options="{
              threshold: 0.5
            }">
            <Picture :size="size" :source="image" />
          </v-lazy>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import Picture from "./Picture.vue";
import { FirebaseStorage } from "@/firebase/storage";

export default {
  name: "image-gallery",
  components: {
    Picture
  },
  data: () => ({
    images: new Array(),
    references: new Array(),
    size: 350,
    folder: "val2017",
    storageRef: FirebaseStorage.ref()
  }),
  mounted() {
    this.loadImages();
  },
  methods: {
    async loadImages() {
      let listRef = this.storageRef.child(this.folder);
      let firstPage = await listRef.list({ maxResults: 100 });
      firstPage.items.forEach(item => {
        this.references.push(item.location.path);
        this.storageRef
          .child(item.location.path)
          .getDownloadURL()
          .then(url => {
            this.images.push(url);
          })
          .catch(error => {
            console.log(error);
          });
      });
    }
  }
};
</script>

<style></style>

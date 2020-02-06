<template>
  <div class="dataset">
    <h1>Images</h1>
    <v-slider v-model="size" min="100" max="1100" thumb-label="always"></v-slider>
    <v-container class="my-5">
      <div
        v-infinite-scroll="loadMore"
        infinite-scroll-disabled="busy"
        infinite-scroll-distance="10"
      >
        <v-layout row md5 justify-space-around>
          <v-flex class="my-4" v-for="image in images" :key="image">
            <Picture :size="size" :source="image" />
          </v-flex>
        </v-layout>
      </div>
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
    size: 350,
    folder: "val2017",
    storageRef: FirebaseStorage.ref(),
    busy: false,
    nextPage: Object()
  }),
  mounted() {
    this.loadImages();
  },
  methods: {
    async loadImages() {
      this.busy = true;
      let listRef = this.storageRef.child(this.folder);
      let firstPage = await listRef.list({ maxResults: 10 });
      firstPage.items.forEach(item => {
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
      this.nextPage = firstPage.nextPageToken;
      this.busy = false;
    },
    async loadMore() {
      this.busy = true;
      let listRef = this.storageRef.child(this.folder);
      let page = await listRef.list({
        maxResults: 10,
        pageToken: this.nextPage
      });
      page.items.forEach(item => {
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
      this.nextPage = page.nextPageToken;
      this.busy = false;
    }
  }
};
</script>

<style></style>

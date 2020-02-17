<template>
  <div class="dataset">
    <v-slider class="my-10" v-model="size" min="100" max="1100" thumb-label="always"></v-slider>
    <v-container class="my-5">
      <div v-infinite-scroll="loadMore" infinite-scroll-disabled="busy">
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
import { database } from "@/store/store";

export default {
  name: "image-gallery",
  components: {
    Picture
  },
  data: () => ({
    images: new Array(),
    dataset: new Array(),
    size: 350,
    folder: "val2017",
    storageRef: FirebaseStorage.ref(),
    busy: false,
    page: Object(),
    pageSize: 10
  }),
  mounted() {
    // this.loadImages();
    this.loadFirstPage();
  },
  methods: {
    async loadFirstPage() {
      this.busy = true;
      this.page = await database.images
        .orderBy("id")
        .limit(this.pageSize)
        .toArray();
      this.page.forEach(item => {
        this.storageRef
          .child(this.folder + "/" + item.file_name)
          .getDownloadURL()
          .then(url => {
            this.images.push(url);
          });
      });
      this.busy = false;
    },
    async loadMore() {
      if (this.page.length < this.pageSize) return;
      this.busy = true;
      let lastImage = this.page[this.page.length - 1];
      this.page = await database.images
        .where("id")
        .above(lastImage.id)
        .limit(this.pageSize)
        .toArray();
      this.page.forEach(item => {
        this.storageRef
          .child(this.folder + "/" + item.file_name)
          .getDownloadURL()
          .then(url => {
            this.images.push(url);
          });
      });
      this.busy = false;
    }
  }
};
</script>

<style></style>

<template>
  <div class="dataset">
    <v-slider class="my-10" v-model="size" min="100" max="1100" thumb-label="always"></v-slider>
    <v-container class="my-5">
      <div v-infinite-scroll="loadMore" infinite-scroll-disabled="busy">
        <v-layout row md5 justify-space-around>
          <v-flex class="my-4" v-for="image in images" :key="image.url" @click="testClick(image)">
            <Picture
              :size="size"
              :source="image.url"
              :id="image.image.id"
              v-observe-visibility="
                (isVisible, entry) => visibilityChanged(isVisible, entry, image)
              "
            />
          </v-flex>
        </v-layout>
      </div>
    </v-container>
    <v-bottom-navigation app height="250" dark>
      <v-data-table
        :headers="headers"
        :items="tableData"
        show-expand
        single-expand
        :search="search"
        :page.sync="tablePage"
        :items-per-page.sync="pageSize"
        dense
      >
        <template v-slot:expanded-item="{ headers }">
          <v-data-table :headers="headers" :items="tableData"></v-data-table>
        </template>
      </v-data-table>
    </v-bottom-navigation>
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
    visibleImages: new Map(),
    size: 350,
    folder: "val2017",
    storageRef: FirebaseStorage.ref(),
    busy: false,
    page: [],
    pageSize: 5,
    search: "",
    tablePage: 1,
    headers: [
      {
        text: "ID",
        sortable: false,
        value: "id"
      },
      {
        text: "Annotation ID",
        sortable: false,
        value: "annotation_id"
      },
      {
        text: "Annotation BBox",
        sortable: false,
        value: "annotation_bbox"
      }
    ]
  }),
  computed: {
    tableData: function() {
      let data = [];
      this.images.forEach(item => {
        let dataItem = {
          id: item.image.id,
          annotation_id: item.annotations[0].id,
          annotation_bbox: item.annotations[0].bbox
        };
        data.push(dataItem);
      });
      return data;
    }
  },
  mounted() {
    this.loadFirstPage();
  },
  methods: {
    async testClick(img) {
      this.$router.push({
        name: "image",
        params: {
          id: img.image.id,
          source: img.url,
          annotations: img.annotations
        }
      });
    },
    visibilityChanged(isVisible, entry, image) {
      this.visibleImages[image.id] = isVisible;
    },
    async loadFirstPage() {
      this.busy = true;
      this.page = await database.images
        .orderBy("id")
        .limit(this.pageSize)
        .toArray();
      //For some reason cannot use for..of -> produces Uncaught exception: this.page[Symbol.iterator] is not a function
      for (let i = 0; i < this.page.length; i++) {
        let item = this.page[i];
        let imageURL = await this.storageRef
          .child(this.folder + "/" + item.file_name)
          .getDownloadURL();
        let annotations = await database.annotations
          .where("image_id")
          .equals(item.id)
          .toArray();
        let imageWithInfo = {
          image: item,
          url: imageURL,
          annotations: annotations
        };
        this.images.push(imageWithInfo);
      }
      this.busy = false;
    },
    async loadMore() {
      if (this.page.length < this.pageSize) return;
      this.busy = true;
      this.tablePage++;
      let lastImage = this.page[this.page.length - 1];
      this.page = await database.images
        .where("id")
        .above(lastImage.id)
        .limit(this.pageSize)
        .toArray();
      for (let i = 0; i < this.page.length; i++) {
        let item = this.page[i];
        let imageURL = await this.storageRef
          .child(this.folder + "/" + item.file_name)
          .getDownloadURL();
        let annotations = await database.annotations
          .where("image_id")
          .equals(item.id)
          .toArray();
        let imageWithInfo = {
          image: item,
          url: imageURL,
          annotations: annotations
        };
        this.images.push(imageWithInfo);
      }
      this.busy = false;
    }
  }
};
</script>

<style></style>

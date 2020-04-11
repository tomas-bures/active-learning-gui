<template>
  <div class="dataset">
    <v-container class="my-5">
      <div v-infinite-scroll="loadMore" infinite-scroll-disabled="busy">
        <v-layout row md5 justify-space-around>
          <v-flex
            class="my-4"
            v-for="image in images"
            :key="image.key"
            @click="openAnnotator(image)"
          >
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
    <v-bottom-navigation app height="180" dark>
      <v-container fluid>
        <v-row>
          <v-col cols="4">
            <v-slider v-model="size" min="100" max="1100"></v-slider>
            <v-btn-toggle v-model="sortBy" mandatory>
              <v-btn>BY AREA</v-btn>
              <v-btn>BY TOTAL AREA</v-btn>
              <v-btn>BY SCORE</v-btn>
              <v-btn>BY SCORE</v-btn>
            </v-btn-toggle>
            <v-checkbox v-model="descending" label="Descending"></v-checkbox>
          </v-col>
          <v-col cols="8">
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
          </v-col>
        </v-row>
      </v-container>
    </v-bottom-navigation>
  </div>
</template>

<script>
import Picture from "./Picture.vue";
import { FirebaseStorage } from "@/firebase/storage";
import {
  database,
  getImagesOrderedByAnnotationsArea,
  getImagesFromOrderedAnnotations
} from "@/store/store";

export default {
  name: "image-gallery",
  components: {
    Picture
  },
  data: () => ({
    images: [],
    visibleImages: new Map(),
    size: 350,
    folder: "val2017",
    storageRef: FirebaseStorage.ref(),
    busy: false,
    page: [],
    pageSize: 20,
    search: "",
    tablePage: 1,
    sortBy: 1,
    descending: false,
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
      },
      {
        text: "Annotations area",
        sortable: false,
        value: "annotations_area"
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
          annotation_bbox: item.annotations[0].bbox,
          annotations_area: item.annotationsArea
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
    async openAnnotator(img) {
      const categories = await database.categories.orderBy("id").toArray();
      this.$store.commit("setCategories", categories);
      this.$store.commit("setCurrentImageAnnotations", img.annotations);
      this.$router.push({
        name: "image",
        params: {
          id: img.image.id,
          source: img.url
        }
      });
    },
    visibilityChanged(isVisible, entry, image) {
      this.visibleImages.set(image.id, isVisible);
    },
    async loadFirstPage() {
      this.busy = true;
      this.page = await this.loadImagesOrderedBySelectedCritera();
      //For some reason cannot use for..of -> produces Uncaught exception: this.page[Symbol.iterator] is not a function
      for (let i = 0; i < this.page.length; i++) {
        let item = this.page[i];
        let imageURL = await this.storageRef
          .child(this.folder + "/" + item.file_name)
          .getDownloadURL();
        let imageWithInfo = {
          image: item,
          url: imageURL,
          annotations: item.annotations,
          annotationsArea: item.annotationsArea,
          key: Date.now()
        };
        this.images.push(imageWithInfo);
      }
      this.busy = false;
    },
    async loadMore() {
      if (this.page.length < this.pageSize) return;
      this.busy = true;
      this.tablePage++;
      this.page = await this.loadImagesOrderedBySelectedCritera();
      for (let i = 0; i < this.page.length; i++) {
        let item = this.page[i];
        let imageURL = await this.storageRef
          .child(this.folder + "/" + item.file_name)
          .getDownloadURL();
        let imageWithInfo = {
          image: item,
          url: imageURL,
          annotations: item.annotations,
          annotationsArea: item.annotationsArea,
          key: Date.now()
        };
        this.images.push(imageWithInfo);
      }
      this.busy = false;
    },
    loadImagesOrderedBySelectedCritera() {
      const offset = this.images.length;
      switch (this.sortBy) {
        case 0:
          return getImagesFromOrderedAnnotations(
            offset,
            this.descending,
            this.pageSize
          );
        case 1:
          return getImagesOrderedByAnnotationsArea(
            offset,
            this.descending,
            this.pageSize
          );
        case 3:
          break;
        case 4:
          break;
        default:
          break;
      }
    },
    reloadImages() {
      this.images.length = 0;
      this.page.length = 0;
      console.log(this.images, this.images.length);
      this.loadFirstPage();
    }
  },
  watch: {
    sortBy: function() {
      this.reloadImages();
    },
    descending: function() {
      this.reloadImages();
    }
  }
};
</script>

<style></style>

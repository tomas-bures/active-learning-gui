<template>
  <div class="dataset">
    <v-container class="my-5">
      <div v-infinite-scroll="loadMore" infinite-scroll-disabled="busy">
        <v-layout row md5 justify-space-around>
          <v-flex
            class="my-4"
            v-for="(image, index) in images"
            :key="image.key"
            @click="openAnnotator(image, index)"
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
      <v-overlay :value="overlay">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>
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
              :items-per-page="tableDataLength"
              dense
              hide-default-footer
              height="150"
              @click:row="test"
            ></v-data-table>
          </v-col>
        </v-row>
      </v-container>
    </v-bottom-navigation>
  </div>
</template>

<script>
import Picture from "./Picture.vue";
import { FirebaseStorage } from "@/firebase/storage";
import { database, loadImagesOrderedBySelectedCritera } from "@/store/store";

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
    tablePage: 1,
    overlay: false,
    headers: [
      {
        text: "ID",
        sortable: false,
        value: "id"
      },
      {
        text: "Annotations",
        sortable: false,
        value: "annotation_count"
      },
      {
        text: "Average score",
        sortable: false,
        value: "average_score"
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
          annotation_count: item.image.image_annotations.length,
          average_score:
            item.image.image_annotations.reduce(
              (accumulator, current) => (accumulator += current.score),
              0
            ) / item.image.image_annotations.length,
          annotations_area: item.image.annotationsArea
        };
        data.push(dataItem);
      });
      return data;
    },
    tableDataLength: function() {
      return this.tableData.length;
    },
    sortBy: {
      get() {
        return this.$store.state.sortingCriteria;
      },
      set(sortBy) {
        this.$store.commit("setSortingCriteria", sortBy);
      }
    },
    descending: {
      get() {
        return this.$store.state.descendingOrder;
      },
      set() {
        this.$store.commit("switchDescendingOrder");
      }
    }
  },
  mounted() {
    this.loadFirstPage();
  },
  methods: {
    test(event) {
      const image = this.images.find(item => item.image.id == event.id);
      const index = this.images.findIndex(item => item.image.id == event.id);
      this.openAnnotator(image, index);
    },
    async openAnnotator(img, index) {
      const categories = await database.categories.orderBy("id").toArray();
      this.$store.commit("setCategories", categories);
      this.$store.commit("setCurrentImage", img.image);
      this.$store.commit("setCurrentImageIndex", index);
      this.$router.push({
        name: "image",
        params: {
          id: img.image.id,
          source: img.url
        }
      });
    },
    visibilityChanged(isVisible, entry, image) {
      this.visibleImages.set(image.image, isVisible);
      let visible = [];
      this.visibleImages.forEach((item, key) => {
        if (item) visible.push(key);
      });
      return visible;
    },
    async loadFirstPage() {
      this.busy = true;
      this.overlay = true;
      this.page = await loadImagesOrderedBySelectedCritera(
        this.sortBy,
        this.descending,
        this.pageSize
      );
      this.overlay = false;
      //For some reason cannot use for..of -> produces Uncaught exception: this.page[Symbol.iterator] is not a function
      for (let i = 0; i < this.page.length; i++) {
        let item = this.page[i];
        let imageURL = await this.storageRef
          .child(this.folder + "/" + item.file_name)
          .getDownloadURL();
        let imageWithInfo = {
          image: item,
          url: imageURL,
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
      const offset = this.images.length;
      this.page = await loadImagesOrderedBySelectedCritera(
        this.sortBy,
        this.descending,
        this.pageSize,
        offset
      );
      for (let i = 0; i < this.page.length; i++) {
        let item = this.page[i];
        let imageURL = await this.storageRef
          .child(this.folder + "/" + item.file_name)
          .getDownloadURL();
        let imageWithInfo = {
          image: item,
          url: imageURL,
          key: Date.now()
        };
        this.images.push(imageWithInfo);
      }
      this.busy = false;
    },
    reloadImages() {
      this.images.length = 0;
      this.page.length = 0;
      this.loadFirstPage();
    }
  },
  watch: {
    sortBy: function() {
      this.reloadImages();
      // Needed to rerender images. Without it images sometimes stay there, even though sorting order have been changed
      this.$forceUpdate();
    },
    descending: function() {
      this.reloadImages();
      // Needed to rerender images. Without it images sometimes stay there, even though sorting order have been changed
      this.$forceUpdate();
    }
  }
};
</script>

<style></style>

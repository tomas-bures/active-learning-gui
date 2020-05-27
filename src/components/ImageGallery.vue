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
              :class="'picture' + image.image.id"
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
              <v-btn :disabled="scoresDisabled">BY SCORE</v-btn>
              <v-btn :disabled="scoresDisabled">BY SCORE DISTANCE</v-btn>
            </v-btn-toggle>
            <v-checkbox v-model="descending" label="Descending"></v-checkbox>
          </v-col>
          <v-col cols="8">
            <v-simple-table dense fixed-header height="150">
              <template v-if="sortBy == 1">
                <thead>
                  <tr>
                    <th>Image ID</th>
                    <th>Annotations</th>
                    <th>Average score</th>
                    <th>Annotations area</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in tableData"
                    :key="item.id"
                    @click="$vuetify.goTo(`.picture${item.id}`)"
                    @dblclick="openAnnotatorThroughTableClick"
                    @mouseenter="setTableIndex"
                  >
                    <td>{{ item.id }}</td>
                    <td>{{ item.annotation_count }}</td>
                    <td>{{ item.average_score }}</td>
                    <td>{{ item.annotations_area }}</td>
                  </tr>
                </tbody>
              </template>
              <template v-else>
                <thead>
                  <tr>
                    <th>Image ID</th>
                    <th>Annotation ID</th>
                    <th>Annotation Area</th>
                    <th>Annotation Score</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in tableData"
                    :key="item.key"
                    @click="$vuetify.goTo(`.picture${item.id}`)"
                    @dblclick="openAnnotatorThroughTableClick"
                    @mouseenter="setTableIndex"
                  >
                    <th>{{ item.id }}</th>
                    <th>{{ item.annotation_id }}</th>
                    <th>{{ item.annotation_area }}</th>
                    <th>{{ item.annotation_score }}</th>
                  </tr>
                </tbody>
              </template>
            </v-simple-table>
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
    tableIndex: 0,
    scoresDisabled: false,
    pageLoaded: false
  }),
  computed: {
    tableData: function() {
      if (!this.pageLoaded) {
        return null;
      }
      let data = [];
      if (this.$store.state.sortingCriteria == 1) {
        this.images.forEach(item => {
          const dataItem = {
            id: item.image.id,
            annotation_count: item.image.image_annotations.length,
            average_score:
              item.image.image_annotations.reduce(
                (accumulator, current) => (accumulator += current.score),
                0
              ) / item.image.image_annotations.length,
            annotations_area: item.image.annotationsArea,
            key: item.key
          };
          data.push(dataItem);
        });
      } else {
        try {
          this.images.forEach(item => {
            const dataItem = {
              id: item.image.id,
              annotation_id: item.image.orderedAnnotation.id,
              annotation_area: item.image.orderedAnnotation.area,
              annotation_score: item.image.orderedAnnotation.score,
              key: item.key
            };
            data.push(dataItem);
          });
        } catch (err) {
          this.reloadImages();
        }
      }
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
  beforeCreate() {
    const haveScores = JSON.parse(localStorage.getItem("haveScores"));
    if (!haveScores && this.$store.state.sortingCriteria > 1) {
      this.$store.commit("setSortingCriteria", 1);
    }
  },
  created() {
    const haveScores = JSON.parse(localStorage.getItem("haveScores"));
    if (!haveScores) {
      this.scoresDisabled = true;
    }
  },
  mounted() {
    this.loadFirstPage();
  },
  methods: {
    setTableIndex(event) {
      this.tableIndex = event.target.rowIndex - 1;
    },
    openAnnotatorThroughTableClick(event) {
      const image = this.images[this.tableIndex];
      this.openAnnotator(image, this.tableIndex);
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
        const uuid = this.create_UUID();
        let imageWithInfo = {
          image: item,
          url: imageURL,
          key: uuid
        };
        this.images.push(imageWithInfo);
      }
      this.busy = false;
      this.pageLoaded = true;
    },
    //Taken from https://www.w3resource.com/javascript-exercises/javascript-math-exercise-23.php
    create_UUID() {
      let dt = new Date().getTime();
      let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function(c) {
          let r = (dt + Math.random() * 16) % 16 | 0;
          dt = Math.floor(dt / 16);
          return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
        }
      );
      return uuid;
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
        const uuid = this.create_UUID();
        let imageWithInfo = {
          image: item,
          url: imageURL,
          key: uuid
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

<template>
  <div class="dataset">
    <h1>Images</h1>
    <v-slider v-model="size" min="100" max="1100" thumb-label="always"></v-slider>
    <v-container class="my-5">
      <v-layout row md5 justify-space-around>
        <v-flex class="my-4" v-for="n in 500" :key="n">
          <v-lazy :options="{
              threshold: 0.5
            }">
            <Picture :size="size" />
          </v-lazy>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script lang="ts">
import Picture from "./Picture.vue";

export default {
  name: "image-gallery",
  components: {
    Picture
  },
  data: () => ({
    images: new Array<String>(),
    size: 350
  }),
  mounted() {}
};
</script>

<style></style>

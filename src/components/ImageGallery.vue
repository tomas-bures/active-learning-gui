<template>
  <div>
    <ul>
      <li v-bind:key="img" v-for="img in images">
        <img v-lazy="img.src" />
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import VueLazyload from "vue-lazyload";
import { FirebaseStorage } from "../firebase/storage";

Vue.use(VueLazyload);

export default {
  data: () => ({
    images: new Array<String>()
  })
};
</script>

<style></style>

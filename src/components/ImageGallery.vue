<template>
  <div>
    <ul>
      <li v-for="img in images">
        <img v-lazy="img.src" />
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import VueLazyload from "vue-lazyload";

Vue.use(VueLazyload);

export default {
  data: () => ({
    images: []
  }),
  created: function() {
  }
};
</script>

<style></style>

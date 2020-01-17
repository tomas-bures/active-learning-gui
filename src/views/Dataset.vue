<template>
  <div class="dataset">
    <h1>Images</h1>
    <v-container class="my-5">
      <v-layout row justify-space-around v-for="n in 500" :key="n">
        <v-flex md3 class="my-4" v-for="i in 3" :key="i">
          <v-lazy
            :options="{
              threshold: 0.5
            }"
          >
            <Picture />
          </v-lazy>
        </v-flex>
      </v-layout>
    </v-container>
  </div>
</template>

<script>
import Picture from "../components/Picture.vue";

export default {
  components: {
    Picture
  }
};
</script>

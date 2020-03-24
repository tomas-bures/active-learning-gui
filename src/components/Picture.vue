<template>
  <div class="picture">
    <v-card hover outlined :max-width="size + 10" class="test">
      <v-img
        class="grey darken-4 mx-1 my-1"
        :src="source"
        lazy-src="../assets/placeholder.gif"
        :height="size"
        :width="size"
      ></v-img>
      <v-card-subtitle>Image ID: {{ id }}</v-card-subtitle>
    </v-card>
  </div>
</template>

<script>
export default {
  data: () => ({}),
  props: {
    size: Number,
    source: String,
    id: Number
  }
};
</script>

<style></style>

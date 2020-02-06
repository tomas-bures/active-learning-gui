<template>
  <div class="picture">
    <v-card hover outlined :max-height="size + 10" :max-width="size + 10" class="test">
      <v-img
        class="grey darken-4 mx-1 my-1"
        :src="source"
        lazy-src="../assets/placeholder.gif"
        :height="size"
        :width="size"
      ></v-img>
    </v-card>
  </div>
</template>

<script>
export default {
  data: () => ({}),
  props: {
    size: Number,
    source: String
  }
};
</script>

<style></style>

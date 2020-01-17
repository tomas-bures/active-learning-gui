<template>
  <div class="picture">
    <v-img
      :src="source"
      class="grey darken-4"
      lazy-src="../assets/placeholder.gif"
    ></v-img>
  </div>
</template>

<script>
export default {
  data: () => ({
    source: "https://picsum.photos/"
  }),
  mounted() {
    let width = Math.floor(Math.random() * Math.floor(200) + 250);
    let height = Math.floor(Math.random() * Math.floor(200) + 250);
    this.source += `${width}/${height}`;
  }
};
</script>

<style></style>

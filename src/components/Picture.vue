<template>
  <div class="picture">
    <v-img :src="source"></v-img>
  </div>
</template>

<script>
export default {
  data: () => ({
    source: "https://picsum.photos/"
  }),
  mounted() {
    let width = Math.floor(Math.random() * Math.floor(900) + 250);
    let height = Math.floor(Math.random() * Math.floor(900) + 250);
    this.source += `${width}/${height}`;
  }
};
</script>

<style></style>

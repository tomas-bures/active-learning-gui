<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png" />
    <image-gallery />
  </div>
</template>

<script>
// @ is an alias to /src
import ImageGallery from "@/components/ImageGallery.vue";

export default {
  name: "home",
  components: {
    ImageGallery
  }
};
</script>

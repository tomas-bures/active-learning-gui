<template>
  <v-app class="grey lighten-4">
    <Navbar />
    <v-content class="mx-4 mb-4">
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
import Vue from "vue";
import Navbar from "@/components/Navbar.vue";
import infiniteScroll from "vue-infinite-scroll";

Vue.use(infiniteScroll);

export default Vue.extend({
  name: "App",

  components: {
    Navbar
  },

  data: () => ({
    //
  })
});
</script>

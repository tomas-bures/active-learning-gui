<template>
  <v-app>
    <Navbar />
    <v-content class="mx-4 mb-4 grey lighten-3">
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
import Vue from "vue";
import Navbar from "@/components/Navbar.vue";
import infiniteScroll from "vue-infinite-scroll";
import VueObserveVisibility from "vue-observe-visibility";

Vue.use(infiniteScroll);
Vue.use(VueObserveVisibility);

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

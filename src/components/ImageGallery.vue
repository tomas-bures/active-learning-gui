<template>
  <div>
    <ul>
      <li></li>
    </ul>
  </div>
</template>

<script>
import VueLazyload from "vue-lazyload";

Vue.use(VueLazyload);

export default {
  created: function() {
    this.firebaseConfig = {
      apiKey: "AIzaSyD3MntPmTPd2SVEzhq_zenEELe68HbO-DA",
      storageBucket: "gs://active-learning-gui.appspot.com"
    };
    this.firebase.initializeApp(firebaseConfig);
    this.storage = firebase.storage();
  }
};
</script>

<style></style>

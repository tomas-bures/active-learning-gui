import Vue from "vue";
import App from "./App.vue";
import "./registerServiceWorker";
import router from "./router";
import store from "./store";

import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyD3MntPmTPd2SVEzhq_zenEELe68HbO-DA",
  authDomain: "active-learning-gui.firebaseapp.com",
  databaseURL: "https://active-learning-gui.firebaseio.com",
  projectId: "active-learning-gui",
  storageBucket: "active-learning-gui.appspot.com",
  messagingSenderId: "120973970729",
  appId: "1:120973970729:web:14aa7b7a8fc70adeb13b38",
  measurementId: "G-T5ZECTFNHR"
};

firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");

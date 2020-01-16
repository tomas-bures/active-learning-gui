import Vue from "vue";
import VueRouter from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import Dataset from "../views/Dataset.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "dashboard",
    component: Dashboard
  },
  {
    path: "/dataset",
    name: "dataset",
    component: Dataset
  }
];

const router = new VueRouter({
  routes
});

export default router;

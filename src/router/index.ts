import Vue from "vue";
import VueRouter from "vue-router";
import Dashboard from "../views/Dashboard.vue";
import Dataset from "../views/Dataset.vue";
import Projects from "../views/Projects.vue";
import ImageView from "../views/ImageView.vue";

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
  },
  {
    path: "/projects",
    name: "projects",
    component: Projects
  },
  {
    path: "/image/:id",
    name: "image",
    component: ImageView
  }
];

const router = new VueRouter({
  routes
});

export default router;

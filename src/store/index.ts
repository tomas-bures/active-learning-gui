import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    categories: [],
    currentImage: null
  },
  mutations: {
    setCategories(state, categories) {
      state.categories = categories;
    },
    setCurrentImage(state, annotations) {
      state.currentImage = annotations;
    }
  },
  actions: {},
  modules: {}
});

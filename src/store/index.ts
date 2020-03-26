import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    categories: new Array(),
    currentImageAnnotations: new Array()
  },
  mutations: {
    setCategories(state, categories) {
      state.categories = categories;
    },
    setCurrentImageAnnotations(state, annotations) {
      state.currentImageAnnotations = annotations;
    }
  },
  actions: {},
  modules: {}
});

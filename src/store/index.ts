import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    categories: [],
    currentImage: null,
    sortingCriteria: 1,
    descendingOrder: false,
    currentImageIndex: null,
  },
  mutations: {
    setCategories(state, categories) {
      state.categories = categories;
    },
    setCurrentImage(state, annotations) {
      state.currentImage = annotations;
    },
    setSortingCriteria(state, criteria) {
      state.sortingCriteria = criteria;
    },
    switchDescendingOrder(state) {
      state.descendingOrder = !state.descendingOrder;
    },
    setCurrentImageIndex(state, index) {
      state.currentImageIndex = index;
    },
  },
  actions: {},
  modules: {},
});

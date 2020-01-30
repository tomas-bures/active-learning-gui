<template>
  <nav>
    <v-app-bar flat dark app clipped-left>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title class="text-uppercase">
        <span>Active learning gui</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon>
        <v-icon class="white--text">person</v-icon>
      </v-btn>
      <v-btn icon>
        <v-icon class="white--text">exit_to_app</v-icon>
      </v-btn>
    </v-app-bar>
    <v-navigation-drawer v-model="drawer" app clipped dark>
      <v-list>
        <v-list-item v-for="link in links" :key="link.text" router :to="link.route">
          <v-list-item-action>
            <v-icon class="white--text">{{ link.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ link.text }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </nav>
</template>

<script>
export default {
  data: () => ({
    drawer: true,
    links: [
      { icon: "dashboard", text: "Dashboard", route: "/" },
      { icon: "folder", text: "My Projects", route: "/projects" },
      { icon: "picture_in_picture", text: "Images", route: "/dataset" }
    ]
  })
};
</script>

<style></style>

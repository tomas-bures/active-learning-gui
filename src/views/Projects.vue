<template>
  <div>
    <v-card :loading="loading">
      <v-file-input
        class="my-5 mx-5"
        multiple
        label="File input"
        @change="readFiles"
      ></v-file-input>
    </v-card>
    <v-card :loading="loading">
      <v-file-input
        class="my-5 mx-5"
        multiple
        label="JSON input"
        @change="readJSON"
      ></v-file-input>
    </v-card>
    <v-overlay :value="overlay">
      <v-progress-circular indeterminate size="64"></v-progress-circular>
    </v-overlay>
  </div>
</template>

<script>
import JSZip from "jszip";
import { FirebaseStorage } from "@/firebase/storage";
import { database } from "@/store/store";

export default {
  data: () => ({
    loading: false,
    storageRef: FirebaseStorage.ref(),
    overlay: false
  }),
  methods: {
    readFiles(e) {
      this.loading = true;
      for (let i = 0; i < e.length; i++) {
        let file = e[i];
        let imageRef = this.storageRef.child("val2017/" + file.name);
        imageRef.put(file);
      }
      this.loading = false;
    },
    readJSON(e) {
      let file = e[0];
      let reader = new FileReader();
      reader.onload = () => {
        let fileContent = JSON.parse(reader.result);
        this.populateDatabase(fileContent);
      };
      reader.readAsText(file);
    },
    async populateDatabase(fileContent) {
      this.overlay = true;
      await Promise.all([
        database.annotations.clear(),
        database.categories.clear(),
        database.images.clear(),
        database.licenses.clear()
      ]);
      await database.transaction(
        "rw",
        database.annotations,
        database.categories,
        database.images,
        database.licenses,
        async function() {
          fileContent.annotations.forEach(annotation =>
            database.annotations.add(annotation)
          );
          fileContent.categories.forEach(category =>
            database.categories.add(category)
          );
          for (let image of fileContent.images) {
            image.annotations = await database.annotations
              .where("image_id")
              .equals(image.id)
              .toArray();
            if (image.annotations.length > 0) {
              image.annotationsArea = image.annotations.reduce(
                (acc, annotation) => acc + annotation.area,
                0
              );
            }
            database.images.add(image);
          }
          fileContent.licenses.forEach(license =>
            database.licenses.add(license)
          );
        }
      );
      this.overlay = false;
      alert("JSON file succesfully imported");
    }
  }
};
</script>

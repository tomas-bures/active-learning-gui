<template>
  <div>
    <v-card :loading="loading">
      <v-file-input class="my-5 mx-5" multiple label="File input" @change="readFiles"></v-file-input>
    </v-card>
    <v-card :loading="loading">
      <v-file-input class="my-5 mx-5" multiple label="JSON input" @change="readJSON"></v-file-input>
    </v-card>
  </div>
</template>

<script>
import JSZip from "jszip";
import { FirebaseStorage } from "@/firebase/storage";
import { database } from "@/store/store";

export default {
  data: () => ({
    loading: false,
    storageRef: FirebaseStorage.ref()
  }),
  methods: {
    readFiles(e) {
      this.loading = true;
      for (let i = 0; i < e.length; i++) {
        let file = e[i];
        let imageRef = this.storageRef.child("val2017/" + file.name);
        imageRef
          .put(file)
          .then(function(snapshot) {
            console.log("Uploaded file number " + i);
          })
          .catch(reason => {
            console.log(reason);
          });
      }
      this.loading = false;
    },
    readJSON(e) {
      let file = e[0];
      let reader = new FileReader();
      reader.onload = () => {
        let fileContent = JSON.parse(reader.result);
        this.populateDatabase(fileContent).then(x => {
          console.log("HOTOVO");
        });
      };
      reader.readAsText(file);
    },
    async populateDatabase(fileContent) {
      await Promise.all([
        database.annotations.clear(),
        database.categories.clear(),
        database.images.clear(),
        database.infos.clear(),
        database.licenses.clear()
      ]);
      await database.transaction(
        "rw",
        database.annotations,
        database.categories,
        database.images,
        database.infos,
        database.licenses,
        async function() {
          fileContent.annotations.forEach(annotation =>
            database.annotations.add(annotation)
          );
          fileContent.categories.forEach(category =>
            database.categories.add(category)
          );
          fileContent.images.forEach(image => database.images.add(image));
          fileContent.licenses.forEach(license =>
            database.licenses.add(license)
          );
        }
      );
    }
  }
};
</script>

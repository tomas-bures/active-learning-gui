<template>
  <div>
    <v-card :loading="loading">
      <v-file-input class="my-5 mx-5" multiple label="File input" @change="readFiles"></v-file-input>
    </v-card>
    <v-btn @click="printFiles">List files</v-btn>
  </div>
</template>

<script>
import JSZip from "jszip";
import { FirebaseStorage } from "@/firebase/storage";

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
    async printFiles() {
      let listRef = this.storageRef.child("val2017");
      let firstPage = await listRef.list({ maxResults: 100 });
      firstPage.items.forEach(item => {
        console.log(item.location.path);
      });
    }
  }
};
</script>

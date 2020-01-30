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
    <v-textarea :value="text"></v-textarea>
    <v-img height="300" width="300" :src="image" :key="image"></v-img>
  </div>
</template>

<script>
import JSZip from "jszip";
import { FirebaseStorage } from "@/firebase/storage";

export default {
  data: () => ({
    text: "",
    loading: false,
    image: "https://i.picsum.photos/id/1021/200/300.jpg"
  }),
  methods: {
    readFiles(e) {
      let file = e[0];
      let reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function(f) {
        //this.image = f.target.result;
        console.log(typeof f.target.result);
      };
      let storageRef = FirebaseStorage.ref();
      let imageRef = storageRef.child("val2017/" + file.name);
      imageRef
        .put(file)
        .then(function(snapshot) {
          console.log("Uploaded a blob or file!");
        })
        .catch(reason => {
          console.log(reason);
        });
    },
    printFile(e) {
      this.loading = true;
      let file = e[0];
      JSZip.loadAsync(file).then(zip => {
        this.loading = false;
        console.log(zip.file("val2017/000000000139.jpg"));
        let img = zip
          .file("val2017/000000000139.jpg")
          .async("Uint8Array")
          .then(f => {
            let storageRef = FirebaseStorage.ref();
            let imageRef = storageRef.child("val2017/" + file.name);
            imageRef.put(file).then(function(snapshot) {
              console.log("Uploaded a blob or file!");
            });
          });
        // zip.forEach((path, entry) => {
        //   this.text += entry.name + "\n";
        // });
      });
    }
  }
};
</script>

<template>
  <v-container class="d-flex column">
    <blockquote v-if="!fileName">Please use the button below to select a file.</blockquote>
    <blockquote>{{fileName}}</blockquote>

    <input ref="file" class="hide-input" type="file" @change="fileSelected" />
    <v-btn rounded color="blue" @click="selectFile">
      <v-icon>mdi-file</v-icon>
      <span>&nbsp;Select File</span>
    </v-btn>

    <v-btn rounded color="indigo" @click="upload_file">
      <v-icon>mdi-cloud-upload</v-icon>
      <span>&nbsp;Upload</span>
    </v-btn>
  </v-container>
</template>


<script>
export default {
  name: "FileUpload",
  data: () => ({
    file: "",
    fileName: ""
  }),
  methods: {
    selectFile() {
      this.file = this.$refs.file.click();
    },
    fileSelected(e) {
      this.$emit("input", e.target.files[0]);
      this.file = this.$refs.file.files[0];
      this.fileName = this.file.name;
    },
    file() {}
  }
};
</script>

 <style scoped>
.hide-input {
  display: none;
}
* {
  text-transform: none !important;
}
.upload-button {
  border-radius: 50px;
  color: white;
}
</style>
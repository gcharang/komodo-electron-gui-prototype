<template>
  <v-card class="d-flex flex-column" outlined tile>
    <v-card-title>Publish</v-card-title>
    <file-upload />
  </v-card>
</template>

<script>
import FileUpload from "@/components/FileSelect.vue";

export default {
  name: "PublisherPage",
  components: {
    FileUpload
  }
};
</script>
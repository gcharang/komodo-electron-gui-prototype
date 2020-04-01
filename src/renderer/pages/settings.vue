<template>
  <v-row justify="center">
    <v-col cols="auto">
      <v-card width="1000" height="800" raised>
        <v-card-title>Settings</v-card-title>
        <v-col cols="auto">
          <v-card width="450" height="300" raised>
            <v-card-title>Select the Komodo Daemon</v-card-title>
            <v-file-input
              v-model="chosenFile"
              label="Click here to select the Komodo Daemon"
              outlined
              :error-messages="error"
              @click="clearError"
            />
            <v-card-text>
              <p>{{}}</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  data() {
    return {
      chosenFile: null,
      error: "",
    };
  },
  computed: {
    fileSelected() {
      return this.chosenFile != null;
    },
    fileName() {
      return this.fileSelected ? this.chosenFile.name : null;
    },
    filePath() {
      return this.fileSelected ? this.chosenFile.path : null;
    },
    fileIsValid() {
      return this.fileSelected
        ? this.fileName.startsWith("komodod") && this.fileSize >= 0
        : null;
    },
    fileSize() {
      return this.fileSelected ? this.chosenFile.size : null;
    },
  },
  methods: {
    clearError() {
      this.error = "";
    },
  },
};
</script>







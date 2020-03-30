<template>
  <v-row justify="center">
    <v-col cols="auto">
      <v-card width="600" height="350" raised>
        <v-card-title>Use the text field below to Select a file:</v-card-title>
        <v-card-text>
          <blockquote>
            The file name must have fewer than 16 characters (including spaces
            and file extension)
          </blockquote>
          <blockquote>
            The file must be present in the directory:
            <b>{{ dexp2pDir }}</b>
          </blockquote>
          <br />
          <v-file-input
            v-model="chosenFile"
            label="Click here to select a file"
            outlined
            :error-messages="errors"
            show-size
            :disabled="uploading"
          />
          <blockquote v-if="uploading">
            No new files can be selected/uploaded while a file is being
            uploaded.
          </blockquote>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            :disabled="uploadButtonDisabled"
            color="indigo"
            @click="upload_file"
          >
            <v-icon>mdi-cloud-upload</v-icon>
            <span>&nbsp;Upload</span>
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
    <v-col cols="auto">
      <v-card v-if="uploading" width="600" height="350" raised>
        <v-card-title>Progress</v-card-title>
        <v-row justify="center" align="center">
          <div class="text-center ma-12">
            <v-progress-circular
              size="60"
              :value="uploadProgress"
              width="10"
              color="light-blue"
            >
              {{ uploadProgress }}
            </v-progress-circular>
          </div>
        </v-row>
        <v-card-text>
          <p>{{}}</p>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import * as path from "path";

export default {
  name: "PublisherPage",
  data() {
    return {
      chosenFile: null,
      uploading: false,
      uploadProgress: 0,
      errors: [],
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
      return this.fileSelected ? this.fileName.length <= 15 : null;
    },
    uploadButtonDisabled() {
      return !(this.fileSelected && this.fileIsValid && !this.uploading);
    },
    chainRPC() {
      return this.$store.state.chainObj.rpc();
    },
    daemonConnected() {
      return this.$store.state.daemonConnected;
    },
    dexp2pDir() {
      return this.$store.state.dexp2pDir;
    },
    dbPath() {
      return this.$store.state.dbPath;
    },
  },
  watch: {
    chosenFile(val) {
      if (val) {
        if (
          val.name.length > 15 &&
          !(val.path === path.join(this.dexp2pDir, this.fileName))
        ) {
          this.errors = [
            `File should be present in the directory: ${this.dexp2pDir} and its name should have fewer than 16 characters`,
          ];
        } else if (val.name.length > 15) {
          this.errors = ["File's name should have fewer than 16 characters"];
        } else if (!(val.path === path.join(this.dexp2pDir, this.fileName))) {
          this.errors = [
            `File should be present in the directory: ${this.dexp2pDir}`,
          ];
        }
      } else {
        this.errors = [];
      }
    },
  },
  methods: {
    async upload_file() {
      if (!this.daemonConnected) {
        console.log("Make sure the daemon is running");
        return;
      }
      this.uploading = true;
      try {
        const resp = await this.chainRPC.DEX_publish(this.fileName);
        console.log(resp);
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>

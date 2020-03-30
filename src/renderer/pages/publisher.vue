<template>
  <v-row justify="center">
    <v-col cols="auto">
      <v-card width="600" height="350" raised>
        <v-card-title>Use the text field below to Select a file:</v-card-title>
        <v-card-text>
          <blockquote>
            The file must satisfy the following conditions:
            <li>
              it must be present in the directory: <b>{{ dexp2pDir }}</b>
            </li>
            <li>
              its name must have fewer than 16 characters (including spaces and
              file extension)
            </li>
            <li>its size must be less than 100 MB</li>
          </blockquote>
          <br />
          <v-file-input
            v-model="chosenFile"
            label="Click here to select a file"
            outlined
            :error-messages="errors"
            show-size
            :disabled="uploading"
            @click="clearError"
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
      return this.fileSelected
        ? this.fileName.length <= 15 && this.fileSize <= 100000
        : null;
    },
    fileSize() {
      return this.fileSelected ? this.chosenFile.size : null;
    },
    fileIsInDatadir() {
      return this.fileSelected
        ? this.chosenFile.path === path.join(this.dexp2pDir, this.fileName)
        : null;
    },
    uploadButtonDisabled() {
      return !(
        this.fileSelected &&
        this.fileIsValid &&
        this.fileIsInDatadir &&
        !this.uploading
      );
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
      if (this.fileSelected) {
        if (!this.fileIsInDatadir) {
          this.errors[0] = this.errors[0]
            ? this.errors[0] +
              `File should be present in the directory: ${this.dexp2pDir}. `
            : `File should be present in the directory: ${this.dexp2pDir}. `;
        }
        if (this.fileName.length > 15) {
          this.errors[0] = this.errors[0]
            ? this.errors[0] +
              "File's name must have fewer than 16 characters. "
            : "File's name must have fewer than 16 characters. ";
        }
        if (this.fileSize > 100000000) {
          this.errors[0] = this.errors[0]
            ? this.errors[0] +
              this.errors[0] +
              "File's size must be less than 100 MB. "
            : "File's size must be less than 100 MB. ";
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
        this.$store.state.latestPublishData = await this.chainRPC.DEX_publish(
          this.fileName
        );
      } catch (error) {
        console.log(error);
      }
    },
    clearError() {
      this.errors = [];
    },
  },
};
</script>

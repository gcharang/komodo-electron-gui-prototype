<template>
  <v-row justify="center">
    <v-col cols="auto">
      <v-card width="600" height="350" raised>
        <v-card-title>Use the text field below to Select a file:</v-card-title>
        <v-card-text>
          <blockquote>
            The file must satisfy the following conditions:
            <li>
              it must be present in the directory:
              <b>{{ dexp2pDir }}</b>
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
            :error-messages="error"
            show-size
            :disabled="uploading"
            @click="clearError"
            @click:clear="clearError"
          />
          <blockquote v-if="uploading">
            Only one file can be uploaded at a time.
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
      <v-card width="600" height="350" raised>
        <v-card-title>Progress</v-card-title>
        <v-card-text>
          <blockquote v-if="uploading">
            Publishing the file named
            <b>{{ fileName }}</b>
          </blockquote>
          <blockquote v-else-if="latestPublishData.fname">
            Successfully published the file named
            <b>{{ latestPublishData.fname }}</b>
          </blockquote>
        </v-card-text>
        <v-row justify="center" align="center">
          <div class="text-center ma-12">
            <v-progress-circular
              size="85"
              rotate="-90"
              :value="publishProgress"
              width="15"
              color="light-blue"
              >{{ publishProgress }}</v-progress-circular
            >
          </div>
        </v-row>
      </v-card>
      <v-snackbar
        v-model="snackbar"
        :color="snackbarColor"
        bottom
        right
        multi-line
      >
        {{ snackbarError }}
        <v-btn text @click="snackbar = false">Close</v-btn>
      </v-snackbar>
    </v-col>
    <v-col cols="auto">
      <v-card width="1500" height="400" raised>
        <v-toolbar>
          <v-toolbar-title>Published files</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn color="indigo" @click="refresh_publishedfiles_list">
            <v-icon>mdi-refresh</v-icon>
            <span>&nbsp;Refresh</span>
          </v-btn>
        </v-toolbar>
        <v-data-table
          :headers="headers"
          :items="allPublishedFilesDataFromDB"
          :items-per-page="5"
          :sort-by="['publishTimeStamp']"
          :sort-desc="[true]"
          dense
          multi-sort
          item-key="name"
          class="elevation-1"
        >
          <template v-slot:item.filesize="{ item }">{{
            prettyBytes(item.filesize)
          }}</template>
        </v-data-table>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import * as path from "path";
import prettyBytes from "pretty-bytes";
export default {
  name: "PublisherPage",
  data() {
    return {
      chosenFile: null,
      uploading: false,
      error: "",
      snackbar: false,
      snackbarColor: "error",
      snackbarError: "",
      fileSizeLimit: 100000000,
      headers: [
        {
          text: "File Name",
          align: "start",
          sortable: false,
          value: "filename",
        },
        // { text: "Address", sortable: false, value: "address" },
        { text: "Time", value: "publishTimeStamp" },
        { text: "File Size", value: "filesize" },
        { text: "id", value: "id" },
        { text: "Number of Fragments", value: "fragments" },
        { text: "File hash", value: "filehash" },
        { text: "Chain Details", value: "chainNameAndMagic" },
        { text: "Sender Pubkey", value: "senderpub" },
      ],
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
        ? this.fileName.length <= 15 && this.fileSize <= this.fileSizeLimit
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
    publishProgress() {
      return this.$store.state.publishProgress;
    },
    latestPublishData() {
      return this.$store.state.latestPublishData;
    },
    allPublishedFilesDataFromDB() {
      return this.$store.state.allPublishedFilesDataFromDB;
    },
  },
  watch: {
    chosenFile(val) {
      if (this.fileSelected) {
        if (!this.fileIsInDatadir) {
          this.error = this.error
            ? this.error +
              `File should be present in the directory: ${this.dexp2pDir}. `
            : `File should be present in the directory: ${this.dexp2pDir}. `;
        }
        if (this.fileName.length > 15) {
          this.error = this.error
            ? this.error + "File's name must have fewer than 16 characters. "
            : "File's name must have fewer than 16 characters. ";
        }
        if (this.fileSize > this.fileSizeLimit) {
          this.error = this.error
            ? this.error + "File's size must be less than 100 MB. "
            : "File's size must be less than 100 MB. ";
        }
      } else {
        this.errors = [];
      }
    },
  },
  methods: {
    prettyBytes(filesize) {
      return prettyBytes(filesize);
    },
    async upload_file() {
      if (!this.daemonConnected) {
        this.snackbarError = "Wait till the daemon is running";
        this.snackbar = true;
        // console.log("Make sure the daemon is running");
        return;
      }
      this.uploading = true;
      try {
        this.$store.dispatch("getPublishProgress");
        const latestPublishData = await this.chainRPC.DEX_publish(
          this.fileName
        );
        if (latestPublishData.id) {
          this.$store.commit("SET_PUBLISH_PROGRESS", { publishProgress: 100 });
        }
        this.uploading = false;
        this.$store.commit("SET_LATEST_PUBLISH_DATA", {
          latestPublishData,
        });
        this.$store.dispatch("storePublishDataInDB", { latestPublishData });
        // const transformedLatestPublishData =
        this.$store.dispatch("addFileToPublishedFileDataFromDB", {
          file: {
            id: latestPublishData.id,
            filehash: latestPublishData.filehash,
            filename: latestPublishData.fname,
            filesize: latestPublishData.filesize,
            fragments: latestPublishData.fragments,
            senderpub: `${latestPublishData.senderpub.slice(
              0,
              5
            )}.....${latestPublishData.senderpub.slice(-5)}`,
            chainNameAndMagic: `${this.$store.state.chainName} (${this.$store.state.chainMagic})`,
            publishTimeStamp: this.$moment(),
          },
        });
      } catch (error) {
        this.snackbarError = error;
        this.snackbar = true;
        // console.log(error);
      }
    },
    clearError() {
      this.error = "";
    },
    refresh_publishedfiles_list() {
      this.$store.dispatch("getPublishedFilesDataFromDB");
    },
  },
};
</script>

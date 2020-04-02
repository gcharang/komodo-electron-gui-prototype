<template>
  <v-row justify="center">
    <v-col cols="auto">
      <v-card width="1600" height="800" raised>
        <v-card-title>Settings</v-card-title>
        <v-col cols="auto">
          <v-card width="450" height="250" raised>
            <v-toolbar>
              <v-toolbar-title>Select the Komodo Daemon</v-toolbar-title
              ><v-spacer />
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-switch
                    v-model="komododSelected"
                    :disabled="!fileIsValid"
                    inset
                    hide-details
                    v-on="on"
                    ><template v-slot:prepend>
                      <v-icon v-if="komododSelected" color="success"
                        >mdi-lock-check
                      </v-icon>
                      <v-icon v-else color="error"
                        >mdi-lock-open-variant
                      </v-icon>
                    </template>
                  </v-switch>
                </template>
                <span>{{
                  komododSelected
                    ? "Click the switch to select a DIFFERENT File"
                    : "Click the switch to CONFIRM your selection"
                }}</span>
              </v-tooltip>
            </v-toolbar>
            <br />
            <v-file-input
              v-model="chosenFile"
              label="Click here to select the Komodo Daemon"
              outlined
              :disabled="komododSelected"
              :error-messages="error"
              @click="clearError"
              @click:clear="clearError"
            />
            <blockquote v-if="fileIsValid">
              The path of the selected Komodo Daemon is
              <b>{{ chosenFile.path }}</b>
            </blockquote>
          </v-card>
        </v-col>
        <v-col cols="auto">
          <v-card width="450" height="350" raised>
            <v-toolbar>
              <v-toolbar-title>Verify Authenticity</v-toolbar-title><v-spacer />
              <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-checkbox
                    v-model="verifyAuthenticityEnabled"
                    hide-details
                    :disabled="!komododSelected"
                    v-on="on"
                  >
                  </v-checkbox>
                </template>
                <span>{{
                  verifyAuthenticityEnabled
                    ? "Click to  Disable"
                    : "Click to Enable"
                }}</span>
              </v-tooltip>
            </v-toolbar>
            <br />
            <v-text-field
              v-model="expectedShaSum"
              :disabled="verifyAuthTextFieldDisabled"
              label="Expected SHASUM"
            ></v-text-field>
            <v-text-field
              v-model="signerPubkey"
              :disabled="true"
              label="Signer's Pubkey"
            ></v-text-field>
            <v-text-field
              v-model="expectedSignature"
              :disabled="true"
              label="Expected Signature"
            ></v-text-field>
            <v-card-actions>
              <blockquote v-if="shaSumMatches">
                The SHA256 checksum matches
              </blockquote>
              <v-spacer />
              <v-btn
                :disabled="verifyButtonDisabled"
                color="indigo"
                @click="verifyShaSum"
              >
                <v-icon>mdi-shield-check</v-icon>
                <span>&nbsp;Verify</span>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-card>
    </v-col>

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
  </v-row>
</template>

<script>
import crypto from "crypto";
import fs from "fs";

export default {
  data() {
    return {
      chosenFile: null,
      error: "",
      snackbar: false,
      snackbarColor: "error",
      snackbarError: "",
      komododSelected: false,
      verifyAuthenticityEnabled: false,
      expectedShaSum: "",
      expectedSignature: "",
      signerPubkey: "",
      shasumIsValid: false,
      signatureIsValid: false,
      shaSumMatches: null,
    };
  },
  computed: {
    OS() {
      return this.$store.state.OS;
    },
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
      if (this.fileSelected) {
        if (this.OS === "win32") {
          return this.fileName === "komodod.exe" && this.fileSize >= 0;
        } else {
          return this.fileName === "komodod" && this.fileSize >= 0;
        }
      } else {
        return null;
      }
    },
    fileSize() {
      return this.fileSelected ? this.chosenFile.size : null;
    },
    komododSwitchIcon() {
      return this.komododSelected ? "mdi-lock-check" : "mdi-lock-open-variant";
    },
    verifyAuthTextFieldDisabled() {
      return !(this.komododSelected && this.verifyAuthenticityEnabled);
    },
    verifyButtonDisabled() {
      return this.verifyAuthTextFieldDisabled;
    },
  },
  watch: {
    chosenFile(val) {
      if (this.fileSelected) {
        if (this.OS === "win32") {
          if (this.fileName !== "komodod.exe") {
            this.error = this.error
              ? this.error + `The file's name should be "komodod.exe". `
              : `The file's name should be "komodod.exe". `;
          }
          if (this.fileSize === 0) {
            this.error = this.error
              ? this.error + `The file's size should not be zero. `
              : `The file's size should not be zero. `;
          }
        } else {
          if (this.fileName !== "komodod") {
            this.error = this.error
              ? this.error + `The file's name should be "komodod". `
              : `The file's name should be "komodod". `;
          }
          if (this.fileSize === 0) {
            this.error = this.error
              ? this.error + `The file's size should not be zero. `
              : `The file's size should not be zero. `;
          }
        }
      } else {
        this.errors = [];
      }
    },
  },
  methods: {
    clearError() {
      this.error = "";
    },
    async verifyShaSum() {
      try {
        const hash = await this.calcFileHash(this.filePath);
        this.shaSumMatches = hash === this.expectedShaSum;
        console.log(hash);
        console.log(
          `this.shaSumMatches = hash === this.expectedShaSum;: ${
            hash === this.expectedShaSum
          }`
        );
      } catch (error) {
        console.log(error);
      }
    },
    calcFileHash(filename, algorithm = "sha256") {
      return new Promise((resolve, reject) => {
        const shasum = crypto.createHash(algorithm);
        try {
          const s = fs.ReadStream(filename);
          s.on("data", function (data) {
            shasum.update(data);
          });
          // making digest
          s.on("end", function () {
            const hash = shasum.digest("hex");
            return resolve(hash);
          });
        } catch (error) {
          return reject(new Error("calc fail"));
        }
      });
    },
  },
};
</script>

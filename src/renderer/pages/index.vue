<template>
  <v-row justify="center">
    <v-col cols="auto">
      <v-card min-width="1300" min-height="100" raised>
        <v-toolbar dense>
          <v-toolbar-title>Control</v-toolbar-title><v-spacer />
        </v-toolbar>
        <v-container fluid>
          <v-text-field
            v-model="dummy"
            prepend-icon="mdi-account-outline"
            :disabled="true"
            label="Pubkey/Address"
          ></v-text-field>
          <v-text-field
            v-model="wifPrivKeySeed"
            :append-icon="showWif ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showWif ? 'text' : 'password'"
            prepend-icon="mdi-key-outline"
            :disabled="true"
            label="WIF/PrivateKey/Seed Words"
            outlined
            @click:append="showWif = !showWif"
          ></v-text-field>

          <v-card-actions>
            <v-spacer />
            <v-btn
              color="error"
              :loading="calcFileHashIsRunning"
              @click="launchSmartChain"
            >
              <v-icon>mdi-stop-circle-outline</v-icon>
              <span>&nbsp;Stop</span>
            </v-btn>
            <v-btn
              color="success"
              :loading="calcFileHashIsRunning"
              @click="launchSmartChain"
            >
              <v-icon>mdi-rocket-outline</v-icon>
              <span>&nbsp;Launch</span>
            </v-btn>
            <v-spacer />
          </v-card-actions>
        </v-container>
      </v-card>
    </v-col>
    <v-col cols="auto">
      <v-card width="450" height="600" raised>
        <v-toolbar dense>
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
                  <v-icon v-else color="error">mdi-lock-open-variant </v-icon>
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

        <v-container fluid>
          <v-file-input
            v-model="chosenFile"
            label="Click here to select the Komodo Daemon"
            outlined
            prepend-icon="mdi-server-network"
            :disabled="komododSelected"
            :error-messages="error"
            @click="clearError"
            @click:clear="clearError"
          />
          <v-card min-height="100">
            <v-card-text>
              <blockquote v-if="fileIsValid">
                The path of the selected Komodo Daemon is
                <b>{{ chosenFile.path }}</b>
              </blockquote>
            </v-card-text>
          </v-card>
        </v-container>
        <v-toolbar dense>
          <v-toolbar-title>Verify Authenticity (Optional)</v-toolbar-title
          ><v-spacer />
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

        <v-container fluid>
          <v-text-field
            v-model="expectedShaSum"
            prepend-icon="mdi-fingerprint"
            :disabled="expectedShaSumIsDisabled"
            label="Expected SHASUM"
          ></v-text-field>
          <v-text-field
            v-model="signerPubkey"
            prepend-icon="mdi-card-account-details"
            :disabled="true"
            label="Signer's Pubkey (TBD)"
          ></v-text-field>
          <v-text-field
            v-model="expectedSignature"
            prepend-icon="mdi-draw"
            :disabled="true"
            label="Expected Signature (TBD)"
          ></v-text-field>

          <v-card-actions>
            <blockquote v-if="displayShaSumResult">
              The SHA256 checksum
              {{ shaSumMatches ? "matches" : "doesn't match" }}
            </blockquote>
            <v-spacer />
            <v-btn
              :disabled="verifyButtonDisabled"
              color="indigo"
              :loading="calcFileHashIsRunning"
              @click="verifyShaSum"
            >
              <v-icon>mdi-shield-check</v-icon>
              <span>&nbsp;Verify</span>
            </v-btn>
          </v-card-actions>
        </v-container>
      </v-card>
    </v-col>

    <v-col cols="auto">
      <v-card width="900" min-height="600" raised>
        <v-toolbar dense>
          <v-toolbar-title>Input Launch Parameters</v-toolbar-title><v-spacer />
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-switch
                v-model="launchParamsLocked"
                :disabled="!komododSelected"
                inset
                hide-details
                v-on="on"
                ><template v-slot:prepend>
                  <v-icon v-if="launchParamsLocked" color="success"
                    >mdi-lock-check
                  </v-icon>
                  <v-icon v-else color="error">mdi-lock-open-variant </v-icon>
                </template>
              </v-switch>
            </template>
            <span>{{
              launchParamsLocked
                ? "Click the switch to modify the Launch Parameters"
                : "Click the switch to CONFIRM your input"
            }}</span>
          </v-tooltip>
        </v-toolbar>
        <v-container fluid>
          <v-textarea
            v-model="launchParametersInput"
            auto-grow
            clearable
            outlined
            label="Launch Parameters"
            :disabled="launchParamsInputDisabled"
          >
          </v-textarea>

          <v-row>
            <v-col cols="auto">
              <v-card width="425" height="350" raised>
                <v-toolbar dense>
                  <v-toolbar-title>Additional Config</v-toolbar-title
                  ><v-spacer />
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-checkbox
                        v-model="expectedConstantsEnabled"
                        hide-details
                        :disabled="!launchParamsLocked"
                        v-on="on"
                      >
                      </v-checkbox>
                    </template>
                    <span>{{
                      expectedConstantsEnabled
                        ? "Click to  Disable"
                        : "Click to Enable"
                    }}</span>
                  </v-tooltip>
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-switch
                        v-model="expectedConstantsLocked"
                        :disabled="expectedConstantsSwitchIsDisabled"
                        inset
                        hide-details
                        v-on="on"
                        ><template v-slot:prepend>
                          <v-icon v-if="expectedConstantsLocked" color="success"
                            >mdi-lock-check
                          </v-icon>
                          <v-icon v-else color="error"
                            >mdi-lock-open-variant
                          </v-icon>
                        </template>
                      </v-switch>
                    </template>
                    <span>{{
                      expectedConstantsLocked
                        ? "Click the switch to modify the Expected Constants"
                        : "Click the switch to CONFIRM your input"
                    }}</span>
                  </v-tooltip>
                </v-toolbar>
                <v-container fluid>
                  <v-textarea
                    v-model="dummy"
                    prepend-icon="mdi-folder"
                    label="Blockchain Data Directory"
                    :disabled="true"
                    row-height="20"
                    outlined
                    auto-grow
                  ></v-textarea>
                  <v-row>
                    <v-col>
                      <v-checkbox
                        v-model="dummy"
                        prepend-icon="mdi-swap-vertical"
                        hide-details
                        label="dexp2p"
                      >
                      </v-checkbox>
                    </v-col>
                    <v-col>
                      <v-checkbox
                        v-model="dummy"
                        prepend-icon="mdi-wallet-outline"
                        hide-details
                        label="testnode"
                      >
                      </v-checkbox>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-checkbox
                        v-model="dummy"
                        prepend-icon="mdi-file-cabinet"
                        hide-details
                        label="reindex"
                      >
                      </v-checkbox>
                    </v-col>
                    <v-col>
                      <v-checkbox
                        v-model="dummy"
                        prepend-icon="mdi-wallet-outline"
                        hide-details
                        label="rescan"
                      >
                      </v-checkbox>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </v-col>
            <v-col cols="auto">
              <v-card width="425" height="350" raised>
                <v-toolbar dense>
                  <v-toolbar-title>Expected constants</v-toolbar-title
                  ><v-spacer />
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-checkbox
                        v-model="expectedConstantsEnabled"
                        hide-details
                        :disabled="!launchParamsLocked"
                        v-on="on"
                      >
                      </v-checkbox>
                    </template>
                    <span>{{
                      expectedConstantsEnabled
                        ? "Click to  Disable"
                        : "Click to Enable"
                    }}</span>
                  </v-tooltip>
                  <v-tooltip top>
                    <template v-slot:activator="{ on }">
                      <v-switch
                        v-model="expectedConstantsLocked"
                        :disabled="expectedConstantsSwitchIsDisabled"
                        inset
                        hide-details
                        v-on="on"
                        ><template v-slot:prepend>
                          <v-icon v-if="expectedConstantsLocked" color="success"
                            >mdi-lock-check
                          </v-icon>
                          <v-icon v-else color="error"
                            >mdi-lock-open-variant
                          </v-icon>
                        </template>
                      </v-switch>
                    </template>
                    <span>{{
                      expectedConstantsLocked
                        ? "Click the switch to modify the Expected Constants"
                        : "Click the switch to CONFIRM your input"
                    }}</span>
                  </v-tooltip>
                </v-toolbar>
                <v-container fluid>
                  <v-row>
                    <v-col>
                      <v-text-field
                        v-model="expectedMagicNumber"
                        prepend-icon="mdi-check"
                        :disabled="expectedConstantTextFieldInputIsDisabled"
                        label="Magic Number"
                      ></v-text-field>
                    </v-col>
                    <v-col>
                      <v-text-field
                        v-model="expectedP2Pport"
                        prepend-icon="mdi-lan-connect"
                        :disabled="expectedConstantTextFieldInputIsDisabled"
                        label="P2P Port"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-text-field
                        v-model="expectedRPCport"
                        prepend-icon="mdi-remote-desktop"
                        :disabled="expectedConstantTextFieldInputIsDisabled"
                        label="RPC Port"
                      ></v-text-field>
                    </v-col>
                    <v-col>
                      <v-text-field
                        v-model="expectedVersion"
                        prepend-icon="mdi-alpha-v-box"
                        :disabled="expectedConstantTextFieldInputIsDisabled"
                        label="version"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-text-field
                        v-model="expectedKMDversion"
                        prepend-icon="mdi-alpha-k-box"
                        :disabled="expectedConstantTextFieldInputIsDisabled"
                        label="KMDversion"
                      ></v-text-field>
                    </v-col>
                    <v-col>
                      <v-text-field
                        v-model="expectedProtocolVersion"
                        prepend-icon="mdi-alpha-p-box"
                        :disabled="expectedConstantTextFieldInputIsDisabled"
                        label="protocolversion"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
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
      calcFileHashIsRunning: false,
      displayShaSumResult: false,
      launchParametersInput: "",
      cleanedLaunchString: "",
      launchParamsLocked: false,
      expectedConstantsEnabled: false,
      expectedMagicNumber: "",
      expectedP2Pport: null,
      expectedRPCport: null,
      expectedVersion: null,
      expectedKMDversion: null,
      expectedProtocolVersion: null,
      keypairLocked: false,
      displayLaunchResult: false,
      expectedConstantsLocked: false,
      showWif: false,
      wifPrivKeySeed: "",
      dummy: "",
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
    verifyAuthTextFieldsDisabled() {
      return !(this.komododSelected && this.verifyAuthenticityEnabled);
    },
    verifyButtonDisabled() {
      return this.verifyAuthTextFieldsDisabled || this.calcFileHashIsRunning;
    },
    expectedShaSumIsDisabled() {
      return this.verifyAuthTextFieldsDisabled || this.calcFileHashIsRunning;
    },
    launchParamsInputDisabled() {
      return !this.komododSelected || this.launchParamsLocked;
    },
    expectedConstantsTextFieldsDisabled() {
      return !(this.launchParamsLocked && this.expectedConstantsEnabled);
    },
    expectedConstantsSwitchIsDisabled() {
      return this.expectedConstantsTextFieldsDisabled || this.daemonConnected;
    },
    expectedConstantTextFieldInputIsDisabled() {
      return (
        this.expectedConstantsTextFieldsDisabled ||
        this.daemonConnected ||
        this.expectedConstantsLocked
      );
    },
    daemonConnected() {
      return this.$store.state.daemonConnected;
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
    expectedShaSum(val) {
      this.displayShaSumResult = false;
    },
    launchParametersInput(val) {
      try {
        // cleaning it up
        if (!val) {
          return;
        }
        val = val.includes("-dexp2p=2") ? val : val + "-dexp2p=2";
        let array = val.split(" ");
        array = array.map((str) =>
          str.length === 1 || str.includes("komodod") || str.includes("-pubkey")
            ? ""
            : str
        );

        this.cleanedLaunchString = array.join(" ");
      } catch (error) {
        this.snackbarError = error;
        this.snackbar = true;
        // console.log(error);
      }
    },
  },
  methods: {
    clearError() {
      this.error = "";
    },
    async verifyShaSum() {
      try {
        this.calcFileHashIsRunning = true;
        const hash = await this.calcFileHash(this.filePath);
        this.calcFileHashIsRunning = false;
        this.shaSumMatches = hash === this.expectedShaSum;
        this.displayShaSumResult = true;
      } catch (error) {
        this.snackbarError = error;
        this.snackbar = true;
        // console.log(error);
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
    launchSmartChain() {},
  },
};
</script>

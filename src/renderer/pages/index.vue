<template>
  <v-row justify="center" dense>
    <v-row justify="center" dense>
      <v-col cols="auto">
        <v-card min-width="1300" min-height="100" raised>
          <v-toolbar dense>
            <v-toolbar-title>Control</v-toolbar-title><v-spacer />
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <v-switch
                  v-model="controlLocked"
                  :disabled="controlSwitchIsDisabled"
                  inset
                  hide-details
                  v-on="on"
                  ><template v-slot:prepend>
                    <v-icon v-if="controlLocked" color="success"
                      >mdi-lock-check
                    </v-icon>
                    <v-icon v-else color="error">mdi-lock-open-variant </v-icon>
                  </template>
                </v-switch>
              </template>
              <span>{{
                controlLocked
                  ? "Click the switch to select a DIFFERENT Key Pair"
                  : "Click the switch to CONFIRM your selection"
              }}</span>
            </v-tooltip>
          </v-toolbar>
          <v-container fluid>
            <v-text-field
              v-model="pubkeyAddress"
              prepend-icon="mdi-account-outline"
              :disabled="controlInputIsDisabled"
              label="Pubkey/Address"
            ></v-text-field>
            <v-text-field
              v-model="wifPrivKeySeed"
              :append-icon="showWif ? 'mdi-eye' : 'mdi-eye-off'"
              :type="showWif ? 'text' : 'password'"
              prepend-icon="mdi-key-outline"
              :disabled="controlInputIsDisabled"
              label="WIF/PrivateKey/Seed Words"
              outlined
              @click:append="showWif = !showWif"
            ></v-text-field>

            <v-card-actions>
              <v-spacer />
              <v-btn
                color="error"
                :disabled="stopButtonIsDisabled"
                :loading="calcFileHashIsRunning"
                @click="launchSmartChain"
              >
                <v-icon>mdi-stop-circle-outline</v-icon>
                <span>&nbsp;Stop</span>
              </v-btn>
              <v-btn
                color="success"
                :disabled="launchButtonIsDisabled"
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
    </v-row>

    <v-row justify="center" dense>
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
            <v-toolbar-title>Input Launch Parameters</v-toolbar-title
            ><v-spacer />
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
                          v-model="additionalConfigEnabled"
                          hide-details
                          :disabled="!launchParamsLocked"
                          v-on="on"
                        >
                        </v-checkbox>
                      </template>
                      <span>{{
                        additionalConfigEnabled
                          ? "Click to  Disable"
                          : "Click to Enable"
                      }}</span>
                    </v-tooltip>
                    <v-tooltip top>
                      <template v-slot:activator="{ on }">
                        <v-switch
                          v-model="additionalConfigLocked"
                          :disabled="additionalConfigSwitchIsDisabled"
                          inset
                          hide-details
                          v-on="on"
                          ><template v-slot:prepend>
                            <v-icon
                              v-if="additionalConfigLocked"
                              color="success"
                              >mdi-lock-check
                            </v-icon>
                            <v-icon v-else color="error"
                              >mdi-lock-open-variant
                            </v-icon>
                          </template>
                        </v-switch>
                      </template>
                      <span>{{
                        additionalConfigLocked
                          ? "Click the switch to modify the Expected Constants"
                          : "Click the switch to CONFIRM your input"
                      }}</span>
                    </v-tooltip>
                  </v-toolbar>
                  <v-container fluid>
                    <v-textarea
                      v-model="blockDataDir"
                      prepend-icon="mdi-folder"
                      label="Blockchain Data Directory"
                      :disabled="additionalConfigInputIsDisabled"
                      row-height="20"
                      outlined
                      auto-grow
                    ></v-textarea>
                    <v-row>
                      <v-col>
                        <v-checkbox
                          v-model="dexp2pEnabled"
                          prepend-icon="mdi-swap-vertical"
                          :disabled="additionalConfigInputIsDisabled"
                          hide-details
                          label="dexp2p"
                        >
                        </v-checkbox>
                      </v-col>
                      <v-col>
                        <v-checkbox
                          v-model="testNodeEnabled"
                          prepend-icon="mdi-flask-outline"
                          :disabled="additionalConfigInputIsDisabled"
                          hide-details
                          label="testnode"
                        >
                        </v-checkbox>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <v-checkbox
                          v-model="reindexEnabled"
                          prepend-icon="mdi-file-cabinet"
                          :disabled="additionalConfigInputIsDisabled"
                          hide-details
                          label="reindex"
                        >
                        </v-checkbox>
                      </v-col>
                      <v-col>
                        <v-checkbox
                          v-model="rescanEnabled"
                          prepend-icon="mdi-wallet-outline"
                          :disabled="additionalConfigInputIsDisabled"
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
                            <v-icon
                              v-if="expectedConstantsLocked"
                              color="success"
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
    </v-row>

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
      additionalConfigEnabled: false,
      expectedMagicNumber: "",
      expectedP2Pport: null,
      expectedRPCport: null,
      expectedVersion: null,
      expectedKMDversion: null,
      expectedProtocolVersion: null,
      controlLocked: false,
      displayLaunchResult: false,
      expectedConstantsLocked: false,
      additionalConfigLocked: false,
      showWif: false,
      wifPrivKeySeed: "",
      pubkeyAddress: "",
      blockDataDir: "",
      dexp2pEnabled: "",
      testNodeEnabled: "",
      rescanEnabled: "",
      reindexEnabled: "",
      additionalConfigString: "",
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
    expectedConstantsSwitchIsDisabled() {
      return (
        !this.launchParamsLocked ||
        !this.expectedConstantsEnabled ||
        this.daemonConnected
      );
    },
    additionalConfigSwitchIsDisabled() {
      return (
        !this.launchParamsLocked ||
        !this.additionalConfigEnabled ||
        this.daemonConnected
      );
    },
    controlSwitchIsDisabled() {
      return !this.launchParamsLocked || this.daemonConnected;
    },
    expectedConstantTextFieldInputIsDisabled() {
      return (
        this.expectedConstantsSwitchIsDisabled || this.expectedConstantsLocked
      );
    },
    additionalConfigInputIsDisabled() {
      return (
        this.additionalConfigSwitchIsDisabled || this.additionalConfigLocked
      );
    },
    controlInputIsDisabled() {
      return this.controlSwitchIsDisabled || this.controlLocked;
    },
    stopButtonIsDisabled() {
      return !this.controlInputIsDisabled;
    },
    launchButtonIsDisabled() {
      return !this.controlInputIsDisabled;
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
    additionalConfigLocked(val) {
      if (val) {
        let str = "";
        str = this.blockDataDir ? str + ` -datadir=${this.blockDataDir} ` : str;
        str = this.dexp2pEnabled ? str + ` -dexp2p=2 ` : str;
        str = this.testNodeEnabled ? str + ` -testnode=1 ` : str;
        str = this.reindexEnabled ? str + ` -reindex=1 ` : str;
        str = this.rescanEnabled ? str + ` -rescan=1 ` : str;
        console.log(str);
        this.additionalConfigString = str;
      } else {
        this.additionalConfigString = "";
      }
    },
    controlLocked(val) {
      if (val) {
        this.showWif = false;
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

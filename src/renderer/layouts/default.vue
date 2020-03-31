<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer" app clipped expand-on-hover>
      <v-list>
        <v-list-item
          v-for="item in navDrawerItems"
          :key="item.title"
          :to="item.nuxtLink"
          nuxt
        >
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-system-bar app window light :color="systemBar.colour">
      <v-spacer />
      <div>
        <v-icon>{{ systemBar.daemonConnIcon }}</v-icon>
        <span>{{ systemBar.daemonConnText }}</span>
      </div>
    </v-system-bar>

    <v-app-bar app clipped-left>
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>DEXP2P - Publish - Download</v-toolbar-title>
    </v-app-bar>

    <v-content>
      <v-container class="fill-height" align-center fluid>
        <nuxt />
      </v-container>
    </v-content>

    <v-snackbar
      :value="globalSnackbar"
      :color="globalSnackbarColor"
      bottom
      right
      multi-line
    >
      {{ globalSnackbarError }}
      <v-btn text @click="setGlobalSnackbarFalse">
        Close
      </v-btn>
    </v-snackbar>

    <v-footer app>
      <span>&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</template>

<script>
import Vue from "vue";
import moment from "moment";
Vue.prototype.$moment = moment;

export default {
  props: {
    // source: String
  },
  data() {
    return {
      sysBarColor: "success", // #FFEA00 #FF5722
      navDrawerItems: [
        { title: "Dashboard", icon: "mdi-view-dashboard", nuxtLink: "/" },
        { title: "Publish", icon: "mdi-arrow-up-bold", nuxtLink: "/publisher" },
        {
          title: "Download",
          icon: "mdi-arrow-down-bold",
          nuxtLink: "/downloader",
        },
        {
          title: "Settings",
          icon: "mdi-cog-outline",
          nuxtLink: "/settings",
        },
      ],
      drawer: true,
    };
  },
  computed: {
    systemBar() {
      const connected = {
        colour: "success",
        daemonConnText: "Connected to the daemon",
        daemonConnIcon: "mdi-power-plug",
      };
      const notConnected = {
        colour: "#FFEA00",
        daemonConnText: "Not Connected to the daemon",
        daemonConnIcon: "mdi-power-plug-off",
      };
      return this.daemonConnected ? connected : notConnected;
    },
    daemonConnected() {
      return this.$store.state.daemonConnected;
    },
    globalSnackbar() {
      return this.$store.state.globalSnackbar;
    },
    /*
    globalSnackbar: {
      get: (vm) => {
        return this.$store.state.globalSnackbar;
      },
      
      set: (newValue) => {
        this.$store.commit("SET_GLOBAL_SNACKBAR", { status: newValue });
      },
     
    }, */
    globalSnackbarError() {
      return this.$store.state.globalSnackbarError;
    },
    globalSnackbarColor() {
      return this.$store.state.globalSnackbarColor;
    },
  },

  created() {
    this.$vuetify.theme.dark = true;
  },
  mounted() {
    this.$store.dispatch("initDaemonConnection");
    this.$store.dispatch("setSysInfo");
    this.$store.dispatch("initDbConn");
  },
  beforeDestroy() {
    this.$store.dispatch("endDaemonConnection");
  },
  methods: {
    setGlobalSnackbarFalse() {
      this.$store.commit("SET_GLOBAL_SNACKBAR", { globalSnackbar: false });
    },
  },
};
</script>

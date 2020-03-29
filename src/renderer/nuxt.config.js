/**
 * By default, Nuxt.js is configured to cover most use cases.
 * This default configuration can be overwritten in this file
 * @link {https://nuxtjs.org/guide/configuration/}
 */

module.exports = {
  mode: "spa", // or 'universal'
  head: {
    title: "dexp2p-fileshare",
  },
  loading: false,
  plugins: [{ ssr: true, src: "@/plugins/icons.js" }],
  buildModules: [],
  modules: ["@nuxtjs/axios", "@nuxtjs/vuetify"],
};

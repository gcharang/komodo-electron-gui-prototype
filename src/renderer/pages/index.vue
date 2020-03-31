<template>
  <v-row justify="center">
    <v-card />
    <v-col cols="auto">
      <v-card width="600" height="350" raised>
        <v-card-title>Dashboard</v-card-title>

        <v-card-text>
          <p>{{ $moment.now() }}</p>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
export default {
  data() {
    return { test: null };
  },
  methods: {
    async getinfo() {},
  },
};
</script>

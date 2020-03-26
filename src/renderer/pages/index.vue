<template>
  <v-card>
    <v-card-title @click="getinfo">Dashboard</v-card-title>
    <span>{{JSON.stringify(test)}}</span>
  </v-card>
</template>

<script>
import SmartChain from "node-komodo-rpc";
const chain = new SmartChain({
  name: "sahipsiz"
});
const rpc = chain.rpc();
export default {
  data() {
    return { test: "" };
  },
  methods: {
    getinfo: async function() {
      let resp = await rpc.getnewaddress();
      this.test = resp;
    }
  }
};
</script>
    
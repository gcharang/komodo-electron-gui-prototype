<template>
  <v-row justify="center">
    <v-card />
    <v-col cols="auto">
      <v-card width="600" height="300" raised>
        <v-card-title @click="getinfo">Dashboard</v-card-title>

        <v-card-text>
          <p>{{ JSON.stringify(test) }}</p>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
import SmartChain from 'node-komodo-rpc'
const chain = new SmartChain({
  name: 'sahipsiz'
})
const rpc = chain.rpc()
export default {
  data () {
    return { test: null }
  },
  methods: {
    async getinfo () {
      const resp = await rpc.getinfo()
      this.test = resp
    }
  }
}
</script>

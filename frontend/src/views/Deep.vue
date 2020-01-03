<template>
  <div class="ui paddedSides" id="main">
    
    <div v-if="admin" class="ui segment">
      <h3>State manipulation</h3>
      <h4>Credentials</h4>
      Loaded: {{state.credentials.loaded}}

      
    </div>
    <div v-else>
      <h3>Access Denied</h3>
    </div>
  </div>
</template>

<script>
import store from "../store";
import Header from "../components/Header.vue";

export default {
  mounted: async () => {
    store.commit("globalView", "Dev tooling");
  },
  computed: {
    state() {
      return this.$store.state
    },
    admin() {
      if (this.$store.state.credentials.role == "Admin"){
        return true;
      }
    }
  }
}
</script>

<style>

</style>

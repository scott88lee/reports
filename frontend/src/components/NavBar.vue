<template>
  <div class="ui top fixed menu">
    <a id="menu" class="icon item">
      <i class="sidebar icon"></i>
    </a>
    <router-link to="/" class="item">
      <img src="assets/logo.png">
    </router-link>
    <a class="item" href="#top">{{ view }}</a>
    <!-- <a class="item" @click="changeRole">Role: {{role}}</a> -->
    <div class="right floated menu">
			<router-link class="item" :to="{ name: 'logout' }">Logout</router-link>
		</div>
  </div>
</template>

<script>
import store from "../store";


export default {
  computed: {
    role() {
      return this.$store.state.credentials.role;
    },
    view() {
      return this.$store.state.globals.view;
    }
  },
  methods: {
    changeRole() {
      if (
        this.$store.state.credentials.role == "merchant" ||
        this.$store.state.credentials.role == "Merchant"
      ) {
        store.commit("role", "Admin");
      } else if (
        this.$store.state.credentials.role == "Admin" ||
        this.$store.state.credentials.role == "Admin"
      ) {
        store.commit("role", "Merchant");
      }
    },
    logout() {
      const vue = this;
      // supply a callback function to doLogout for redirect
      vue.$sso.doLogout(function() {
          vue.$router.push({ name: 'home' });
      });
    }
  }
};
</script>

<style>
</style>

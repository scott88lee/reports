<template>
  <div id="app">
    <NavBar />

    <div id="sidebar-context" class="ui pushable">
      <SideBar />

      <div class="pusher">
        <router-view/>
      </div>

    </div>
  </div>
</template>

<script>
import axios from "axios";
import store from "./store";
import SideBar from "./components/SideBar.vue";
import NavBar from "./components/NavBar.vue";


export default {
  name: "app",
  components: {
    SideBar,
    NavBar
  },
  mounted(){
    console.log('app mounted');
  }
}
</script>

<style>
body {
  background-color: #fafafa;
}

.ui.fluid.container {
    padding-top: 60px;
    padding-left: 20px;
    padding-right: 20px;
}

.dimmer {
    background-color: rgba(221, 221, 221, 0) !important;
}

#main {
  padding-top: 50px;
  min-height: 100vh;
}

.paddedSides {
  padding-left: 10px;
  width: 80%;
}
</style>
<template>
  <div class="ui fluid container">
    <div class="ui grid">
      <div class="fourteen wide computer sixteen wide tablet sixteen wide mobile blurring column">
        <Header />
        <AttachedTab v-if="loaded" v-bind:data="tabs"/>
        <MonthSearch />
        <Footer />
      </div>
    </div>
  </div>
</template>

<style scoped>
#MonthSearch {
  min-height: 80vh;
}
</style>

<script>
import axios from "axios";
import store from "../store";
import Header from "../components/Header.vue";
import Footer from "../components/Footer.vue";
import MonthSearch from "../components/billing/MonthSearch.vue";
import AttachedTab from "../components/billing/AttachedTab.vue";

export default {
  components: {
    Header,
    Footer,
    MonthSearch,
    AttachedTab
  },
	mounted: function() {
    //set Global View to Billing
    store.commit("globalView", "Billing Report");
    //Gets userID
    if (this.$store.state.credentials.loaded == false) {
      this.loadCredentials();
    }
  },
  computed: {
    loaded(){
      return this.$store.state.billing.loaded;
    },
    tabs() {
      let tabs = [];

      if (this.$store.state.billing.data) {
        let arr = this.$store.state.billing.data;

        for (let i = 0; i < arr.length; i++) {
          tabs.push(arr[i].currency);
        }
        return tabs;
      } else {
        return [];
      }
    },
  },
  methods: {
    loadCredentials() {
      let gid = this.$sso.getSSOData().rdp_groupID;
      store.commit('groupId', gid);

      return new Promise(function(resolve, reject) {
        let baseURL = process.env.VUE_APP_ROOT_API;

        axios.get(baseURL + "/auth?group=" + gid).then(res => {
          let temp = res.data;
          temp.push(
            {"merchantId":"90d587c6-ba1f-494e-a996-46b1559d811c","merchantName":"Demo Merchant for Transactions"},{"merchantId":"D41D8CD98F00B204E9800998ECF8427E","merchantName":"Demo Merchant Billing & Funding"}
          ) //HARDCODED MERCHANT CREDENTIALS
          console.log(res.data);

          store.commit("credentialsLoaded", true);
          store.commit('mData', res.data);
          store.commit('merchantId', res.data[0].merchantId)
          store.commit('merchantName', res.data[0].merchantName)
          resolve(true);
        });
      });
    },
  },
}
</script>

<style>
</style>
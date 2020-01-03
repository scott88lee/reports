<template>
  <div class="ui top attached stacked segment">
    <div class="ui two column stackable grid">
      <div v-if="loaded" class="row">
        <div class="twelve wide column">
          <h3 v-bind:title="merchantId">{{ merchantName }}</h3>
        </div>
        <div class="four wide column">
          <div v-if="admin">
            <h3>Admin functions: (TBC)</h3>
            <input>
            &nbsp;<button @click="ssod">Test 1</button>
            &nbsp;<button>Test 2</button>
          </div>
          <div v-else>
            <select class="ui fluid search selection dropdown" id="mSelect" @change="emitChange($event)">
              <option v-for="(merchant,key) in mData" :key=key :value="merchant.merchantId">{{ merchant.merchantName }}</option>
            </select>
          </div>
        </div>
      </div>
      <div v-else class="row">
        <div class="column">
          <div class="ui active inline loader">
          </div>
        </div>
        <div class="column">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import store from "../store"

export default {
  data() {
    return {
      companyselected: '',
    }
  },
  computed: {
		admin(){ //Implement role checking for Deep link
			if (this.$store.state.credentials.role == 'admin' || this.$store.state.credentials.role == "Admin" ){
				return true;
			} else {
				return false;
			}
    },
    merchantName() {
      return this.$store.state.credentials.merchantName;
    },
    merchantId(){
      return this.$store.state.credentials.merchantId;
    },
    loaded(){
      return this.$store.state.credentials.loaded;
    },
    mData(){
      return this.$store.state.credentials.mData;
    }
  },
  methods: {
    setSelected: function (val) {
      $('.ui.dropdown').dropdown('set selected', val);
    },
    ssod(){
      let x = this.$sso.getSSOData();
      console.log(x);
      console.log(x.rdp_groupID);
    },
    emitChange(e){
      console.log(e.target.value);

      for(let i in this.$store.state.credentials.mData){
        if (e.target.value == this.$store.state.credentials.mData[i].merchantId){
          store.commit('merchantName', this.$store.state.credentials.mData[i].merchantName)
        }
      }
      store.commit('merchantId', e.target.value)

      //DR-33
      store.commit('billingKey', null);
      store.commit('billingResults', null);
      store.commit('fundingKey', null);
      store.commit('fundingResults', null);
      store.commit('txKey', null);
      store.commit('txResults', null);
      store.commit('billingLoaded', false);
      store.commit('fundingLoaded', false);
      store.commit('txLoaded', false);
    }
  },
  mounted: function(){
    $('.ui.dropdown').dropdown();
    this.setSelected(this.merchantId);
  },
  updated () {
    this.setSelected(this.merchantId);
  }
};
</script>

<style>
</style>

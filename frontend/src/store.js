import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    credentials: {
      loaded: false,
      role: "Merchant", //Merchant or Admin
      groupId: "",
      merchantId: "",
      merchantName: "",
      mData: undefined,
      token: ""
    },
    transactions: {
      loaded: false,
      data: "",
      key: ""
    },
    funding: {
      loaded: false,
      tabIndex: 0,
      data: "",
      key: ""
    },
    billing: {
      loaded: false,
      data: "",
      tabIndex: 0,
      key: ""
    },
    globals: {
      view: "",
      dataKey: "",
      freeform : ""
    }
  },
  mutations: {  //SETTERS
    setFreeForm(state, data){
      state.globals.freeform = data;
    },
    token(state, data){
      state.credentials.token = data;
    },
    role(state, role) {
      state.credentials.role = role;
    },
    merchantId(state, id) {
      state.credentials.merchantId = id;
    },
    merchantName(state, name) {
      state.credentials.merchantName = name;
    },
    groupId(state, id) {
      state.credentials.groupId = id;
    },
    mData(state, data) {
      state.credentials.mData = data;
    },
    credentialsLoaded(state, bool) {
      state.credentials.loaded = bool;
    },
    globalView(state, view) {
      state.globals.view = view;
    },
    dataKey(state, key) {
      state.globals.dataKey = key;
    },
    billingKey(state, key) {
      state.billing.key = key;
    },
    billIndex(state, int) {
      state.billing.tabIndex = int;
    },
    fundIndex(state, int) {
      state.funding.tabIndex = int;
    },
    fundingKey(state, key) {
      state.funding.key = key;
    },
    txResults(state, results) {
      state.transactions.data = results;
    },
    txKey(state, key){
      state.transactions.key = key;
    },
    billingResults(state, results) {
      state.billing.data = results;
    },
    fundingResults(state, results) {
      state.funding.data = results;
    },
    txLoaded(state, bool) {
      state.transactions.loaded = bool;
    },
    billingLoaded(state, bool) {
      state.billing.loaded = bool;
    },
    fundingLoaded(state, bool) {
      state.funding.loaded = bool;
    }
  }
});

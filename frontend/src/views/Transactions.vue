<template>
  <div class="ui fluid container">
    <div id="main-grid" class="ui grid">
      <div class="fourteen wide computer sixteen wide tablet sixteen wide mobile blurring column">
        <Header/>

        <div class="ui attached segment">
          <TxSearch v-on:trigger-load="load" v-on:trigger-csv="csvDL"/>
          <!-- listening on child event -->
        </div>

        <div id="main-segment" class="ui attached segment no padding">
          <div v-if="dataEmpty">
            <h3 class="ui center aligned header">&nbsp; No records found.</h3>
          </div>
          <TxTable v-if="loaded"/>
          <PlaceHolder v-if="loading"/>
          <csvModal />
        </div>
        <Footer/>
      </div>
    </div>
  </div>
</template>

<style scoped>
  @import '/css/calendar.min.css';

  .no.padding {
    padding: 0 !important;
  }

  #main-segment {
    min-height: 59vh;
  }
</style>


<script>
import csvModal from "../components/CSVModal.vue";
import PlaceHolder from "../components/PlaceHolder.vue";
import TxSearch from "../components/transactions/TxSearch.vue";
import TxTable from "../components/transactions/TxTable.vue";
import Footer from "../components/Footer.vue";
import Header from "../components/Header.vue";
import moment from 'moment';

import axios from "axios";
import store from "../store";

export default {
  components: {
    Header,
    TxSearch,
    TxTable,
    csvModal,
    PlaceHolder,
    Footer
  },
  data() {
    return {
      loading: false,
      dataEmpty: false,
      errorMsg: null
    };
  },
  computed: {
    loaded() {
      return this.$store.state.transactions.loaded;
    }
  },
  mounted: async function() {
    store.commit("globalView", "Transaction List");

    //Gets userID
    if (this.$store.state.credentials.loaded == false) {
      let _ = await this.loadCredentials();
      if (this.$store.state.transactions.loaded == false) {
        this.load(this.monthStart(), this.monthToDate());
      }
    }
  },
  methods: {
    async load(startDate, endDate) {
      startDate += 'T00:00:00Z'
      endDate += 'T23:59:00Z'

      //Clears the display and error message
      store.commit("txLoaded", false);
      this.errorMsg = null;
      //Triggers the placeholder
      this.loading = true;
      this.dataEmpty = false;

      //Makes ATHENA query, awaiting S3 file reference
      let key = await this.generate(
        this.$store.state.credentials.merchantId,
        startDate,
        endDate
      )

      //Getting S3 contents
      let rawData = undefined;
      let count = 1;
      do {
        try {
          // ZZZZZ
          console.log(await this.sleep(500));
          console.log("Fetching: " + count);
          rawData = await this.retrieve(key);

          let json = this.csv2JSON(rawData);
          console.log(json.length);
          if (json.length > 0){
            let res = this.groupTx(json);

            //Commiting to Global Store
            store.commit("txLoaded", true);
            store.commit("txKey", key);
            store.commit("txResults", res);
          } else {
            this.dataEmpty = true;
            store.commit("txLoaded", false);
          }
          this.loading = false;

        }
        catch (err) {
          console.log("Error type: " + err);
          console.log("Retrying...");
          count++;
          if (count == 11) {
            console.log("Process timeout");
          }
        }
      } while (rawData == undefined && count < 11);
      console.log("Finally");
    },
    convertDate(dateString, offset) {
      let date = new Date(dateString);

      if (offset) {
        date.setDate(date.getDate() + offset);
      }

      let yyyy = date.getFullYear().toString();
      let mm = (date.getMonth() + 1).toString();
      let dd = date.getDate().toString();

      if (mm.length == 1) {
        mm = "0" + mm;
      }
      if (dd.length == 1) {
        dd = "0" + dd;
      }

      return yyyy + "-" + mm + "-" + dd;
    },
    timeOffset(str){
      let date = Date.parse(str)

      let d = new Date();
      let offset = d.getTimezoneOffset() * 60000;

      let x = date + offset;

      let y = new Date(x)

      return y
    },
    addOffset(str){
      let date = Date.parse(str);

      let d = new Date();
      let offset = d.getTimezoneOffset() * 60000;

      let x = date - offset;

      let y = new Date(x)

      return y
    },
    async csvDL(start, end) {
      console.log('TRIGGEREED!!!')
      //Clears the display and error message
      this.errorMsg = null;
      //Triggers the placeholder
      if (start == end) {
        var startDate = this.formatTime(this.timeOffset(start));
        var endDate = this.formatTime(this.timeOffset(this.convertDate(end, 1)));
      } else {
        var startDate = this.formatTime(this.timeOffset(start));
        var endDate = this.formatTime(this.timeOffset(end));
      }
      //Makes ATHENA query, awaiting S3 file reference
      let params = {
        db : "rdp_datalake_api3_frontend"
      }
      params.sql = "SELECT datetime AS transaction_date_time, transaction_id, merchant_id, account_id, order_id, merchant_reference, payment_method, last4 as last_4_digits, txn_amount AS transaction_amount, currency, payment_status, product, auth_code, eci, response_description AS response_code_description, ip_address from veritas WHERE merchant_id = '" + this.$store.state.credentials.merchantId + "' AND datetime >= '" + startDate + "' AND datetime <= '" + endDate + "';"
      //params.sql = "SELECT * FROM veritas;"
      axios.post(process.env.VUE_APP_ROOT_API + '/deep', JSON.stringify(params)).then(
        res => {
          console.log(res.data.key);

          axios
            .get(process.env.VUE_APP_ROOT_API + "/presign?key=" + res.data.key)
            .then(async res => {

              console.log(res.data);
              $("#csvModal").modal("show");
              document.getElementById('modalLink').href = res.data;

              console.log(await this.sleep(2500));
              document.getElementById('modalLink').click();
              //window.open(res.data);
            });
        });
    },
    generate(id, start, end) {
      return new Promise(function(resolve, reject) {
        let baseURL = process.env.VUE_APP_ROOT_API;
        axios
          .get(
            baseURL +
              "/transactions?generate=" +
              id +
              "&start=" +
              start +
              "&end=" +
              end
          )
          .then(res => {
            console.log(res.data.key);
            store.commit('txKey', res.data.key)
            resolve(res.data.key);
          })
          .catch(error => {
            console.log(error);
            reject(error);
          });
      });
    },
    monthStart(){
      let date = new Date();

      let yyyy = date.getFullYear();
      let mm = (date.getMonth()+1).toString();
      if (mm < 10){
        mm = '0' + mm;
      }

      return yyyy + '-' + mm + '-01T00:00:00Z';
    },
    monthToDate(){
      let date = new Date();

      let yyyy = date.getFullYear();
      let mm = (date.getMonth()+1).toString();
      if (mm < 10){
        mm = '0' + mm;
      }
      let dd = date.getDate().toString();
      if (dd.length == 1) {
        dd = '0'+ dd;
      }

      return yyyy + '-' + mm + '-' + dd + 'T00:00:00Z';
    },
    sleep(waitMsec) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve("Waited...");
        }, waitMsec);
      });
    },
    formatTime(obj){
      function pad(n){return n<10 ? '0'+n : n}
      let d = new Date(obj);

      return d.getUTCFullYear()+'-'
      + pad(d.getUTCMonth()+1)+'-'
      + pad(d.getUTCDate())+'T'
      + pad(d.getUTCHours())+':'
      + pad(d.getUTCMinutes())+':'
      + pad(d.getUTCSeconds())+'Z'
    },
    retrieve(key) {
      return new Promise(function(resolve, reject) {
        let baseURL = process.env.VUE_APP_ROOT_API;
        axios
          .get(baseURL + "/retrieve?key=" + key)
          .then(res => {
            if (res.status == 200) {
              resolve(res.data);
            }
          })
          .catch(error => {
            console.log(error);
            reject(error);
          });
      });
    },
    loadCredentials() {
      let gid = this.$sso.getSSOData().rdp_groupID;
      // if(gid.toLowerCase() === "rdp") {
      //   store.commit('role', 'Admin');
      // }
      store.commit('groupId', gid);

      return new Promise(function(resolve, reject) {
        let baseURL = process.env.VUE_APP_ROOT_API;

        axios.get(baseURL + "/auth?group=" + gid).then(res => {
          let temp = res.data;
          temp.push(
            {"merchantId":"90d587c6-ba1f-494e-a996-46b1559d811c","merchantName":"Demo Merchant for Transactions"},{"merchantId":"D41D8CD98F00B204E9800998ECF8427E","merchantName":"Demo Merchant Billing & Funding"}
          ) //HARDCODED MERCHANT CREDENTIALS
          console.log(res.data);
          temp.sort((a, b) => a['merchantName'].localeCompare(b['merchantName']));

          store.commit("credentialsLoaded", true);
          store.commit('mData', temp);
          store.commit('merchantId', res.data[0].merchantId)
          store.commit('merchantName', res.data[0].merchantName)
          resolve(true);
        });
      });
    },
    csv2JSON(feed) {
      let result = [];
      let lines = feed.split("\n");
      let header = lines[0]
        .split(",")
        .map(str => str.replace(/^"(.*)"$/, "$1"));

      for (var i = 1; i < lines.length; i++) {
        let temp = {};
        let currentline = lines[i]
          .split(",")
          .map(str => str.replace(/^"(.*)"$/, "$1"));

        for (var j = 0; j < header.length; j++) {
          temp[header[j]] = currentline[j];
        }
        result.push(temp);
      }
      return result;
    },
    groupTx(arr) {
      let temp = {};
      let res = [];

      console.log(arr)

      for (let i in arr) {
        if (!temp[arr[i].order_id]) {
          res.push({
            displayname: arr[i].displayname,
            datetime: this.formatTime(this.addOffset(arr[i].datetime)),
            order_id: arr[i].order_id,
            merchant: arr[i].merchant,
            merchant_id: arr[i].merchant_id,
            merchant_reference: arr[i].merchant_reference,
            account_id: arr[i].account_id,
            payment_method: arr[i].payment_method,
            bin: arr[i].bin,
            last4: arr[i].last4,
            txn_amount: arr[i].txn_amount,
            currency: arr[i].currency,
            action: arr[i].action,
            status: arr[i].status,
            payment_status: arr[i].payment_status,
            auth_code: arr[i].auth_code,
            eci: arr[i].eci,
            response_code: arr[i].response_code,
            response_description: arr[i].response_description,
            product: arr[i].product,
            ip_address: arr[i].ip_address,
            mode: arr[i].mode,
            history: []
          });
        }
        temp[arr[i].order_id] = true;
      }

      console.log('grouping trx')
      console.log(arr)
      for (let i = 0; i < res.length; i++) {
        for (let j in arr) {
          if (res[i].order_id == arr[j].order_id) {
            res[i].history.push({
              datetime: this.formatTime(this.addOffset(arr[i].datetime)),
              tx_id: arr[j].transaction_id,
              txn_amount: arr[j].txn_amount,
              action: arr[j].action,
              status: arr[j].status,
              payment_status: arr[j].payment_status
            });
          }
        }
      }

      // for (let i = 0; i < res.length; i++) {
      //   res[i].history.sort(function(a, b) {
      //     return a.dateTime.localeCompare(b.dateTime);
      //   });

      //   for (let j = 0; j < res[i].history.length; j++) {
      //     if (res[i].history[j].status == "success") {
      //       if (res[i].history[j].action == "void") {
      //         if (res[i].history[j].state == "capture") {
      //           res[i].status = "Paid";
      //         } else {
      //           res[i].status = "Voided";
      //         }
      //       } else {
      //         if (res[i].history[j].action == "authorize") {
      //           res[i].status = "Authorized";
      //         }
      //         if (res[i].history[j].action == "capture") {
      //           res[i].status = "Paid";
      //         }
      //         if (res[i].history[j].action == "close") {
      //           res[i].status = "Cancelled";
      //         }
      //         if (res[i].history[j].action == "refund") {
      //           if (res[i].history[j].amount == res[i].amount) {
      //             res[i].status = "Fully refunded";
      //           } else {
      //             res[i].amount -= res[i].history[j].amount;
      //             res[i].status = "Partially refunded";
      //           }
      //         }
      //         if (res[i].history[j].action == "chargeback") {
      //           res[i].status = "Charged-back";
      //         }
      //       }
      //     } else if (res[i].history[j].status == "fail") {
      //       if (
      //         res[i].history[j].action != "refund" ||
      //         res[i].history[j].action != "capture"
      //       ) {
      //         if (
      //           res[i].history[j].action == "auto-capture" &&
      //           res[i].history[j].state == "close"
      //         ) {
      //           res[i].status = "Cancelled";
      //         } else {
      //           res[i].status = "Rejected";
      //         }
      //       }
      //     }
      //   }
      // }
      return res;
    },
    toggleModal() {
      console.log("Toggle Modal");
      $(".ui.modal").modal("show");
    },
  }
};
</script>

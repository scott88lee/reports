<template>
  <div class="ui attached segment" id="MonthSearch">
    <div class="ui stackable grid">
      <div class="row">
        <div class="sixteen wide column">
          <div class="ui form">
            <div class="fields">
              <div class="five wide field">
                <label>Billing month</label>
                <!-- ONLY SHOWS THE PAST 3 MONTHS -->
                <select class="ui selection dropdown" id="dateSelect">
                  <option value="0">{{ months[0] }}</option>
                  <option value="1">{{ months[1] }}</option>
                  <option value="2">{{ months[2] }}</option>
                </select>
              </div>
              <div class="six wide field">
                <label>&nbsp;</label>
                <button class="ui primary icon labeled button" @click="load">
                  <i class="search icon"></i>
                  Search
                </button>
                <button v-if="loaded" class="ui icon labeled button" @click="csvModal()">
                  <i class="download icon"></i>
                  Download CSV</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <csvModal />
    </div>

    <!-- LOADING PLACEHOLDER -->
    <PlaceHolder v-if="loading" />
    <BillTable v-if="loaded" />
    <h2 v-if="dataEmpty">No records for the month.</h2>
  </div>
</template>

<script>
import axios from "axios";
import store from "../../store";
import BillTable from "./BillTable.vue";
import PlaceHolder from "../PlaceHolder.vue";
import csvModal from "../CSVModal.vue";

export default {
  components: {
    BillTable,
    PlaceHolder,
    csvModal
  },
  data(){
    return {
      loading: false,
      dataEmpty: false,
      csvDL: ""
    }
  },
  computed: {
    loaded() {
      return this.$store.state.billing.loaded;
    },
    months() {
      const months = [];

      for (let i=0; i < 4; i++) {
        let temp = new Date();
        temp.setMonth(temp.getMonth() - i,1);

        let mm = temp.getMonth() + 1;
        let yyyy = temp.getFullYear();

        let xx = (mm < 10) ? '0' + mm.toString() : mm.toString();
        let month = yyyy.toString() + "-" + xx;
        console.log(month)
        months.push(month);
      }
      return months;
    }
  },
  mounted: function() {
    console.log("Billing mounted: " + months);
  },
  methods: {
    async load() {
      //Clears the display
      store.commit("billingLoaded", false);
      store.commit("billingResults", '');
      this.dataEmpty = false;
      //Triggers the placeholder
      this.loading = true;
      //Gets the selected daterange
      let el = document.getElementById("dateSelect");
      console.log(this.months[el.selectedIndex+1]);

      let date = this.months[el.selectedIndex+1];

      //TEMP FAKE id
      let id = this.$store.state.credentials.merchantId;

      //Makes ATHENA query, awaiting S3 file reference
      let key = await this.generate(id, date);

      //Getting S3 contents
      let rawData = undefined;
      let count = 1;
      do {
        try {
          // ZZZZZ
          console.log(await this.sleep(1000));
          console.log('Fetching attempt: ' + count);
          rawData = await this.retrieve(key);
          store.commit("billingLoaded", true);
          store.commit("billingKey", key);
          this.loading = false;

          //Process RAW DATA
          let json = this.csv2JSON(rawData);

          if (json.length != 0){
            let obj = this.groupTx(json);
    
            //Commiting to Global Store
            store.commit("billingResults", obj);
          } else {
            this.dataEmpty = true;
            store.commit("billingLoaded", false);
          }
        }
        catch(err) {
          count++;
          console.log("Error type: " + err);
          console.log('Retrying...')
        }
      } while (rawData == undefined && count < 11);
      console.log('Finally');
    },
    sleep(waitMsec) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve("Done.");
        }, waitMsec);
      });
    },
    csvModal(){
      if (this.$store.state.billing.loaded){
        axios
        .get(process.env.VUE_APP_ROOT_API + "/presign?key=" + this.$store.state.billing.key)
        .then(async res => {
            console.log(res.data)
          
            $("#csvModal").modal("show");
            document.getElementById('modalLink').href = res.data;
            
            console.log(await this.sleep(2500));
            document.getElementById('modalLink').click();
          });
      }
    },
    generate(id, month) {
      return new Promise(function(resolve, reject) {
        let baseURL = process.env.VUE_APP_ROOT_API;
        axios
          .get(baseURL + "/billing?generate="+ id + "&month=" + month)
          .then(res => {
            console.log(res.data.key);
            resolve(res.data.key);
          })
          .catch(error => {
            console.log(error)
            reject(error)
            });
      });
    },
    retrieve(key) {
      return new Promise(function(resolve, reject) {
        let baseURL = process.env.VUE_APP_ROOT_API;
        axios.get(baseURL + "/retrieve?key=" + key)
             .then(res => {
               if (res.status == 200) {
                 resolve(res.data);
               } })
             .catch(error => {
               console.log(error)
                 reject(error);
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
      //CSV string is now a JSON array
    },
    groupTx(arr){
      //Group by currency
      var temp = {};
      var res = [];

      for (let i in arr) {
        if (!temp[arr[i].currency]) {
          res.push({
            currency: arr[i].currency,
            accounts: []
          });
          temp[arr[i].currency] = true;
        }
      }

      res.sort(function(a, b) {
          return a.currency.localeCompare(b.currency);
        });

      for (let i = 0; i < res.length; i++) {
        let temp = {};
        for (let j in arr) {
          if (!temp[arr[j].mid] && arr[j].currency == res[i].currency) {
            res[i].accounts.push({
              accountId: arr[j].mid,
              accountName: arr[j].merchant_name,
              month: arr[j].billing_date,
              currency: arr[j].currency,
              totalBill: 0,
              fees: []
            });
            temp[arr[j].mid] = true;
          }
        }
      }

      for (let i = 0; i < res.length; i++) {
        for (let j = 0; j < res[i].accounts.length; j++) {
          for (let k = 0; k < arr.length; k++) {
            if (
              res[i].currency == arr[k].currency &&
              res[i].accounts[j].accountId == arr[k].mid
            ) {
              if (arr[k].report_type == 'monthly_fee'){
                res[i].accounts[j].monthly_fee = arr[k].amount;
                res[i].accounts[j].totalBill += (parseFloat(arr[k].amount)*1000);
              }
              if (arr[k].report_type == 'min_monthly_trx_penalty_fee'){
                res[i].accounts[j].min_monthly_penalty = arr[k].amount;
                res[i].accounts[j].totalBill += (parseFloat(arr[k].amount)*1000);
              }
              if (arr[k].report_type == 'vat'){
                res[i].accounts[j].vat = arr[k].amount;
                res[i].accounts[j].totalBill += (parseFloat(arr[k].amount)*1000);
              }
              if (arr[k].report_type == 'withholding_tax'){
                res[i].accounts[j].withholding_tax = arr[k].amount;
                res[i].accounts[j].totalBill -= (parseFloat(arr[k].amount)*1000);
              }
              if (arr[k].report_type == 'transaction_fee'){
                res[i].accounts[j].totalBill += (parseFloat(arr[k].amount)*1000);
                res[i].accounts[j].fees.push(
                  {
                    date : arr[k].trx_close_date,
                    amount : arr[k].amount
                  }
                )
              }
            }              
          }
        }
      }
      return res;
    }
  }
};
</script>

<style scoped>
.button {
  margin-left: 5px;
}
</style>

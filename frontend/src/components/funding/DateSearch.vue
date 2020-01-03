<template>
  <div class="ui bottom attached segment" id="dateSearch">
    <div class="ui stackable grid">
      <div class="row">
        <div class="sixteen wide column">
          <div class="ui form">
            <div class="fields">
              <div class="five wide field">
                <label>Start date</label>
                <div class="ui calendar" id="rangestart">
                  <div class="ui input left icon">
                    <i class="calendar icon"></i>
                    <input id="inputStart" type="text" name="start_date" placeholder="Start" autocomplete="off">
                  </div>
                </div>
              </div>
              <div class="five wide field">
                <label>End date</label>
                <div class="ui calendar" id="rangeend">
                  <div class="ui input left icon">
                    <i class="calendar icon"></i>
                    <input id="inputEnd" type="text" name="end_date" placeholder="End" autocomplete="off">
                  </div>
                </div>
              </div>
              <div class="six wide field">
                <label>&nbsp;</label>
                <button class="ui primary icon labeled button" @click="load">
                  <i class="search icon"></i>
                  Search
                </button>
                <button v-if="loaded" class="ui icon labeled button" @click="csvModal()">
                  <i class="download icon"></i>
                  Download CSV
                  </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="ui hidden divider"></div>
    <AttachedTab v-if="loaded" v-bind:data="tabs"/>
    <FundTable v-if="loaded"/>
    <PlaceHolder v-if="loading"/>
    <csvModal />
    <h1 v-if="dataEmpty">No records found</h1>
  </div>
</template>

<style scoped>
#rightColumn {
  position: relative;
}
</style>

<script>
import axios from "axios";
import store from "../../store";
import FundTable from "./FundTable.vue";
import PlaceHolder from "../PlaceHolder.vue";
import csvModal from "../CSVModal.vue";
import AttachedTab from "./AttachedTab.vue";

export default {
  components: {
    FundTable,
    PlaceHolder,
    csvModal,
    AttachedTab
  },
  data() {
    return {
      loading: false,
      dataEmpty: false,
    };
  },
  computed: {
    loaded() {
      return this.$store.state.funding.loaded;
    },
    fundingData() {
      return this.$store.state.funding.data;
    },
    tabs() {
      let tabs = []

      if (this.$store.state.funding.data) {
        let arr = this.$store.state.funding.data;

        for (let i = 0; i < arr.length; i++) {
          var obj = {};
          obj.key = i;
          obj.value = arr[i].currency;

          tabs.push(obj);
        }

        // Sort the array with SGD at the front
        var first = 'SGD';
        tabs.sort((x, y) => {
          return x.value == first ? -1 : y.value == first ? 1 : 0;
        });

        return tabs;
      } else {
        return [];
      }
    },
  },
  mounted: function() {
    console.log("Mounted");
    $("#rangestart").calendar({
      type: "date",
      monthFirst: false,
      endCalendar: $("#rangeend"),
      formatter: {
        date: function (date, settings) {
          if (!date) return '';
          var day = date.getDate();
          day = (day < 10)? "0" + day : day;
          var month = date.getMonth() + 1;
          month = (month < 10)? "0" + month : month;
          var year = date.getFullYear();
          return year + '-' + month + '-' + day;
        }
      }
    });
    $("#rangeend").calendar({
      type: "date",
      monthFirst: false,
      startCalendar: $("#rangestart"),
      formatter: {
        date: function (date, settings) {
          if (!date) return '';
          var day = date.getDate();
          day = (day < 10)? "0" + day : day;
          var month = date.getMonth() + 1;
          month = (month < 10)? "0" + month : month;
          var year = date.getFullYear();
          return year + '-' + month + '-' + day;
        }
      }
    });
    $(".ui.accordion").accordion();
    $("#inputStart").val(this.getTodaysDate());
    $("#inputEnd").val(this.getTodaysDate());
  },
  methods: {
    async load() {
      //Clears the display
      store.commit("fundingLoaded", false);
      //Triggers the placeholder
      this.loading = true;

      //Gets the selected daterange
      let start = this.convertDate(document.getElementById("inputStart").value);
      let end = this.convertDate(document.getElementById("inputEnd").value);
      //TEMP FAKE id
      let id = this.$store.state.credentials.merchantId;

      //Makes ATHENA query, awaiting S3 file reference
      let key = await this.generate(id, start, end);
      store.commit("fundingKey", key);

      //Getting S3 contents
      let rawData = undefined;
      let count = 1;
      do {
        try {
          // ZZZZZ
          console.log(await this.sleep(1000));
          console.log("Attempt: " + count);
          console.log("Fetching: " + key);
          rawData = await this.retrieve(key);
          console.log(rawData);

          //Process RAW DATA
          let json = this.csv2JSON(rawData);

          if (json.length != 0){
            let obj = this.reformatJSON(json);
            store.commit("fundingLoaded", true);
            this.dataEmpty = false;

            //Commiting to Global Store
            store.commit("fundingResults", obj);
          } else {
            this.dataEmpty = true;
          }
          this.loading = false;
        } catch (err) {
          count++;
          console.log("Error type: " + err);
          console.log("Retrying...");
        }
      } while (rawData == undefined && count < 11);
      console.log("Finally");
    },
    getTodaysDate() {
      const date = new Date();
      const year = date.getFullYear();
      let month = date.getMonth() + 1;
      month = (month < 10)? "0" + month : month;
      let day = date.getDate();
      day = (day < 10)? "0" + day : day;

      return year + '-' + month + '-' + day;
    },
    csvModal(){
      if (this.$store.state.funding.loaded){
        axios
        .get(process.env.VUE_APP_ROOT_API + "/presign?key=" + this.$store.state.funding.key)
        .then(async res => {
            this.csvDL = res.data;
            console.log(res.data)

            $("#csvModal").modal("show");
            document.getElementById('modalLink').href = res.data;

            console.log(await this.sleep(2500));
            document.getElementById('modalLink').click();
          });
      }
    },
    convertDate(dateString) {
      let date = new Date(dateString);

      let yyyy = date.getFullYear().toString();
      let mm = (date.getMonth() + 1).toString();
      let dd = date.getDate().toString();

      return yyyy + "-" + mm + "-" + dd;
    },
    sleep(waitMsec) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve("Done.");
        }, waitMsec);
      });
    },
    generate(id, start, end) {
      return new Promise(function(resolve, reject) {
        let baseURL = process.env.VUE_APP_ROOT_API;
        console.log("Generating Athena query.");
        id = 'D41D8CD98F00B204E9800998ECF8427E'
        axios
          .get(
            baseURL +
              "/funding?generate=" +
              id +
              "&start=" +
              start +
              "&end=" +
              end
          )
          .then(res => {
            console.log("Success: " + res.data.key);
            resolve(res.data.key);
          })
          .catch(error => {
            console.log(error);
            reject(error);
          });
      });
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
    csv2JSON(feed) {
      let config = {
        header : true
      }

      let temp = Papa.parse(feed, config);

      return temp.data;
    },
    reformatJSON(arr) {
      //Begin sorting and grouping
      //Will clean this up when I have the time
      let temp = {};
      let res = [];

      for (let i in arr) {
        if (!temp[arr[i].currency]) {
          res.push({
            currency: arr[i].currency,
            dates: []
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
          if (!temp[arr[j].term_date] && arr[j].currency == res[i].currency) {
            res[i].dates.push({
              date: arr[j].term_date,
              accounts: []
            });
            temp[arr[j].term_date] = true;
          }
        }
      }

      for (let i = 0; i < res.length; i++) {
        for (let j = 0; j < res[i].dates.length; j++) {
          let temp = {};
          for (let k in arr) {
            if (
              temp[arr[k].mid] == undefined &&
              arr[k].currency === res[i].currency &&
              arr[k].term_date === res[i].dates[j].date
            ) {
              res[i].dates[j].accounts.push({
                aid: arr[k].mid,
                accountName: arr[k].merchant_name,
                fundingTotal: 0,
                balance: 0,
                reports: [],
                sales_vol: []
              });
              temp[arr[k].mid] = true;
            }
          }
        }
        res[i].dates.sort(function(a, b) {
          return b.date.localeCompare(a.date);
        });
      }

      for (let i = 0; i < res.length; i++) {
        for (let j = 0; j < res[i].dates.length; j++) {
          for (let k = 0; k < res[i].dates[j].accounts.length; k++) {
            let temp = {};
            for (let h = 0; h < arr.length; h++) {
              if (
                arr[h].currency == res[i].currency &&
                arr[h].term_date == res[i].dates[j].date &&
                arr[h].mid == res[i].dates[j].accounts[k].aid
              ) {
                  if (
                    arr[h].report_type == 'capture' ||
                    arr[h].report_type == 'refund' ||
                    arr[h].report_type == 'void' ||
                    arr[h].report_type == 'sale'
                  ){
                    if (temp[arr[h].trx_close_date] == undefined) {
                      res[i].dates[j].accounts[k].sales_vol.push( {
                        date : arr[h].trx_close_date,
                        sales_vol : 0
                      } )
                      temp[arr[h].trx_close_date] = true;
                    }
                  }
                  if (arr[h].report_type != "funding") {
                    if (arr[h].report_type != "closing_balance") {
                      if (arr[h].report_type == "merchant_discount_fee"){
                        res[i].dates[j].accounts[k].reports.push(
                          {
                          reportType: "Merchant Discount Fee",
                          amount: arr[h].amount,
                          entry: arr[h].entry_type,
                          txDate: arr[h].trx_close_date
                          }
                        );
                      }
                      else if (arr[h].report_type == "transaction_fee"){
                        res[i].dates[j].accounts[k].reports.push(
                          {
                          reportType: "Transaction fee",
                          amount: arr[h].amount,
                          entry: arr[h].entry_type,
                          txDate: arr[h].trx_close_date
                          }
                        );
                      }
                      else if (arr[h].report_type == "reserve"){
                        let detail = undefined;
                        if (arr[h].detail){
                          detail = JSON.parse(arr[h].detail)
                        }
                        res[i].dates[j].accounts[k].reports.push(
                          {
                          reportType: "Reserve contract",
                          amount: arr[h].amount,
                          entry: arr[h].entry_type,
                          txDate: arr[h].trx_close_date,
                          rate: detail.info.rate
                          }
                        );
                      }
                      else if (arr[h].report_type == "opening_balance") {
                        let detail = undefined;
                        if (arr[h].detail){
                          detail = JSON.parse(arr[h].detail)
                        }
                        res[i].dates[j].accounts[k].reports.push(
                          {
                            reportType: "Balance brought forward",
                            amount: arr[h].amount,
                            entry: arr[h].entry_type,
                            txDate: arr[h].trx_close_date,
                            srcDate: detail.src_term_date
                          }
                        );
                      }
                      // else {
                      //   res[i].dates[j].accounts[k].reports.push(
                      //     {
                      //       reportType: arr[h].report_type,
                      //       amount: arr[h].amount,
                      //       entry: arr[h].entry_type,
                      //       txDate: arr[h].trx_close_date,
                      //       srcDate: arr[h].detail
                      //     }
                      //   );
                      // }
                    }
                  }

                  //SUMMING UP THE FUNDING
                  if (arr[h].entry_type == "credit") {
                    res[i].dates[j].accounts[k].fundingTotal += Math.round(
                      parseFloat(arr[h].amount * 1000)
                    );
                  } else if (
                    arr[h].entry_type == "debit" &&
                    arr[h].report_type != "funding"
                  ) {
                    res[i].dates[j].accounts[k].fundingTotal -= Math.round(
                      parseFloat(arr[h].amount * 1000)
                    );
                  }

                  //SUMMING UP THE BALANCE
                  if (arr[h].report_type == "closing_balance") {
                    if (arr[h].entry_type == "credit") {
                      res[i].dates[j].accounts[k].balance -= Math.round(
                        parseFloat(arr[h].amount * 1000)
                      );
                    }
                    else if (arr[h].entry_type == "debit") {
                      res[i].dates[j].accounts[k].balance += Math.round(
                        parseFloat(arr[h].amount * 1000)
                      );
                    } //OMG....
                  }
                }
              }
            }
          }
        }
        for (let i = 0; i < res.length; i++) {
          for (let j = 0; j < res[i].dates.length; j++) {
            for (let k = 0; k < res[i].dates[j].accounts.length; k++) {

              res[i].dates[j].accounts[k].reports.sort(function(a, b) {
                return b.txDate.localeCompare(a.txDate);
              });

              res[i].dates[j].accounts[k].sales_vol.sort(function(a, b) {
                return b.date.localeCompare(a.date);
              });

              for (let m = 0; m < res[i].dates[j].accounts[k].sales_vol.length; m++) {
                for (let h = 0; h < arr.length; h++) {
                  if (
                    arr[h].currency == res[i].currency &&
                    arr[h].term_date == res[i].dates[j].date &&
                    arr[h].mid == res[i].dates[j].accounts[k].aid &&
                    arr[h].trx_close_date == res[i].dates[j].accounts[k].sales_vol[m].date
                  ) {
                  if (
                    arr[h].report_type == 'capture' ||
                      arr[h].report_type == 'refund' ||
                      arr[h].report_type == 'void' ||
                      arr[h].report_type == 'sale' ){
                        if (arr[h].entry_type == 'credit'){
                          res[i].dates[j].accounts[k].sales_vol[m].sales_vol += Math.round(parseFloat(arr[h].amount * 1000))
                        } else if (arr[h].entry_type == 'debit'){
                          res[i].dates[j].accounts[k].sales_vol[m].sales_vol -= Math.round(parseFloat(arr[h].amount * 1000))
                        }
                      }
                    }
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

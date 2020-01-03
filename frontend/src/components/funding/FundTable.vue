<template>
  <div class="ui bottom attached segment fundingTables">
    <div v-for="(dates, i) in selectedCurrency.dates" :key="i">

      <div class="ui small header">Funding date: {{ dates.date }}</div>

      <div class="ui fluid styled accordion">
        <div v-for="(account, j) in dates.accounts" :key="j">
          <div :id="'accordion-' + j" class="title" @click="sortTable('trx-date-'+ i + '-' + j)">
            <table class="ui fluid very basic table">
              <tbody>
                <tr>
                  <td class="collapsing">
                    <i class="dropdown icon"></i>
                  </td>
                  <td>
                    Account Name: {{ account.accountName }} <br>
                    <span v-bind:title="account.aid">Account id: {{ account.aid.slice(0,8) }}...</span>
                  </td>
                  <td class="collapsing">
                    Balance: <br>
                    {{ (account.balance / 1000).toLocaleString(undefined, { minimumFractionDigits: 2 }) }} {{ selectedCurrency.currency }}
                  </td>
                  <td class="collapsing">
                    Total Funding: <br>
                    {{ (account.fundingTotal / 1000).toLocaleString(undefined, { minimumFractionDigits: 2 }) }} {{ selectedCurrency.currency }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="content">
            <table class="ui fluid sortable table">
              <thead>
                <tr>
                  <th class="collapsing no-sort">Funding Date</th>
                  <th :class="'hidden collapsing trx-date-' + i + '-' + j">Transaction Date</th>
                  <th class="no-sort">Description</th>

                  <th class="collapsing no-sort">Amount</th>
                  <th class="collapsing no-sort">Currency</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(sales, k) in account.sales_vol" :key="k">
                  <td>{{dates.date}}</td>
                  <td class="hidden">{{ sales.date }}</td>
                  <td class="fluid">Sales volume for {{ sales.date }} <a class="ui button" @click="salesVolume(account.aid, sales.date)">TEST</a> <a @click="genCSV(account.aid, sales.date)"><i class="download icon"></i></a></td>
                  <td>{{(sales.sales_vol / 1000).toLocaleString(undefined, {minimumFractionDigits: 2})}}</td>
                  <td>{{selectedCurrency.currency}}</td>
                </tr>

                <tr v-for="(reports, l) in account.reports" :key="l">
                  <td>{{dates.date}}</td>
                  <td class="hidden">{{ reports.srcDate ? ("from " + reports.srcDate ) : reports.txDate}}</td>
                  <td class="fluid">{{reports.reportType}} {{ reports.rate ? ( reports.rate * 100 ) + "%" : ''}} - {{ reports.srcDate ? ("from " + reports.srcDate ) : reports.txDate }}</td>
                  <td>{{ (reports.entry == 'credit') ? (reports.amount*10/10).toLocaleString(undefined, {minimumFractionDigits: 2}) : (reports.amount*-10/10).toLocaleString(undefined, {minimumFractionDigits: 2}) }}</td>
                  <td>{{selectedCurrency.currency}}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <csvModal />
  </div>
</template>

<style scoped>
.ui.attached.segment {
  border-top: 0;
  margin-left: 0;
  width: 100%;
}

.hidden {
  display: none;
}
</style>

<script>
import csvModal from "../CSVModal.vue";
import store from "../../store";
import axios from "axios"

export default {
  components: {
    csvModal
  },
  data() {
    return {
      csvLink: "default",
      loading: true,
      }
  },
  computed: {
    selectedCurrency() {
      return this.$store.state.funding.data[this.$store.state.funding.tabIndex];
    }
  },
  mounted: function() {
    $(".ui.accordion").accordion();
    $('.sortable.table').tablesort();
  },
  updated: function() {
    $(".ui.accordion").accordion();
  },
  methods: {
    sortTable(id) {
      $('.sortable.table').tablesort();
      $('.' + id).click()
    },
    salesVolume (aid, date) {
      return new Promise (function (resolve, reject) {
        const baseUrl = process.env.VUE_APP_ROOT_API
        axios.get(baseUrl + '/sales-volume?aid=' + aid + '&date=' + date)
        .then(res => {
          console.log(res.data.key)
          resolve(res.data.key)
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
      })
    },
    generate(id, orderId) {
      return new Promise(function(resolve, reject) {
        let baseURL = process.env.VUE_APP_ROOT_API;
        axios
          .get(baseURL + "transactions?generate=" + id + "&orderid=" + orderId)
          .then(res => {
            console.log(res.data.key);
            resolve(res.data.key);
          })
          .catch(error => {
            console.log(error);
            reject(error);
          });
      });
    },
    async genCSV(id, date){
      console.log(id)
      console.log(date)

      let params = {
        db : "collaborate_report_frontend"
      }
      const vue = this
      params.sql = "SELECT mid AS account_id, merchant_name AS account_name, transaction_type, transaction_status, transaction_group_id AS order_id, merchant_reference, amount as transaction_amount, currency as transaction_currency, request_amount as base_amount, request_currency as base_currency, mdr_fee, mdr_fee_currency, transaction_fee, transaction_fee_currency, trx_close_date AS date  FROM transaction_fee WHERE mid = '" + id + "' AND trx_close_date = '" + date + "';"
      axios.post(process.env.VUE_APP_ROOT_API + '/deep', JSON.stringify(params)).then(
        res => {
          console.log(res.data.key);

          setTimeout(() => {
            axios
            .get(process.env.VUE_APP_ROOT_API + "/retrieve?key=" + res.data.key)
            .then(res => {

              console.log(res.data);
              // $("#csvModal").modal("show");
              // document.getElementById('modalLink').html = res.data;

              // console.log(await this.sleep(2500));
              // document.getElementById('modalLink').click();
            })
            .catch(error => {
              console.log('error...')
              console.log(error)
              console.log(error.message)
            })
          }, 2000);
        });
    },
    sleep(waitMsec) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve("Waited...", waitMsec.toString());
        }, waitMsec);
      });
    }
  }
};
</script>

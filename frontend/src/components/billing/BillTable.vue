<template>
  <div id="billTable">
    <br>
    
    <div class="ui accordion">
      <div v-for="bill in selectedCurrency.accounts" :key="bill.accountId">
        <div class="title">
          <table class="ui fluid table">
            <thead>
              <tr>
                <th class="collapsing">
                  <i class="angle double down icon"></i>
                </th>
                <th>
                  Account Name: {{bill.accountName}}
                  <br>
                  <span
                    v-bind:title="bill.accountId"
                  >Account id: {{bill.accountId.slice(0,8)}}...</span>
                </th>
                <th class="collapsing">Total billing:
                  <br>{{ (bill.totalBill/1000).toLocaleString(undefined, {minimumFractionDigits: 2}) }}&nbsp;{{bill.currency}}
                </th>
              </tr>
            </thead>
          </table>
        </div>

        <div class="content">
          &nbsp;<b> Month of: {{bill.month}}</b>
          <table class="ui celled striped table" id="bill">
            <thead>
              <tr>
                <th class="collapsing">Date &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Currency</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tx in bill.fees" :key="tx.date">
                <td class="collapsing">{{tx.date}} </td>
                <td>
                  Transaction fee
                  <!-- DR-35 - Ask me to do it, then ask me to remove it. Great project management!-->
                  <!-- <a @click="genCSV(bill.accountId, tx.date)"><i class="download icon"></i></a> -->
                </td>
                <td class="right aligned collapsing">{{(tx.amount*10/10).toLocaleString(undefined, {minimumFractionDigits: 2})}}</td>
                <td class="right aligned collapsing">{{bill.currency}}</td>
              </tr>
              <tr v-if="bill.vat">
                <td>{{lastDayOfTheMonth}}</td>
                <td>VAT on fees at 7%</td>
                <td class="right aligned collapsing">{{(bill.vat*10/10).toLocaleString(undefined, {minimumFractionDigits: 2})}}</td>
                <td class="right aligned collapsing">{{bill.currency}}</td>
              </tr>
              <tr v-if="bill.withholding_tax">
                <td>{{lastDayOfTheMonth}}</td>
                <td>Withholding tax at 3%</td>
                <td class="right aligned collapsing">{{(bill.withholding_tax*10/10).toLocaleString(undefined, {minimumFractionDigits: 2})}}</td>
                <td class="right aligned collapsing">{{bill.currency}}</td>
              </tr>
              <tr v-if="bill.min_monthly_penalty">
                <td>{{lastDayOfTheMonth}}</td>
                <td>Minimun monthly transaction penalty</td>
                <td class="right aligned collapsing">{{(bill.min_monthly_penalty*10/10).toLocaleString(undefined, {minimumFractionDigits: 2})}}</td>
                <td class="right aligned collapsing">{{bill.currency}}</td>
              </tr>
              <tr v-if="bill.monthly_fee">
                <td>{{lastDayOfTheMonth}}</td>
                <td>Monthly fee</td>
                <td class="right aligned collapsing">{{(bill.monthly_fee*10/10).toLocaleString(undefined, {minimumFractionDigits: 2})}}</td>
                <td class="right aligned collapsing">{{bill.currency}}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <th></th>
                <th class="right aligned collasping">Total</th>
              
                <th
                  class="right aligned collasping"
                >{{ (bill.totalBill/1000).toLocaleString(undefined, {minimumFractionDigits: 2}) }}</th>
                <th class="right aligned collasping">{{bill.currency}}</th>
              </tr>
            </tfoot>
          </table>
        </div>
        <br>
      </div>
    </div>

    <csvModal />
  </div>
</template>

<script>
import csvModal from "../CSVModal.vue"
import store from "../../store";
import axios from "axios";

export default {
  computed: {
    bills() {
      return this.$store.state.billing.data;
    },
    lastDayOfTheMonth(){
      let yyyymm = this.$store.state.billing.data[0].accounts[0].month;
      let mm = yyyymm.slice(5,8);
      let dd = 0
      if (mm == 2 || mm == '02'){
        dd = 28;
      } else if (
        mm == 4 ||
        mm == '04' ||
        mm == 6 ||
        mm == '06' ||
        mm == 9 ||
        mm == '09' ||
        mm == 11 ||
        mm == '11'
      ){
        dd = 30;
      } else {
        dd = 31;
      }
      return yyyymm + '-' + dd.toString();
    },
    selectedCurrency() {
      return this.$store.state.billing.data[this.$store.state.billing.tabIndex];
    }
  },
  components:{
    csvModal
  },
  mounted: function(){
    $(".ui.accordion").accordion();
  },
  updated: function(){
    $(".ui.accordion").accordion();
  },
  methods: {
    async genCSV(id, date){
      console.log(id)
      console.log(date)
      let params = {
        db : "collaborate_report_frontend"
      }
      params.sql = "SELECT mid AS account_id, merchant_name AS account_name, transaction_type, transaction_status, transaction_group_id AS order_id, merchant_reference, amount, currency, mdr_fee, transaction_fee, trx_close_date AS date  FROM transaction_fee WHERE mid = '" + id + "' AND trx_close_date = '" + date + "';"
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
            });
        });
    },
    sleep(waitMsec) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve("Waited...");
        }, waitMsec);
      });
    }
  }
}
</script>


<style>
</style>

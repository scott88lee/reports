<template>
  <div>
    <div class="ui attached right aligned segment">
      <button class="ui primary button" @click.stop="refundTrx()">Refund</button>
      <button class="ui primary button" @click.stop="voidTrx()">Void</button>
    </div>

    <div id="scrollable-segment">
    <table id="txList" class="ui bottom attached sortable celled fluid small table">
      <thead>
        <tr>
          <th class="no collapsing"></th>
          <th class="datetime sorted descending collapsing">Date / Time</th>
          <th class="acc-name collapsing">Account Name
            <br>Account ID
          </th>
          <th class="order-id">Order ID
            <br>Merchant Ref
          </th>

          <th class="payment-type collapsing">Payment Type
            <br>Last 4 digits
          </th>
          <th class="status collapsing">
            Status<br/>
            Latest Amount
          </th>
          <th class="product collapsing">
            Product
          </th>
          <th class="auth-code collapsing">Auth Code
            <br>ECI
          </th>
          <th class="resp-code collapsing">
            <span>Response Code </span>
            <br/>
            <span>RC Description</span>
          </th>
        </tr>
      </thead>
      <tbody v-if="txLoaded">
        <tr v-for="(trx, _index) in transactions" :key="_index">
          <td class="collasping">
            <div class="ui form">
              <div class="field">
                <div class="ui checkbox">
                  <input type="radio" v-model="index" :value="_index">
                  <label></label>
                </div>
              </div>
            </div>
          </td>
          <td>
            {{ trx.datetime.split('T')[0] }}
            <br>
            {{ trx.datetime.split('T')[1].split('Z')[0] }}
          </td>

          <td>
            <div>{{ trx.displayname }}</div>
            <div class="nowrap">{{ trx.account_id }}</div>
          </td>

          <td>
            <div class="ellipsis">
              {{ trx.order_id }}
            </div>
            <br/>
            <div class="ellipsis">
            {{ trx.merchant_reference }}
            </div>
            <button class="ui right floated circular mini icon basic button orderId-merchantRef-btn" :title="trx.order_id" :data-content="trx.merchant_reference">
              <i class="ui info icon"></i>
            </button>
          </td>

          <td>
            <img class="payment_logo" :src="trx.payment_method == 'visa' ? 'assets/visa.png' : trx.payment_method == 'mastercard' ? 'assets/mastercard.png' : trx.payment_method == 'amex' ? 'assets/amex.png' : trx.payment_method == 'alipay' ? 'assets/alipay.png' : trx.payment_method == 'wechat' ? 'assets/wechat.png' : trx.payment_method == 'jcb' ? 'assets/jcb.gif' : trx.payment_method == 'discover' ? 'assets/discover.jpg' : trx.payment_method == 'paypal' ? 'assets/paypal.png' : ''">
            <br>
            {{ trx.bin }}...{{ trx.last4 }}
          </td>

          <td class="center aligned">
            <div>
              {{ ucFirst(trx.payment_status) }}
            </div>
            <div class="ui fitted divider"></div>
            <div>
            {{ (trx.txn_amount*10/10).toLocaleString(undefined, {minimumFractionDigits: 2}) }} {{ trx.currency }}
            </div>
          </td>
          <td>
            {{ (trx.product.length > 10) ? trx.product.slice(0,9) : trx.product }}
          </td>
          <td>
            {{ trx.auth_code }}
            <br>
            {{ trx.eci }}
          </td>
          <td> -
            <br> -
          </td>
        </tr>
        <tr v-if="txLoaded === false">
          <td>Loading ...</td>
        </tr>
      </tbody>
    </table>
    <table id="header-fixed" class="ui bottom attached sortable celled fluid small table"></table>
    </div>

    <RefundModal v-if="this.index > -1"
      :orderId="this.transactions[this.index].order_id"
      :mode="this.transactions[this.index].mode"
      :currency="this.transactions[this.index].currency"
      :details="this.transactions[this.index]"
    />
    <VoidModal v-if="this.index > -1"
      :orderId="this.transactions[this.index].order_id"
      :mode="this.transactions[this.index].mode"
      :details="this.transactions[this.index]"
    />
  </div>
</template>

<style scoped>
  #scrollable-segment {
    min-height: 62vh;
    max-height: 84vh;
    padding: 0;
    overflow: scroll;
  }

  .ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 6em;
    display: inline-block;
  }

  .right.aligned.segment {
    margin-top: 0;
    margin-bottom: 0;
    padding-right: 0;
  }

  .table {
    margin-top: 0;
  }

  .ui.checkbox {
    width: 0px;
  }

  .modal {
    margin-top: 0px !important;
    margin-left: "auto";
    margin-right: "auto";
  }

  .payment_logo {
    width: 48px;
  }

  .nowrap {
    white-space: nowrap;
  }

  #header-fixed {
    position: fixed;
    top: 319px;
    background-color: white;
  }
</style>

<script>
import axios from "axios";
import RefundModal from "./RefundModal.vue";
import VoidModal from "./VoidModal.vue";
import PlaceHolder from "../PlaceHolder.vue";
import moment from 'moment'

export default {
  components: {
    RefundModal,
    VoidModal,
    PlaceHolder
  },
  computed: {
    transactions() {
      return this.$store.state.transactions.data;
    },
    txLoaded() {
      return this.$store.state.transactions.loaded;
    }
  },
  data() {
    return {
      loadingModal: false,
      loadedModal: false,
      modalData: null,
      modalCache: "",
      index: -1,
      orderId: '',
      mode: '',
      currency: '',
      details: {},
      netAmt: '',
      baseAmt: '',
    };
  },
  methods: {
    parseDate: function (utc) {
      return moment(utc).format('YYYY-MM-DD h:mm:ss A')
    },
    ucFirst: function (str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    refundTrx() {
      this.prepareTrxDetails();

      $('#refund-modal')
        .modal({
          inverted: true,
          blurring: true,
        })
        .modal('show')
    },
    voidTrx() {
      this.prepareTrxDetails();

      $( '#void-modal')
        .modal({
          inverted: true,
          blurring: true,
        })
        .modal('show')
    },
    async load(str) {
      this.loadingModal = true;
      let id = this.$store.state.credentials.merchantId;

      let key = await this.generate(id, str);

      let rawData = undefined;
      let count = 1;
      do {
        try {
          // ZZZZZ
          console.log(await this.sleep(1000));
          console.log("Attempt: " + count);
          console.log("Fetching: " + key);
          rawData = await this.retrieve(key);

          let temp = this.csv2JSON(rawData);
          this.modalData = temp;
          this.loadingModal = false;
          this.loadedModal = true;
          console.log(temp);
        } catch (err) {
          count++;
          console.log("Error type: " + err);
          console.log("Retrying...");
        }
      } while (rawData == undefined && count < 21);
      console.log("Finally");
    },
    getTXdetails(str) {
      let arr = this.$store.state.transactions.data;

      for (let i in arr) {
        if (arr[i].orderId == str) {
          this.modalCache = arr[i];
        }
      }

      this.loadingModal = true;
      this.loadedModal = true;

      $(".modal").modal("show");

      //this.load(str);
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
    sleep(waitMsec) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve("Waited...");
        }, waitMsec);
      });
    },
    retrieve(key) {
      return new Promise(function(resolve, reject) {
        let baseURL = "https://deep.api.reddotpay.sg/";
        axios
          .get(baseURL + "transactions?retrieve=" + key)
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
      //CSV string is now a JSON array
      function compare(a, b) {
        if (a.createddate < b.createddate) return -1;
        if (a.createddate > b.createddate) return 1;
        return 0;
      }
      //sorted by dateTime
      return result.sort(compare);
    },
    csv2JSONTxnDetails(feed) {
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
    moneyFormat: function (number) {
      const formatter = new Intl.NumberFormat('en-US', {
          minimumFractionDigits: 2
      })

      return formatter.format(number)
    },
    prepareTrxDetails: function () {
      $('.base-amt').html('<i class="ui loading spinner icon"></i>');
      $('.net-amt').html ('<i class="ui loading spinner icon"></i>');
      axios.get(
          process.env.VUE_APP_ROOT_API + '/transactions?generate=' + this.$store.state.credentials.merchantId + '&orderid=' + this.transactions[this.index].order_id,
      )
      .then((res) => {
          const vue = this;
          setTimeout(function () {
              // generating file takes about 1500 mili seconds.
              // wait and send one effective request instead of sending multiple requests until successful
              vue.getTrxDetails(res.data.key)
          }, 1600)
      })
      .catch((err) => {
          console.log(err)
      })
    },
    getTrxDetails: function (key) {
        axios.get(
            process.env.VUE_APP_ROOT_API + "/retrieve?key=" + key
        )
        .then((res) => {
            let json = this.csv2JSONTxnDetails(res.data)
            json.sort(function(a, b) {
                return (new Date(a.datetime) > new Date(b.datetime))? 1 : -1;
            })
            console.log(json)
            json.forEach(e => {
                if (e.state.toLowerCase() == "capture" & e.status.toLowerCase() == "success") {
                  this.netAmt = e.txn_amount;
                  this.baseAmt = e.txn_amount;
                }
                if (e.state.toLowerCase() == "refund" & e.status.toLowerCase() == "success") {
                    this.netAmt -= e.txn_amount;
                }
            });
            $('.base-amt').html(this.moneyFormat(this.baseAmt))
            $('.net-amt').html(this.moneyFormat(this.netAmt))
        })
        .catch((err) => {
            this.getTrxDetails(key)
        })
    },
  },
  mounted: function() {
    $("table").tablesort();

    $('.orderId-merchantRef-btn')
      .popup({
        on    : 'click'
      });

    var $header = $("#txList > thead").clone();
    var $fixedHeader = $("#header-fixed").append($header);

    const fixedHeader = '#header-fixed'
    $(fixedHeader).width($('#txList').width())
    $(fixedHeader + ' .no').width($('#txList .no').width() + 'px')
    $(fixedHeader + ' .datetime').width($('#txList .datetime').width())
    $(fixedHeader + ' .acc-name').width($('#txList .acc-name').width())
    $(fixedHeader + ' .order-id').width($('#txList .order-id').width())
    $(fixedHeader + ' .payment-type').width($('#txList .payment-type').width())
    $(fixedHeader + ' .status').width($('#txList .status').width())
    $(fixedHeader + ' .product').width($('#txList .product').width())
    $(fixedHeader + ' .auth-code').width($('#txList .auth-code').width())
    $(fixedHeader + ' .resp-code').width($('#txList .resp-code').width())

    $(fixedHeader+ ' .datetime').on('click', function () {
      $('#txList .datetime').click()
    })
    $(fixedHeader+ ' .acc-name').on('click', function () {
      $('#txList .acc-name').click()
    })
    $(fixedHeader+ ' .order-id').on('click', function () {
      $('#txList .order-id').click()
    })
    $(fixedHeader+ ' .payment-type').on('click', function () {
      $('#txList .payment-type').click()
    })
    $(fixedHeader+ ' .status').on('click', function () {
      $('#txList .status').click()
    })
    $(fixedHeader+ ' .product').on('click', function () {
      $('#txList .product').click()
    })
    $(fixedHeader+ ' .auth-code').on('click', function () {
      $('#txList .auth-code').click()
    })
    $(fixedHeader+ ' .resp-code').on('click', function () {
      $('#txList .resp-code').click()
    })
  },
  updated: function () {
    if ($('.refund-modal').length > 1) {
      $('.refund-modal').last().remove()
    }
    if ($('.refund-confirmation-modal').length > 1) {
      $('.refund-confirmation-modal').last().remove()
    }
    if ($('.refund-status-modal').length > 1) {
      $('.refund-status-modal').last().remove()
    }

    if ($('.void-modal').length > 1) {
      $('.void-modal').last().remove()
    }
    if ($('.void-confirmation-modal').length > 1) {
      $('.void-confirmation-modal').last().remove()
    }
    if ($('.void-status-modal').length > 1) {
      $('.void-status-modal').last().remove()
    }
  }
};
</script>

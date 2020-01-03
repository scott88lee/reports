<template>
  <div>
    <div id="refund-modal" class="ui refund-modal modal">
      <div class="content">
        <div class="ui grid">
          <div class="row">
            <div class="eight wide column">
              <div class="ui header">Transaction Details</div>
              <table class="ui small definition table">
                <tbody>
                  <tr>
                    <td>Order ID</td>
                    <td>{{ orderId }}</td>
                  </tr>
                  <tr>
                    <td>Payment method</td>
                    <td>{{ ucFirst(details.payment_method) }}</td>
                  </tr>
                  <tr>
                    <td>Payment status</td>
                    <td>{{ ucFirst(details.payment_status) }}</td>
                  </tr>
                  <tr>
                    <td>Base amount</td>
                    <td>
                      <div class="base-amt"></div>
                    </td>
                  </tr>
                  <tr>
                    <td>Net amount</td>
                    <td>
                      <div class="net-amt"></div>
                    </td>
                  </tr>
                  <tr>
                    <td>Currency</td>
                    <td>{{ details.currency }}</td>
                  </tr>
                  <tr>
                    <td>Status</td>
                    <td>{{ ucFirst(details.status) }}</td>
                  </tr>
                  <tr>
                    <td>Timestamp</td>
                    <td>{{ details.datetime.replace(/T|Z/gi, ' ') }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="eight wide column">
              <div class="ui header">Transaction History</div>
              <table class="ui small table">
                <thead>
                  <tr>
                    <th></th>
                    <th></th>
                    <th>Action, Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(event, key) in details.history" :key="key">
                    <td>{{ event.datetime.replace(/T|Z/gi, ' ') }}</td>
                    <td>{{ moneyFormat(event.txn_amount, details.currency) }}</td>
                    <td>
                      <div class="ui label">{{ ucFirst(event.action) }}</div>

                      <div
                        v-if="event.status == 'fail'"
                        class="ui red label"
                      >{{ ucFirst(event.payment_status) }}</div>
                      <div
                        v-else-if="event.status == 'pending'"
                        class="ui orange label"
                      >{{ ucFirst(event.payment_status) }}</div>
                      <div
                        v-else-if="event.status == 'success'"
                        class="ui teal label"
                      >{{ ucFirst(event.payment_status) }}</div>
                    </td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3">
                      <span class="ui orange empty circular label"></span> Pending
                      <span class="ui teal empty circular label"></span> Success
                      <span class="ui red empty circular label"></span> Fail
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
        <div class="ui hidden divider"></div>
        <div class="ui form">
          <div class="ui two fields">
            <div class="field">
              <label>Amount to be refunded</label>
              <div class="field">
                <input type="text" v-model.trim="$v.amount.$model">
                <div class="ui pointing red basic label" v-if="!$v.amount.required">
                  <em>Amount to be refund</em> is required.
                </div>
                <div class="ui pointing red basic label" v-if="!$v.amount.decimal">
                  <em>Amount to be refund</em> must be decimal.
                </div>
              </div>
            </div>
            <div class="field">
              <label>Currency</label>
              <div class="field">
                <input type="text" v-model="currency" readonly>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="actions">
        <div class="ui deny button">Cancel</div>
        <div id="btn-refund" class="ui primary button" @click.stop="doValidate()">Refund</div>
      </div>
    </div>
    <div id="refund-confirmation-modal" class="ui refund-confirmation-modal mini modal">
      <div class="content">Confirm to do refund?</div>
      <div class="actions">
        <div class="ui deny button">Cancel</div>
        <div id="btn-confirm-refund" class="ui ok primary button" @click.stop="doRefund()">Confirm</div>
      </div>
    </div>
    <div id="refund-status-modal" class="ui refund-status-modal mini modal">
      <div class="content">
        <div v-if="(this.status).toLowerCase() == 'success'">
          <div class="ui success message">
            <div class="header">Refund successful.</div>
            <p>{{ this.msg }}</p>
          </div>
        </div>
        <div v-else>
          <div class="ui negative message">
            <div class="header">Refund failed.</div>
            <p>{{ this.msg }}</p>
          </div>
        </div>
      </div>
      <div class="actions">
        <div class="ui ok primary button">OK</div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { required, decimal } from "vuelidate/lib/validators";
import moment from "moment";

export default {
  name: "RefundModal",
  props: {
    orderId: String,
    mode: String,
    currency: String,
    details: Object
  },
  data() {
    return {
      resp: {},
      action: "",
      amount: 0,
      status: "",
      msg: "" // to display success or error message
    };
  },
  validations: {
    amount: {
      required,
      decimal
    }
  },
  methods: {
    parseDate: function(utc) {
      return moment(utc).format("YYYY-MM-DD h:mm:ss A");
    },
    moneyFormat: function(number, currency = "SGD") {
      const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2
      });

      return formatter.format(number);
    },
    ucFirst: function(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },
    doValidate: function() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        // error
        alert("You have an error on your form.");
      } else {
        $("#refund-confirmation-modal")
          .modal({
            allowMultiple: true,
            inverted: true,
            blurring: true
          })
          .modal("show");
      }
    },
    doRefund: function() {
      $("#btn-confirm-refund").addClass("loading");
      $("#btn-refund").addClass("disabled");

      axios
        .post(
          process.env.VUE_APP_ROOT_API + "/refund",
          {
            orderId: this.orderId,
            amount: this.amount,
            currency: this.currency,
            mode: this.mode
          },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            }
          }
        )
        .then(res => {
          console.log("FROM doREFUND()");
          console.log(res);
          console.log(res.data);
          this.resp = res.data;
          this.status = res.data.transactions[0].status;
          if (this.status.toLowerCase() == "success") {
            let tokenData = {"merchant": {"dba": this.details.displayname}, "refund": {"status": "refunded", "amount": this.amount, "currency": this.currency}, "transaction": {"id": this.orderId, "merchantReferance": this.details.merchant_reference, "dateTime":  this.details.datetime.replace(/T|Z/gi, ' '), "amount": this.details.txn_amount, "currency": this.details.currency, "paymentType": this.details.payment_method, "cardLast4": this.details.last4}};
            // this.sendMessage(["ernestlee@reddotpay.com"], tokenData);
            this.msg = "Transaction status will be reflected shortly.";
          } else if (this.status.toLowerCase() == "fail") {
            // if error exist
            if (res.data.transactions[0].error != "undefined") {
              // error object has two attributes - code and message. eg. code: 1, message: "request is invalid..."
              console.log("Code: " + res.data.transactions[0].error.code);
              console.log("Message: " + res.data.transactions[0].error.message);
            }
            this.msg = "Please try again later.";
          }
        })
        .catch(err => {
          console.log(err);
          this.resp = err;

          this.status = "error";
          this.msg = "Transaction cannot be refunded.";
        })
        .finally(function() {
          $("#btn-confirm-refund").removeClass("loading");
          $("#btn-refund").removeClass("disabled");
          $("#refund-confirmation-modal").modal("hide");

          setTimeout(function() {
            $("#refund-status-modal")
              .modal({
                inverted: true,
                blurring: true
              })
              .modal("show");
          }, 500);
        });
    },
    sendMessage(to, tokens, from="no-reply@reddotpay.com") {
      axios
        .post(
          process.env.VUE_APP_ROOT_API + "/notify",
          {
            type: "email",
            from: from,
            to: to,
            subject: "dummy",
            contentType: "text/html",
            template: "d-23bbde9c3ad945579b1c20fb110d83c7",
            message: "dummy",
            token: tokens
          },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            }
          }
        )
        .then(res => {
          console.log(res);

        })
        .catch(err => {
          console.log(err);
        })
        .finally(function() {});
    },
    monthToDate() {
      let date = new Date();

      let yyyy = date.getFullYear();
      let mm = (date.getMonth() + 1).toString();
      if (mm < 10) {
        mm = "0" + mm;
      }
      let dd = date.getDate().toString();
      if (dd.length == 1) {
        dd = "0" + dd;
      }

      return yyyy + "-" + mm + "-" + dd + "T00:00:00Z";
    }
  }
};
</script>

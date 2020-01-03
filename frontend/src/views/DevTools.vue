<template>
  <div class="ui paddedSides" id="main">
    <div v-if="admin" class="ui segment">
      <b>Raw output:</b>
      <button class="ui button" @click="showState">Show state</button>
      <br>
      <br>
      <textarea id="rawOutput"></textarea>
      <hr>

      <div class="ui two column grid">
        <div class="row">
          <div class="column">
            <h4>MAM interactions</h4>
            <div class="ui labeled input">
              <div class="ui label">Merch ID</div>
              <input id="merchId">&nbsp;
              <button @click="setMerchId">Set ID</button>
            </div>
          </div>
          <div class="column">
            <h4>Auth interactions</h4>
            <button class="ui button" @click="oauth">OAuth Token</button>
          </div>
        </div>
        <div class="row">
          <div class="column">
            <h4>Cardpay interactions</h4>
            
            <div class="ui labeled input">
              <div class="ui label">Order ID</div>
              <input id="merchId">
            </div><br><br>
            <div class="ui labeled input">
              <div class="ui label">Amount</div>
              <input id="merchId">
            </div><br><br>
            <div class="ui labeled input">
              <div class="ui label">Currency</div>
              <input id="merchId">
            </div><br><br>
              <button @click="setMerchId">Refund</button>
              <button @click="setMerchId">Void</button>
          </div>
          <div class="column">
            <h4>AltPay interactions</h4>

            
            <div class="ui labeled input">
              <div class="ui label">Order ID</div>
              <input id="merchId">
            </div><br><br>
            <div class="ui labeled input">
              <div class="ui label">Amount</div>
              <input id="merchId">
            </div><br><br>
            <div class="ui labeled input">
              <div class="ui label">Currency</div>
              <input id="merchId">
            </div><br><br>
              <button @click="setMerchId">Refund</button>
              <button @click="setMerchId">Void</button>
          
          </div>
        </div>
        <div class="row">
          <div class="column">
            <h4>Custom Queries</h4>
            <div class="ui labeled input">
              <div class="ui label">DB name</div>
              <input id="dbName">
            </div>&nbsp;
            <button class="ui button" @click="deepQuery">Get</button>
            <div v-if="dbLoading" class="ui active inline loader"></div>
            <br>
            <br>
            <textarea id="sqlQuery"></textarea>
          </div>
          <div class="column">
            <h4>S3 retrieval</h4>
            <div class="ui labeled input">
              <div class="ui label">Key</div>
              <input id="csvKey" type="text">
            </div>&nbsp;
            <button class="ui button" @click="presignURL">Get</button>
            <br>
            <br>
            <a id="psurl" href>link</a>
          </div>
          <div class="column">Usable Merchant IDs:
            <br>TX: abc123
            <br>90d587c6-ba1f-494e-a996-46b1559d811c
            <br>Billing/Funding: D41D8CD98F00B204E9800998ECF8427E
            <br>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="ui segment">
      <h3>Access Denied</h3>
      <p>No permissions.</p>
    </div>
  </div>
</template>

<script>
import store from "../store";
import axios from "axios";
import Header from "../components/Header.vue";

export default {
  mounted: async () => {
    store.commit("globalView", "Dev tooling");
  },
  data() {
    return {
      dbLoading: false
    };
  },
  computed: {
    rawState() {
      return JSON.stringify(this.$store.state);
    },
    admin() {
      if (this.$store.state.credentials.role == "Admin") {
        return true;
      }
    }
  },
  methods: {
    deepQuery() {
      this.dbLoading = true;
      let db = document.getElementById("dbName").value;
      let queryString = document.getElementById("sqlQuery").value;

      let body = {
        db: db,
        sql: queryString
      };

      console.log(body);
      axios.post(process.env.VUE_APP_ROOT_API + "/deep", JSON.stringify(body))
      .then( res => {
        let output = document.getElementById("rawOutput");
        output.value = res.data.key;
        console.log(res.data.key);

        store.commit("dataKey", res.data.key);
        this.dbLoading = false;
      });
    },
    presignURL() {
      let x = this.$sso.getSSOData();
      console.log(x);

      console.log("get presignURL");

      let key = document.getElementById("csvKey").value;
      let link = document.getElementById("psurl");

      axios
        .get(process.env.VUE_APP_ROOT_API + "/retrieve?key=" + key)
        .then(res => {
          let output = document.getElementById("rawOutput");
          output.value = res.data;
          this.dbLoading = false;
        })
        .then(res => {
          axios
            .get(process.env.VUE_APP_ROOT_API + "/presign?key=" + key)
            .then(res => {
              console.log(res.data);
              link.innerText = res.data;
              link.href = res.data;
            });
        });
    },
    oauth(){
      let headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic Nm1idHIzYmIybGQ3bTN0aG81Y2loODNnZzI6MjFndHBpbXVkMWJmc2JmNzlmdjl1ZnZhZGhxYWc0NTRwcDBwZzdwZWFuZm1sZXZxZnNo'
      }
      axios.post('https://secure.api.reddotpay.sg/oauth2/token','grant_type=client_credentials',headers)
            .then( res => {
              console.log(res.data);
            }).catch(err => {
              console.log(err)
            })
    },
    showState() {
      let output = document.getElementById("rawOutput");
      output.value = this.rawState;
    },
    setMerchId() {
      let value = document.getElementById("merchId").value;
      store.commit("merchantId", value);
    }
  }
};
</script>

<style>
#rawOutput {
  height: 180px;
  width: 100%;
}

#sqlQuery {
  height: 100px;
  width: 100%;
}
</style>

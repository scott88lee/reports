<template>
  <div id="dateSearch">
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
                <button class="ui primary icon labeled button" @click="triggerLoad">
                  <i class="search icon"></i>
                  Search
                </button>
                <button v-if="loaded" class="ui icon labeled button" @click="triggerCSV">
                  <i class="download icon"></i>
                  Download CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <span class='red'>{{this.errorMsg}}</span>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import store from "../../store";

export default {
  data() {
    return {
      errorMsg: ""
    }
  },
  computed: {
    loaded(){
      return this.$store.state.transactions.loaded;
    }
  },
  mounted: function() {
    const self = this;
    $("#rangestart").calendar({
      type: "date",
      monthFirst: false,
      endCalendar: $("#rangeend"),
      formatter: {
        date: function (date, settings) {
          if (!date) return '';
          let day = date.getDate();
          day = (day < 10)? "0" + day : day;
          let month = date.getMonth() + 1;
          month = (month < 10)? "0" + month : month;
          let year = date.getFullYear();
          return year + '-' + month + '-' + day;
        }
      },
      onChange: function(date, text, mode) {
        //Validation rules
        //Maximum 6 months into the past
        let max = new Date();
        max.setMonth(max.getMonth() - 6);

        let maxDay = max.getDate();
        maxDay = (maxDay < 10)? "0" + maxDay : maxDay;
        let maxMonth = max.getMonth() + 1;
        maxMonth = (maxMonth < 10)? "0" + maxMonth : maxMonth;
        let maxYear = max.getFullYear();

        let maxDate = maxYear + '-' + maxMonth + '-' + maxDay;

        if (maxDate > text) {
          setTimeout( ()=> {
            document.getElementById('inputStart').value = maxDate;
            self.displayError("Date selection cannot be earlier than " + maxDate);
          })
        } else {
          self.displayError('')
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
      },
      onChange: function(date, text, mode) {
        //Validation rules
        //Maximum 1 month from start date
        let limit = new Date( document.getElementById('inputStart').value );
        limit.setMonth(limit.getMonth()+1);

        let limitDay = limit.getDate();
        limitDay = (limitDay < 10)? "0" + limitDay : limitDay;
        let limitMonth = limit.getMonth() + 1;
        limitMonth = (limitMonth < 10)? "0" + limitMonth : limitMonth;
        let limitYear = limit.getFullYear();
        let output = limitYear + '-' + limitMonth + '-' + limitDay;

        if (text > output) {
          setTimeout( ()=> {
            document.getElementById('inputEnd').value = output;
            self.displayError("Date selection cannot be later than " + output);
          })
        } else {
          self.displayError('')
        }

        }
    });
    $("#inputStart").val(this.getTodaysDate());
    $("#inputEnd").val(this.getTodaysDate());
  },
  methods: {
    displayError(str){
      if (str){
        this.errorMsg = str;
      } else {
        this.errorMsg = '';
      }
    },
    triggerLoad() {

      //Form inputs, currently V-model doesn't work
      let startDate = document.getElementById("inputStart").value;
      let endDate = document.getElementById("inputEnd").value;

      if (startDate == endDate) {
        // startDate = this.convertDate(startDate);
        // endDate = this.convertDate(endDate, 1);
      } else {
        // startDate = this.convertDate(startDate);
        // endDate = this.convertDate(endDate);
      }
      this.$emit("trigger-load", startDate, endDate);
    },
    triggerCSV() {
      //Form inputs, currently V-model doesn't work
      let startDate = document.getElementById("inputStart").value;
      let endDate = document.getElementById("inputEnd").value;

      if (startDate == endDate) {
        startDate = this.convertDate(startDate);
        endDate = this.convertDate(endDate, 1);
      } else {
        startDate = this.convertDate(startDate);
        endDate = this.convertDate(endDate);
      }
      this.$emit("trigger-csv", startDate, endDate);
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
    getTodaysDate() {
      const date = new Date();
      const year = date.getFullYear();
      let month = date.getMonth() + 1;
      month = (month < 10)? "0" + month : month;
      let day = date.getDate();
      day = (day < 10)? "0" + day : day;

      return year + '-' + month + '-' + day;
    },
    sleep(waitMsec) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve("Waited...");
        }, waitMsec);
      });
    }
  }
};
</script>

<style>
.red {
  color: red;
}
</style>
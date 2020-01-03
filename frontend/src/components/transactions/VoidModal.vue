<template>
    <div>
        <div id="void-modal" class="ui void-modal modal">
            <div class="content">
                <div class="ui grid">
                    <div class="row">
                        <div class="eight wide column">
                            <div class="ui header">Transaction Details</div>
                            <table class="ui small definition table">
                                <tbody>
                                    <tr>
                                        <td>
                                            Order ID
                                        </td>
                                        <td>
                                            {{ orderId }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Payment method
                                        </td>
                                        <td>
                                            {{ ucFirst(details.payment_method) }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Payment Status
                                        </td>
                                        <td>
                                            {{ ucFirst(details.payment_status) }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Base Amount
                                        </td>
                                        <td>
                                            <div class="base-amt">
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Net amount
                                        </td>
                                        <td>
                                            <div class="net-amt">
                                            </div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Currency
                                        </td>
                                        <td>
                                            {{ details.currency }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Status
                                        </td>
                                        <td>
                                            {{ ucFirst(details.status) }}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            Timestamp
                                        </td>
                                        <td>
                                            {{ details.datetime.replace(/T|Z/gi, ' ') }}
                                        </td>
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
                                        <td>
                                            {{ event.datetime.replace(/T|Z/gi, ' ') }}
                                        </td>
                                        <td>
                                            {{ moneyFormat(event.txn_amount, details.currency) }}
                                        </td>
                                        <td>
                                            <div class="ui label">{{ ucFirst(event.action) }}</div>

                                            <div v-if="event.status == 'fail'" class="ui red label">
                                                {{ ucFirst(event.payment_status) }}
                                            </div>
                                            <div v-else-if="event.status == 'pending'" class="ui orange label">
                                                {{ ucFirst(event.payment_status) }}
                                            </div>
                                            <div v-else-if="event.status == 'success'" class="ui teal label">
                                                {{ ucFirst(event.payment_status) }}
                                            </div>
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
            </div>
            <div class="actions">
                <div class="ui deny button">
                    Cancel
                </div>
                <div id="btn-void" class="ui primary button">
                    Void
                </div>
            </div>
        </div>
        <div id="void-confirmation-modal" class="ui void-confirmation-modal mini modal">
            <div class="content">
                Confirm to do void?
            </div>
            <div class="actions">
                <div class="ui deny button">
                    Cancel
                </div>
                <div id="btn-confirm-void" class="ui ok primary button" @click.stop="doVoid()">
                    Confirm
                </div>
            </div>
        </div>
        <div id="void-status-modal" class="ui void-status-modal mini modal">
            <div class="content">
                <div v-if="(this.status).toLowerCase() == 'success'">
                    <div class="ui success message">
                        <div class="header">
                            Void successful.
                        </div>
                        <p>{{ this.msg }}</p>
                    </div>
                </div>
                <div v-else>
                    <div class="ui negative message">
                        <div class="header">
                            Void failed.
                        </div>
                        <p>{{ this.msg }}</p>
                    </div>
                </div>
            </div>
            <div class="actions">
                <div class="ui ok primary button">
                    OK
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import moment from 'moment'

export default {
    name: 'VoidModal',
    props: {
        orderId: String,
        mode: String,
        details: Object,
    },
    data() {
        return {
            resp: {},
            action: '',
            amount: 0,
            status: '',
            msg: '', // to display success or error message
        }
    },
    methods: {
        parseDate: function (utc) {
            return moment(utc).format('YYYY-MM-DD h:mm:ss A')
        },
        moneyFormat: function (number, currency = 'SGD') {
            const formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 2
            })

            return formatter.format(number)
        },
        ucFirst: function (str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        },
        doVoid: function () {
            $('#btn-confirm-void')
                .addClass('loading')
            $('#btn-void')
                .addClass('disabled')

            axios.post(
                process.env.VUE_APP_ROOT_API + '/void',
                {
                    orderId: this.orderId,
                    mode: this.mode,
                },
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    }
                }
            )
            .then((res) => {
                console.log(res)
                this.resp = res.data

                this.status = res.data.transactions[0].status
                if (this.status.toLowerCase() == "success") {
                    this.msg = "Transaction status will be reflected shortly.";
                } else if (this.status.toLowerCase() == "fail") {
                    // if error exist
                    if (res.data.transactions[0].error != "undefined") {
                        // error object has two attributes - code and message. eg. code: 1, message: "request is invalid..."
                        console.log('Code: ' + res.data.transactions[0].error.code);
                        console.log('Message: ' + res.data.transactions[0].error.message);
                    }
                    this.msg = "Please try again later.";
                }
            })
            .catch((err) => {
                console.log(err)
                this.resp = err

                this.status = "error";
                this.msg = "Transaction cannot be voided.";
            })
            .finally(function () {
                $('#btn-confirm-void')
                    .removeClass('loading')
                $('#btn-void')
                    .removeClass('disabled')
                $('#void-confirmation-modal').modal('hide')

                setTimeout(function() {
                    $('#void-status-modal')
                        .modal({
                            inverted: false,
                            blurring: true,
                        })
                        .modal('show')
                }, 500);
            })
        },
    },
    mounted() {
        $('#void-confirmation-modal')
            .modal({
                allowMultiple: true,
                inverted: true,
                blurring: true,
            })
            .modal('attach events', '#btn-void')
    }
}
</script>

const API = 'https://api.nezly.com/api/v1/';
const API_WEB = 'https://api.nezly.com/';
const API_AUTH ='https://api.nezly.com/oauth/token';

var csrf_token = null;
var client_id = 0;
var client_secret = null;
var authtoken = null;
var refresh_token = null;

var user = null;
var settings = null;
var profile = null;

var pending_nez = 0;
var confirmed_nez = 0;

var btc_nez = (btc_usd / nez_usd);
var eth_nez = (eth_usd / nez_usd);
var xlm_nez = (xlm_usd / nez_usd);
var usd_nez = (1 / nez_usd);

var nez_btc = (nez_usd / btc_usd);
var nez_eth = (nez_usd / eth_usd);
var nez_xlm = (nez_usd / xlm_usd);

var btc_minimum = (usd_minimum / btc_usd);
var eth_minimum = (usd_minimum / eth_usd);
var xlm_minimum = (usd_minimum / xlm_usd);
var nez_minimum = (usd_minimum / nez_usd);

var btc_maximum = 1000;
var eth_maximum = 10000;
var xlm_maximum = 20000000;
var nez_maximum = 40000000;
var usd_maximum = 500000;

var buy_unit = '';
var btcbuy_amount = 0;
var ethbuy_amount = 0;
var xlmbuy_amount = 0;
var usdbuy_amount = 0;

var current_transaction = null;
var current_transaction_id = 0;

function getCsrfToken()
{
    $.ajax(
    {
        type: "GET",
        url: API_WEB + 'signup',
        dataType: 'html',
        data: '',
        crossDomain: true,
        success: function(response, status, xhr)
        {
            if (xhr.status === 200)
            {
                csrf_token =  $(response).filter('meta[name="csrf-token"]').attr("content");
            }
        },
        error: function ()
        {
            console.log('Failed to retrieve CSRF token');
        },
        complete: function()
        {

        }
    });
}

function sweet_popup(pop_title, pop_text, pop_type)
{
    swal({
        title: pop_title,
        text: pop_text,
        type: pop_type,
        confirmButtonColor: '#00aeef'
    });
}

function get_client_id_secret(email, password)
{
    $.ajax(
    {
        type: "POST",
        url: API + 'auth/passwordclient',
        dataType: 'json',
        data:
            {
                _token: csrf_token,
                email: email,
                password: password,
            },
        crossDomain: true,
        success: function(response, status, xhr)
        {
            if (xhr.status === 200)
            {
                var client = response;
                client_id = client['id'];
                client_secret = client['secret'];
            }
            else
            {
                sweet_popup("Email or Password Incorrect", "The login and password you entered appear to be incorrect. Please check your entry and try again.", "warning");
            }

            login_callback(email, password);
        },
        error: function (response, status, xhr)
        {
            if (xhr === 'Unauthorized')
            {
                sweet_popup("Email or Password Incorrect", "The login and password you entered appear to be incorrect. Please check your entry and try again.", "warning");
            }
            else
            {
                sweet_popup("Problem Signing In", "There was an error attempting to login. Please try again or contact support if the problem persists. Sorry for the inconvenience.", "error");
            }
        },
        complete: function()
        {

        }
    });
}

function login()
{
    var email = $('#email').val();
    var password = $('#password').val();

    get_client_id_secret(email, password);
}

function page_new_wallet()
{
    $("#wrapper").load("templates/new.vue?r=" + Date.now(), function()
    {
        scrollToTop();

        new Vue({
            el: '#wrapper',
            data: {
            }
        });
    });
}

function page_buy()
{
    $("#wrapper").load("../templates/v2/buy.vue?r=" + Date.now(), function()
    {
        scrollToTop();

        new Vue({
            el: '#wrapper',
            data: {
                'btc_nez_value': btc_nez.toFixed(2),
                'eth_nez_value': eth_nez.toFixed(2),
                'xlm_nez_value': xlm_nez.toFixed(2),
                'min_btc': btc_minimum.toFixed(8),
                'min_eth' : eth_minimum.toFixed(8),
                'min_xlm' : xlm_minimum.toFixed(2),
                'confirmed_nez' : confirmed_nez.toFixed(2)
            }
        });

        if (user.id <= 1005 && settings.twofactor_enabled === 0)
        {
            $(".special-text").html('<strong>Congratulations! You qualify for a special EARLY BIRD SIGNUP / WHITELIST BOUNTY!<br />To claim your FREE 100 Nezly Tokens please activate Two-Factor Authentication on your account on the <a href="#" class="settings">Settings page</a>!</strong>')
        }

    });
}

function setEthStatus(text, progress) {
    var progressbar = $("#ethprogress");
    progressbar.LineProgressbar({percentage: progress});
    $("#ethstatus").html(text);
}

function copy_eth_address()
{
    var copyText = $("#ethaddress");

    if (copyText.val() === '[Please Wait - Generating Address]')
    {
        sweet_popup("Please Wait", "The Ethereum address is still being generated. If it has been more than a few minutes, please click Home and repeat the process.", "warning");
    }
    else
    {
        copyText.select();
        document.execCommand("Copy");
        sweet_popup("Copied", "The Ethereum address has been copied to your clipboard", "success");
    }
}

function copy_btc_address()
{
    var copyText = $("#btcaddress");

    if (copyText.val() === '[Please Wait - Generating Address]')
    {
        sweet_popup("Please Wait", "The Bitcoin address is still being generated. If it has been more than a few minutes, please click Home and repeat the process.", "warning");
    }
    else
    {
        copyText.select();
        document.execCommand("Copy");
        sweet_popup("Copied", "The Bitcoin address has been copied to your clipboard", "success");
    }
}

function copy_xlm_address()
{
    var copyText = $("#xlmaddress");

    if (copyText.val() === '[Please Wait - Generating Address]')
    {
        sweet_popup("Please Wait", "The Stellar address is still being generated. If it has been more than a few minutes, please click Home and repeat the process.", "warning");
    }
    else
    {
        copyText.select();
        document.execCommand("Copy");
        sweet_popup("Copied", "The Stellar address has been copied to your clipboard", "success");
    }
}



function transaction_create()
{
    current_transaction_id = 0;

    if (current_transaction !== null)
    {
        if (pending_nez === 0  || pending_nez === null)
        {
            pending_nez = parseFloat(current_transaction.nez_amount, 10)
        }
        else
        {
            pending_nez = (parseFloat(pending_nez, 10) + parseFloat(current_transaction.nez_amount, 10));
        }

        $.ajax(
        {
            type: "POST",
            url: API + 'transactions',
            dataType: 'json',
            data: current_transaction,
            crossDomain: true,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + authtoken);
            },
            success: function (response)
            {
                current_transaction_id = response.id;

                //get unique address
                if (buy_unit === 'btc' || buy_unit === 'eth')
                {
                    get_address();
                }
            },
            error: function (response)
            {
                //Failed to save record to database
                console.log("Error saving transaction to database.");
            }
        });
    }
}

function update_account()
{
    profile.nezlyaddress = $('#nezlyaddress').val();
    profile.address1 = $('#address1').val();
    profile.address2 = $('#address2').val();
    profile.city = $('#city').val();
    profile.state = $('#state').val();
    profile.zip = $('#zip').val();
    profile.country = $('#country').val();
    profile.phone = $('#phone').val();

    $.ajax(
        {
            type: "POST",
            url: API + 'users/profile',
            dataType: 'json',
            data: profile,
            crossDomain: true,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + authtoken);
            },
            success: function (response)
            {
                sweet_popup("Saved", "Your account record was saved successfully.", "success");
                page_buy();
            },
            error: function (response)
            {
                sweet_popup("Problem", "There was an error saving your info to the database. Please try again and contact us if the problem persists.", "error");
            }
        });

}

function generate_address_btc()
{
    $("#wrapper").load("../templates/v2/sendbtc.vue?r=" + Date.now(), function()
    {
        scrollToTop();

        new Vue({
            el: '#wrapper',
            data: {
                'confirmed_nez' : confirmed_nez.toFixed(2),
                'btc_nez_value': btc_nez.toFixed(2),
                'btc_buyamount' : Number(btcbuy_amount), //.toFixed(8)), // btcbuy_amount,
                'btcaddress' : '[Please Wait - Generating Address]'
            }
        });
/*
        $('#btc-copy-address').prop('onclick',null).off('click');
        $(document).on('click', '#btc-copy-address', function()
        {
            event.preventDefault();
            copy_btc_address();
        });

        $("#btcaddress").val(btc_address);
        jQuery('#btcqr').qrcode({
            text	: btc_address
        });
*/
        current_transaction =
        {
            user_id : user.id,
            buy_unit : buy_unit,
            amount : btcbuy_amount,
            nez_amount : (btcbuy_amount * btc_nez).toFixed(7),
            generated_address : btc_address,
            conversion_rate : btc_nez
        }
        transaction_create();
    });
}

function generate_address_eth()
{
    $("#wrapper").load("../templates/v2/sendeth.vue?r=" + Date.now(), function()
    {
        scrollToTop();

        new Vue({
            el: '#wrapper',
            data: {
                'confirmed_nez' : confirmed_nez.toFixed(2),
                'eth_nez_value': eth_nez.toFixed(2),
                'eth_buyamount' : Number(ethbuy_amount),
                'ethaddress' : '[Please Wait - Generating Address]'
            }
        });
/*
        $('#eth-copy-address').prop('onclick',null).off('click');
        $(document).on('click', '#eth-copy-address', function()
        {
            event.preventDefault();
            copy_eth_address();
        });

        $("#ethaddress").val(eth_address);
        jQuery('#ethqr').qrcode({
            text	: eth_address
        });
*/
        current_transaction =
        {
            user_id : user.id,
            buy_unit : buy_unit,
            amount : ethbuy_amount,
            nez_amount : (ethbuy_amount * eth_nez).toFixed(7),
            generated_address : eth_address,
            conversion_rate : eth_nez
        }
        transaction_create();
    });
}

function generate_address_xlm()
{
    $("#wrapper").load("../templates/v2/sendxlm.vue?r=" + Date.now(), function()
    {
        scrollToTop();

        new Vue({
            el: '#wrapper',
            data: {
                'confirmed_nez' : confirmed_nez.toFixed(2),
                'xlm_nez_value': xlm_nez.toFixed(2),
                'xlm_buyamount' : Number(xlmbuy_amount),
                'xlmaddress' : '[Please Wait - Generating Address]',
                'memo_text_user_id' : user.id
            }
        });

        $('#xlm-copy-address').prop('onclick',null).off('click');
        $(document).on('click', '#xlm-copy-address', function()
        {
            event.preventDefault();
            copy_xlm_address();
        });

        $("#xlmaddress").val(xlm_address);
        jQuery('#xlmqr').qrcode({
            text	: xlm_address
        });

        current_transaction =
        {
            user_id : user.id,
            buy_unit : buy_unit,
            amount : xlmbuy_amount,
            nez_amount : (xlmbuy_amount * xlm_nez).toFixed(7),
            generated_address : xlm_address,
            conversion_rate : xlm_nez
        }
        transaction_create();
    });
}

function page_faq()
{
    $("#wrapper").load("../templates/v2/faq.vue?r=" + Date.now(), function() {

        scrollToTop();

        new Vue({
            el: '#wrapper',
            data: {
                'confirmed_nez' : confirmed_nez.toFixed(2)
            }});
    });
}

function copy_bounty_referral_link()
{
    event.preventDefault();
    var copyText = $("#bountyref");

    copyText.select();
    document.execCommand("Copy");
    sweet_popup("Copied", "Your referral link has been copied.", "success");
}

function cancel_transaction()
{
    if (current_transaction === null)
    {
        sweet_popup("Problem", "There was a problem cancelling this transaction. Please refresh the page and try again.", "error");
    }
    else
    {
        swal({
            title: 'Cancel Transaction',
            text: "Are you sure you want to cancel this transaction? You should only do this if you have not already sent funds to this address.",
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#00aeef',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then(function () {

            $.ajax({

                type: "POST",
                url: API + 'transactioncancel/' + current_transaction.id,
                dataType: 'json',
                data: {
                    _token: csrf_token
                },
                crossDomain: true,
                beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Bearer " + authtoken);
                },
                success: function (response)                {
                    swal(
                        {
                            title: 'Transaction Cancelled',
                            text: "This transaction has been cancelled.",
                            type: 'success'
                        }).then(function ()
                    {
                        page_buy();
                    });
                },
                error: function (response)
                {
                    swal({
                        title: "Problem",
                        text: "There was an error cancelling this transaction. Please try again and contact support if the problem persists.",
                        type: "error"
                    });
                },
                complete: function()
                {

                }
            });
        }).catch(swal.noop);
    }
}

function show_pending_transaction()
{
    if (current_transaction === null)
    {
        //No transaction info available
        sweet_popup("Pending", "This transaction is currently pending. Once manually verified, a link will be provided to view the transaction with a block explorer link.", "info");
    }
    else
    {
        switch (current_transaction.buy_unit)
        {
            case 'xlm' : $("#wrapper").load("../templates/v2/sendxlm.vue?r=" + Date.now(), function()
                         {
                            scrollToTop();

                            new Vue({
                                el: '#wrapper',
                                data: {
                                    'confirmed_nez' : confirmed_nez.toFixed(2),
                                    'xlm_nez_value': current_transaction.conversion_rate.toFixed(2),
                                    'xlm_buyamount' : Number(current_transaction.amount),
                                    'xlmaddress' : current_transaction.generated_address,
                                    'memo_text_user_id' : user.id
                                }
                            });

                            $('#xlm-copy-address').prop('onclick',null).off('click');
                            $(document).on('click', '#xlm-copy-address', function()
                            {
                                event.preventDefault();
                                copy_xlm_address();
                            });

                            $("#xlmaddress").val(current_transaction.generated_address);
                            jQuery('#xlmqr').qrcode({
                                text	: current_transaction.generated_address
                            });

                            $("#xlm-cancel-transaction-div").show();
                        });

                break;
            case 'btc' : $("#wrapper").load("../templates/v2/sendbtc.vue?r=" + Date.now(), function()
                        {
                            scrollToTop();

                            new Vue({
                                el: '#wrapper',
                                data: {
                                    'confirmed_nez' : confirmed_nez.toFixed(2),
                                    'btc_nez_value': current_transaction.conversion_rate.toFixed(2),
                                    'btc_buyamount' : Number(current_transaction.amount), //.toFixed(8)), // btcbuy_amount,
                                    'btcaddress' : current_transaction.generated_address
                                }
                            });

                            $('#btc-copy-address').prop('onclick',null).off('click');
                            $(document).on('click', '#btc-copy-address', function()
                            {
                                event.preventDefault();
                                copy_btc_address();
                            });

                            $("#btcaddress").val(current_transaction.generated_address);
                            jQuery('#btcqr').qrcode({
                                text	: current_transaction.generated_address
                            });

                            $("#btc-cancel-transaction-div").show();
                        });
                         break;
            case 'eth' : $("#wrapper").load("../templates/v2/sendeth.vue?r=" + Date.now(), function()
                        {
                            scrollToTop();

                            new Vue({
                                el: '#wrapper',
                                data: {
                                    'confirmed_nez' : confirmed_nez.toFixed(2),
                                    'eth_nez_value': current_transaction.conversion_rate.toFixed(2),
                                    'eth_buyamount' : Number(current_transaction.amount),
                                    'ethaddress' : current_transaction.generated_address
                                }
                            });

                            $('#eth-copy-address').prop('onclick',null).off('click');
                            $(document).on('click', '#eth-copy-address', function()
                            {
                                event.preventDefault();
                                copy_eth_address();
                            });

                            $("#ethaddress").val(current_transaction.generated_address);
                            jQuery('#ethqr').qrcode({
                                text	: current_transaction.generated_address
                            });

                            $("#eth-cancel-transaction-div").show();
                        });
                         break;
            default: sweet_popup("Pending", "This transaction is currently pending. Once manually verified, a link will be provided to view the transaction with a block explorer link.", "info");
        }
    }
}

function page_transactions()
{
    $("#wrapper").load("../templates/v2/transactions.vue?r=" + Date.now(), function() {

        scrollToTop();

        new Vue({
            el: '#wrapper',
            data: {
                'confirmed_nez' : confirmed_nez.toFixed(2)
            },
            mounted: function () {

                $.ajax(
                {
                    type: "GET",
                    url: API + 'users/transactions',
                    dataType: 'json',
                    data: {
                        _token: csrf_token
                    },
                    crossDomain: true,
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authorization", "Bearer " + authtoken);
                    },
                    success: function (response)
                    {
                        var txndata = response;
                        var txn_table_html = '';
                        var num_txn = txndata.length;
                        var num_txn_html = ' ' + num_txn + ' Transaction';

                        if (num_txn !== 1)
                        {
                            num_txn_html += 's';
                        }

                        $("#transaction_count").html(num_txn_html);

                        if (num_txn === 0)
                        {
                            txn_table_html += '<tr><td colspan="5">No Transactions Yet</td></tr>';
                        }
                        else
                        {
                            $.each(txndata, function (key, rec)
                            {
                                txn_table_html += '<tr class="txn-table-row txn-click" data-url="';

                                //Show link to transaction on blockchain if available
                                if (rec['txhash'] !== '')
                                {
                                    switch (rec['buy_unit'])
                                    {
                                        case 'btc' :
                                            txn_table_html += btc_explorer_link;
                                            break;
                                        case 'eth' :
                                            txn_table_html += eth_explorer_link;
                                            break;
                                        case 'xlm' :
                                            txn_table_html += xlm_explorer_link;
                                            break;
                                        default :
                                            txn_table_html += 'popup';
                                    }
                                    txn_table_html += rec['txhash'];
                                }
                                else
                                {
                                    txn_table_html += rec['status'];

                                    if (rec['status'] === 'pending')
                                    {
                                        current_transaction = rec;
                                    }
                                }

                                txn_table_html += '">';
                                txn_table_html += '<td data-label="Txn #"><span class="nezly-blue font-bold">Txn #' + (key + 1) + '</span></td>';
                                txn_table_html += '<td data-label="Time">' + rec['created_at'] + '</td>';
                                txn_table_html += '<td data-label="Amount">' + rec['amount'] + ' ' + rec['buy_unit'].toUpperCase() + '</td>';
                                txn_table_html += '<td data-label="NEZ Amount">' + rec['nez_amount'] + ' NEZ</td>';
                                txn_table_html += '<td data-label="Status">';
                                if (rec['status'] === 'success')
                                {
                                    txn_table_html += '<span class="text-nowrap"><img src="images/complete.png" class="compl" />&nbsp; Complete</span>';
                                }
                                else if (rec['status'] === 'pending')
                                {
                                    txn_table_html += '<span class="text-nowrap"><img src="images/status.png" class="compl" />&nbsp; Pending</span>';
                                }
                                else if (rec['status'] === 'cancelled')
                                {
                                    txn_table_html += '<span class="text-nowrap"><img src="images/cancelled.png" class="compl" />&nbsp; Cancelled</span>';
                                }
                                txn_table_html += '</td></tr>';
                            });
                        }
                        $("#transaction-body").html(txn_table_html);
                    },
                    error: function (response)
                    {
                        $("#transaction-body").html('<tr><td colspan="5">Error Loading Transactions. Refresh the page and try again and contact us if the problem persists.</td>');
                        sweet_popup("Problem", "There was an error retrieving your transaction data. Please try again and contact us if the problem persists.", "error");
                    }
                });
            }
        });

    });
}

function confirmed_nez_popup()
{
    sweet_popup("Confirmed NEZ", "This value shows confirmed Nezly Tokens. Confirmations for the presale are handled manually. Your pending amount is: [" + pending_nez.toFixed(2) + " NEZ]", "info");
}

function disable_2fa()
{
    $.ajax(
    {
        type: "POST",
        url: API + 'users/disableauthy',
        dataType: 'json',
        data: {
            _token: csrf_token
        },
        crossDomain: true,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + authtoken);
        },
        success: function (response)
        {
            sweet_popup("2FA Deactivated", "Two factor authentication has been deactivated on your account.", "success");
            settings = response;
            page_settings();
        },
        error: function (response)
        {
            sweet_popup("Unknown Error", "There was an unknown error and we could not deactivate 2FA on your account. Please try again at a later time or contact us if the problem persists.", "error");
        }
    });

}

function activate_2fa()
{
    var user_entered_code = $("#user_entered_authy_code").val();

    if (user_entered_code === '')
    {
        sweet_popup("Problem", "Please enter the six digit code from your Authy or Google Authenticator app.", "error");
    }
    else
    {
        $.ajax(
        {
            type: "POST",
            url: API + 'users/activateauthy',
            dataType: 'json',
            data: {
                'usercode' : user_entered_code,
                _token: csrf_token
            },
            crossDomain: true,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Bearer " + authtoken);
            },
            success: function (response)
            {
                sweet_popup("2FA Activated", "Two factor authentication has been activated on your account.", "success");

                //TODO: credit Nezly tokens if applicable

                settings = response;
                load_user(page_settings);
            },
            error: function (response)
            {
                sweet_popup("Incorrect Code", "You have entered an incorrect code or this code has expired. Please try again.", "error");
            }
        });
    }
}

function page_settings()
{
    $("#wrapper").load("../templates/v2/settings.vue?r=" + Date.now(), function() {

        scrollToTop();

        new Vue(
        {
            el: '#wrapper',
            data: {
                'confirmed_nez' : confirmed_nez.toFixed(2)
            },
            mounted: function ()
            {
                if (settings.twofactor_enabled === 0)
                {
                    $.ajax(
                    {
                        type: "GET",
                        url: API + 'users/authy',
                        dataType: 'json',
                        data: {
                            _token: csrf_token
                        },
                        crossDomain: true,
                        beforeSend: function (xhr) {
                            xhr.setRequestHeader("Authorization", "Bearer " + authtoken);
                        },
                        success: function (response)
                        {
                            $('.authy-div').html('<div class="form-group text-center row no-padding-top"><form method="post" action="#"><div class="col-sm-6"><h3>QR Secret Code:</h3><div id="authy-qrcode" class="qrback" style="width: 300px;"></div></div><div class="col-sm-6"><h3>Manual Secret Code:</h3><input id="manual_authy_code" type="text" class="text-center all_field" value="' + response.secret + '"><p>&nbsp;</p><h3>Enter Code to Activate:</h3><input id="user_entered_authy_code" type="text" class="text-center all_field"><div class="all_fields"><input class="button-enable-2fa" type="submit" value="SAVE AND ACTIVATE" /></div></div></form></div>');

                            jQuery('#authy-qrcode').qrcode({
                                text	: response.qrcode
                            });
                        },
                        error: function (response)
                        {
                            $('.authy-div').html('<p>&nbsp;</p><p>An unknown error occurred and we are unable to generated a OTP code at this time. Please refresh the page or try again at another time.</p><p>&nbsp;</p>');
                        }
                    });
                }
                else
                {
                    show_2fa_enabled();
                }
            }
        });
    });
}

function show_2fa_enabled()
{
    $('.authy-div').html('<div class="text-center"><h3>Two-Factor (2FA) Authentication is Enabled</h3><div class="all_fields"><input class="button-disable-2fa" type="submit" value="DISABLE 2FA" /></div></div>'); //TODO: button to turn off

}

function page_account()
{
    $("#wrapper").load("../templates/v2/account.vue?r=" + Date.now(), function() {

        scrollToTop();

        if (pending_nez === null || pending_nez === undefined)
        {
            pending_nez = 0;
        }

        if (confirmed_nez === null || confirmed_nez === undefined)
        {
            confirmed_nez = 0;
        }

        //For UTF-8mb4 and problematic charset names
        var decoded_first_name;
        var decoded_last_name;

        try
        {
            decoded_first_name = decodeURIComponent(escape(user.first_name));
        }
        catch(e)
        {
            decoded_first_name = user.first_name;
        }

        try
        {
            decoded_last_name = decodeURIComponent(escape(user.last_name));
        }
        catch(e)
        {
            decoded_last_name = user.last_name;
        }

        new Vue({
            el: '#wrapper',
            data: {
                'confirmed_nez' : confirmed_nez.toFixed(2),
                'account_name': decoded_first_name + ' ' + decoded_last_name,
                'account_email': user.email,
                profile: profile,
                pending_nez: pending_nez.toFixed(2) //parseFloat(pending_nez, 10),
            }});

        $("#account-form").validate(
            {
                submitHandler: function (form) {
                    update_account();
                },
                rules: {

                },
                errorPlacement: function (error, element) {
                    error.appendTo(element.parent("div").next("div"));
                }
            });
    });
}

function check_for_pending_transaction()
{
    $.ajax(
    {
        type: "GET",
        url: API + 'transactionspending',
        dataType: 'json',
        data: { _token: csrf_token },
        crossDomain: true,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + authtoken);
        },
        success: function (response)
        {
            current_transaction = response;

            swal(
                {
                    title: 'Pending Transaction Exists',
                    text: "You have an outstanding pending transaction. Please complete this transaction first or cancel it to start another.",
                    type: 'warning'
                }).then(function ()
            {
                show_pending_transaction();
            });
        },
        error: function (response)
        {

        }
    });
}

function page_buy_with_btc()
{
    buy_unit = 'btc';

    $("#wrapper").load("../templates/v2/buybtc.vue?r=" + Date.now(), function()
    {
        scrollToTop();

        new Vue({
            el: '#wrapper',
            data: {
                'confirmed_nez' : confirmed_nez.toFixed(2),
                'btc_nez_value': btc_nez.toFixed(2),
                'min_btc': btc_minimum.toFixed(8),
                'min_nez': nez_minimum
            }
        });

        check_for_pending_transaction();

        $("#btc-form").validate(
            {
                submitHandler: function (form) {
                    btcbuy_amount = $("#btcamount").val();
                    generate_address_btc();
                },
                rules: {
                    btcamount: {
                        required: true,
                        number: true,
                        min: btc_minimum,
                        max: btc_maximum
                    },
                    btcnezamount: {
                        required: true,
                        number: true,
                        min: nez_minimum,
                        max: nez_maximum
                    }
                },
                errorPlacement: function (error, element) {
                    error.appendTo(element.parent("div").next("div"));
                }
            });

        $("#btcamount").on("change click keyup", function ()
        {
            if ($.isNumeric($("#btcamount").val()))
            {
                var btcnez = parseFloat($("#btcamount").val(), 10) * btc_nez;
                $("#btcnezamount").val(btcnez.toFixed(7));
            }
        });

        $("#btcnezamount").on("change click keyup", function ()
        {
            if ($.isNumeric($("#btcnezamount").val()))
            {
                var btc = parseFloat($("#btcnezamount").val(), 10) * nez_btc;
                $("#btcamount").val(btc.toFixed(8));
            }
        });

    });
}

function page_buy_with_eth()
{
    buy_unit = 'eth';

    $("#wrapper").load("../templates/v2/buyeth.vue?r=" + Date.now(), function()
    {
        scrollToTop();

        new Vue({
            el: '#wrapper',
            data: {
                'confirmed_nez' : confirmed_nez.toFixed(2),
                'eth_nez_value': eth_nez.toFixed(2),
                'min_eth' : eth_minimum.toFixed(8),
                'min_nez' : nez_minimum
            }
        });

        check_for_pending_transaction();

        $("#eth-form").validate(
            {
                submitHandler: function (form) {
                    ethbuy_amount = $("#ethamount").val();
                    generate_address_eth();
                },
                rules: {
                    ethamount: {
                        required: true,
                        number: true,
                        min: eth_minimum,
                        max: eth_maximum
                    },
                    ethnezamount: {
                        required: true,
                        number: true,
                        min: nez_minimum,
                        max: nez_maximum
                    }
                },
                errorPlacement: function (error, element) {
                    error.appendTo(element.parent("div").next("div"));
                }
            });

        $("#ethamount").on("change click keyup", function ()
        {
            if ($.isNumeric($("#ethamount").val()))
            {
                var ethnez = parseFloat($("#ethamount").val(), 10) * eth_nez;
                $("#ethnezamount").val(ethnez.toFixed(7));
            }
        });

        $("#ethnezamount").on("change click keyup", function ()
        {
            if ($.isNumeric($("#ethnezamount").val()))
            {
                var eth = parseFloat($("#ethnezamount").val(), 10) * nez_eth;
                $("#ethamount").val(eth.toFixed(8));
            }
        });
    });
}

function page_buy_with_xlm()
{
    buy_unit = 'xlm';

    $("#wrapper").load("../templates/v2/buyxlm.vue?r=" + Date.now(), function()
    {
        scrollToTop();

        new Vue({
            el: '#wrapper',
            data: {
                'confirmed_nez' : confirmed_nez.toFixed(2),
                'xlm_nez_value': xlm_nez.toFixed(7),
                'min_xlm' : xlm_minimum.toFixed(8),
                'min_nez' : nez_minimum
            }
        });

        check_for_pending_transaction();

        $("#xlm-form").validate(
            {
                submitHandler: function (form) {
                    xlmbuy_amount = $("#xlmamount").val();
                    generate_address_xlm();
                },
                rules: {
                    xlmamount: {
                        required: true,
                        number: true,
                        min: xlm_minimum,
                        max: xlm_maximum
                    },
                    xlmnezamount: {
                        required: true,
                        number: true,
                        min: nez_minimum,
                        max: nez_maximum
                    }
                },
                errorPlacement: function (error, element) {
                    error.appendTo(element.parent("div").next("div"));
                }
            });

        $("#xlmamount").on("change click keyup", function ()
        {
            if ($.isNumeric($("#xlmamount").val()))
            {
                var xlmnez = parseFloat($("#xlmamount").val(), 10) * xlm_nez;
                $("#xlmnezamount").val(xlmnez.toFixed(7));
            }
        });

        $("#xlmnezamount").on("change click keyup", function ()
        {
            if ($.isNumeric($("#xlmnezamount").val()))
            {
                var xlm = parseFloat($("#xlmnezamount").val(), 10) * nez_xlm;
                $("#xlmamount").val(xlm.toFixed(8));
            }
        });
    });
}

function page_buy_with_usd()
{
    if (profile.address1 === '' || profile.city === '' || profile.country === '' || profile.zip === '' || profile.phone === '')
    {
        sweet_popup("Address Required", "Please fill in your address and phone number before attempting to purchase via wire transfer.", "warning");
    }
    else
    {
        $("#wrapper").load("../templates/v2/buyusd.vue?r=" + Date.now(), function()
        {
            scrollToTop();

            new Vue({
                el: '#wrapper',
                data: {
                    'confirmed_nez' : confirmed_nez.toFixed(2),
                    'usd_nez_value': usd_nez.toFixed(7),
                    'min_usd' : usd_minimum.toFixed(2),
                    'min_nez' : nez_minimum
                }
            });

            $("#usd-form").validate(
                {
                    submitHandler: function (form) {
                        usdbuy_amount = $("#usdamount").val();
                        generate_invoice();
                    },
                    rules: {
                        usdamount: {
                            required: true,
                            number: true,
                            min: usd_minimum,
                            max: usd_maximum
                        },
                        usdnezamount: {
                            required: true,
                            number: true,
                            min: nez_minimum,
                            max: nez_maximum
                        }
                    },
                    errorPlacement: function (error, element) {
                        error.appendTo(element.parent("div").next("div"));
                    }
                });

            $("#usdamount").on("change click keyup", function ()
            {
                if ($.isNumeric($("#usdamount").val()))
                {
                    var usdnez = parseFloat($("#usdamount").val(), 10) * usd_nez;
                    $("#usdnezamount").val(usdnez.toFixed(7));
                }
            });

            $("#usdnezamount").on("change click keyup", function ()
            {
                if ($.isNumeric($("#usdnezamount").val()))
                {
                    var usd = parseFloat($("#usdnezamount").val(), 10) * nez_usd;
                    $("#usdamount").val(usd.toFixed(2));
                }
            });
        });
    }
}

function generate_invoice()
{
    page_payment();
}

function page_payment()
{
    $("#wrapper").load("../templates/v2/payment.vue?r=" + Date.now(), function() {

        scrollToTop();

        new Vue({
            el: '#wrapper',
            data: {
                'confirmed_nez' : confirmed_nez.toFixed(2)
            }
        });

    });
}

function payment_sent()
{
    sweet_popup("Thank you", "We will notifiy you immediately upon receipt and credit your account accordingly.", "success");
    page_buy();
}

function check_for_2fa()
{
    if (settings.twofactor_enabled === 1) {

        swal({
            title: 'Enter your authenticator code',
            input: 'number',
            showCancelButton: false,
            confirmButtonText: 'Submit Code',
            preConfirm: function (code) {
                return new Promise(function (resolve, reject) {
                    if (code.length === 6) {
                        $.ajax(
                            {
                                type: "POST",
                                url: API + 'users/verifyauthy',
                                dataType: 'json',
                                data: {usercode: code},
                                crossDomain: true,
                                beforeSend: function (xhr) {
                                    xhr.setRequestHeader("Authorization", "Bearer " + authtoken);
                                },
                                success: function (response, status, xhr) {
                                    if (xhr.status === 200) {
                                        Cookies.set('authtoken', authtoken);
                                        resolve();
                                    }
                                    else
                                    {
                                        swal({
                                            type: 'error',
                                            title: 'Incorrect Code',
                                            html: 'Sorry, the code you entered appears to be incorrect or has expired.'
                                        }).then(function () {
                                                swal.close();
                                            }
                                        );
                                    }
                                },
                                error: function (response) {
                                    reject("Sorry, the code you entered appears to be incorrect or has expired.");
                                }
                            });
                    }
                    else {
                        reject("Please enter 6 digits.");
                    }
                })
            },
            allowOutsideClick: false
        }).then(function (code) {

            page_buy();
        })
            .catch(swal.noop);
    }
    else
    {
        Cookies.set('authtoken', authtoken);
        page_buy();
    }
}

function load_user(callback)
{
    $.ajax(
    {
        type: "GET",
        url: API + 'users/me',
        dataType: 'json',
        data: {
            _token: csrf_token
        },
        crossDomain: true,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + authtoken);
        },
        success: function (response)
        {
            var userdata = response;
            user = userdata.user;
            settings = userdata.settings;
            profile = userdata.profile;

            pending_nez = userdata.pendingnez;
            confirmed_nez = userdata.confirmednez;

            if (pending_nez === null || pending_nez === undefined)
            {
                pending_nez = 0;
            }

            if (confirmed_nez === null || confirmed_nez === undefined)
            {
                confirmed_nez = 0;
            }

            //console.log(userdata);
            //Cookies.set('authtoken', authtoken);

            if (user.active === 'n')
            {
                page_unverified();
            }
            else
            {
                if ($.isFunction(callback)) {
                    callback();
                }
            }
        },
        error: function (response)
        {
            if (response.status === 401)
            {
                user = null;
                window.location.href = "/logout/logout-redirect.php";
            }
            else
            {
                sweet_popup("Problem", "There was an error retrieving your info. Please refresh the page and try again", "error");
            }
        }
    });
}

function login_callback(email, password)
{
    $.ajax(
    {
        type: "POST",
        url: API_AUTH,
        dataType: 'json',
        data:
        {
            _token: csrf_token,
            grant_type: 'password',
            username: email,
            password: password,
            client_id: client_id,
            client_secret: client_secret,
            scope: '*'
        },
        crossDomain: true,
        success: function(response, status, xhr)
        {
            if (xhr.status === 200)
            {
                var resp = response;
                authtoken = resp['access_token'];
                refresh_token = resp['refresh_token'];
                load_user(check_for_2fa);
            }
            else
            {
                sweet_popup("Problem Signing In", "There was an error attempting to login. Please try again or contact support if the problem persists. Sorry for the inconvenience.", "error");
            }
        },
        error: function ()
        {
            sweet_popup("Problem Signing In", "There was an error attempting to login. Please try again or contact support if the problem persists. Sorry for the inconvenience.", "error");
        },
        complete: function()
        {

        }
    });
}

function check_captcha()
{
    /*
     alert(grecaptcha.getResponse());

     $.ajax(
     {
     type: "POST",
     url: API + 'captcha',
     dataType: 'html',
     data: {
     _token: csrf_token,
     captcha: grecaptcha.getResponse()
     },
     crossDomain: true,
     success: function (response, status, xhr) {
     if (xhr.status === 200)
     {

     }
     else
     {
     sweet_popup("Problem", "An error occured. Please contact support@nezly.com if the problem persists. Sorry for the inconvenience.", "error");
     }
     },
     error: function (response)
     {
     console.log(response);
     },
     complete: function () {

     }
     });
     */
}

function register()
{
    var firstname = $('#firstname').val();
    var lastname = $('#lastname').val();
    var email = $('#email').val();
    var password = $('#password').val();
    var confirmpassword = $('#confirmpassword').val();
    var refid = $('#refid').val();
    var refurl = $('#refurl').val();
    var checkmail_html;

    if ($('#chkterms').is(':checked'))
    {
        $.ajax(
            {
                type: "POST",
                url: API + 'users/signup',
                dataType: 'json',
                data: {
                    _token: csrf_token,
                    firstname: firstname,
                    lastname: lastname,
                    email: email,
                    password: password,
                    confirmpassword: confirmpassword,
                    refid: refid,
                    refurl: refurl
                },
                crossDomain: true,
                success: function (response, status, xhr) {
                    if (xhr.status === 200)
                    {
                        checkmail_html = '<div class="checkmail"><p class="all_paragraph">WE HAVE SENT AN EMAIL TO ' + email + '<br />';
                        checkmail_html += '<span class="span1">Please follow the link in the email to activate your account.<br />Please look for an email from <strong>support@nezly.com</strong>. Also check your spam folder if you do not receive it within a few minutes.</span><br /><br /><span class="span2">Have questions? Contact us at support@nezly.com</span></p></div>';

                        $(".main_container").html(checkmail_html);
                    }
                    else
                    {
                        sweet_popup("Problem", "An error occured. Please contact support@nezly.com if the problem persists. Sorry for the inconvenience.", "error");
                    }
                },
                error: function (response) {
                    //console.log(response);
                    if (response.status === 201 || response.status === 403)
                    {
                        sweet_popup("Problem", response.responseText, "error");
                    }
                    else if (response.status === 202)
                    {
                        checkmail_html = '<div class="checkmail"><p class="all_paragraph">WE HAVE ATTEMPTED TO SEND AN EMAIL TO ' + email + '<br />';
                        checkmail_html += '<span class="span1">However, there was a rare internal error that occured.</span><br /><br /><span class="span2">We will try to contact you from support@nezly.com to manually activate your account.</span></p></div>';

                        $(".main_container").html(checkmail_html);
                        sweet_popup("Problem", response.responseText, "error");
                    }
                    else
                    {
                        sweet_popup("Problem", "There was an error attempting to register. Please try again or contact support if the problem persists. Sorry for the inconvenience.", "error");
                    }
                },
                complete: function () {

                }
            });
    }
    else
    {
        sweet_popup("Terms and Conditions", "To continue, please read the terms and conditions and check the checkbox if you agree.", "warning");
    }
}

function scrollToTop(element)
{
    if (element === undefined)
    {
        element = "body,html";
    }
    $(element).animate({
        scrollTop: 0
    }, 800);
}

function destroyAuthCookie()
{
    Cookies.remove('authtoken');
    Cookies.remove('authtoken', { path: '/' });
}

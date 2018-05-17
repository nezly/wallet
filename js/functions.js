const STELLAR_SERVER = 'https://horizon.stellar.org';
const NEZ_ISSUER = 'GDGKBRCPW4C3ENNC5C64PE6U33MG52GBKFXOK5P3OSWF74DAOXRXV6OJ';
const XLM_TRANSACTION_COST = 1.0001;

var csrf_token = null;
var client_id = 0;
var client_secret = null;
var authtoken = null;
var refresh_token = null;

var key_pair = null;
var public_key = null;
var secret_key = null;
var server = null;
var stellar_account = null;
var xlm_total = 0;
var nez_total = 0;

function sweet_popup(pop_title, pop_text, pop_type)
{
    swal({
        title: pop_title,
        text: pop_text,
        type: pop_type,
        confirmButtonColor: '#00aeef'
    });
}

function login()
{
    secret_key = $('#secretkey').val();

    try
    {
        key_pair = StellarSdk.Keypair.fromSecret(secret_key);
        public_key = key_pair.publicKey();
        //sweet_popup("Public", '' + public_key, "success");
        page_wallet();
    }
    catch (err)
    {
        sweet_popup("Problem", 'It appears that you have entered an invalid secret key. Please check the key and try again.', "error");
    }
}

function check_payment_values()
{
    var asset_value = $("#asset").val();
    var amount = $("#amount").val();

    if (asset_value !== '1' && asset_value !== '2')
    {
        sweet_popup("Select Asset Type", 'Please select asset type before continuing.', "warning");
        return false;
    }

    if (asset_value === '1') //XLM
    {
        if (parseFloat(amount) > (parseFloat(xlm_total) - parseFloat(XLM_TRANSACTION_COST)))
        {
            sweet_popup("Amount Exceeds Funds", 'This transaction requires at least ' + XLM_TRANSACTION_COST + ' to be remaining in your XLM account after the transaction.', "warning");
            return false;
        }
    }
    else if (asset_value === '2') //NEZ
    {
        if (parseFloat(xlm_total) < parseFloat(XLM_TRANSACTION_COST))
        {
            sweet_popup("Need Minimum XLM", 'This transaction requires at least ' + XLM_TRANSACTION_COST + ' to be in your XLM account.', "warning");
            return false;
        }
        else
        {
            if (parseFloat(amount) > parseFloat(nez_total))
            {
                sweet_popup("Amount Exceeds Funds", 'You do not have sufficient amount of NEZ to execute this payment.', "warning");
                return false;
            }
        }
    }

    return true;
}

function page_wallet()
{
    var nez_accepted = false;
    xlm_total = 0;
    nez_total = 0;

    $("#wrapper").load("templates/wallet.vue?r=" + Date.now(), function()
    {
        scrollToTop();
        $("#nez_line").hide();

        server = new StellarSdk.Server(STELLAR_SERVER);
        StellarSdk.Config.setAllowHttp(true);

        new Vue({
            el: '#wrapper',
            data: {
                public_key: public_key
            },
            mounted: function() {

                $("#payment-form").validate(
                {
                    submitHandler: function (form)
                    {
                        if (check_payment_values() === true)
                        {
                            page_preview_payment();
                        }
                    },
                    rules:
                    {
                        toaddress:
                        {
                            required: true,
                            secretStartsWithG: true,
                            minlength: 56,
                            maxlength: 56,
                        },
                        amount:
                        {
                            required: true,
                            number: true,
                            range: [0.0001, 10000000],
                        }
                    },
                    messages: {},
                    errorElement : 'div',
                    errorLabelContainer: '.errortxt'
                });

                server.loadAccount(public_key)
                    .then(function(account) {

                        $.each(account.balances, function (key, asset)
                        {
                            if (asset.asset_type === 'native')
                            {
                                xlm_total = asset.balance;
                                $('#asset').append($('<option>', {
                                    value: 1,
                                    text: 'XLM'
                                }));
                            }
                            else if (asset.asset_code === 'NEZ' && asset.asset_issuer === NEZ_ISSUER)
                            {
                                nez_total = asset.balance;
                                $("#nez_line").show();
                                $('#asset').append($('<option>', {
                                    value: 2,
                                    text: 'NEZ'
                                }));
                                nez_accepted = true;
                            }
                            //console.log(asset);
                        });
                        $("#xlmtotal").html(xlm_total);
                        $("#neztotal").html(nez_total);

                        //Check if conditions met to change trust line to accept NEZ
                        if (!nez_accepted)
                        {
                            setTimeout(function() { change_trust_allow_nez(); }, 5000);
                        }

                        //Sort dropdown list by value
                        sort_dropdown_list('asset');
                        $("#asset")[0].selectedIndex = 0
                    })
                    .catch(function(e) {
                        var response = e.data;

                        switch (response.status)
                        {
                            case 404 :  sweet_popup("Account Needs Activation", 'To activate this account you need to send 2 or more Stellar Lumens (XLM). You can buy XLM from an exchange and send to your public address.', "warning");
                                        $("#xlmtotal").html('Send 2+ XLM to activate');
                                        $("#neztotal").html('');
                                        break;
                        }

                        //console.log(response);
                    });
            }
        });
    });
}

function change_trust_allow_nez()
{
    var nezlyToken = new StellarSdk.Asset('NEZ', NEZ_ISSUER);

    server = new StellarSdk.Server(STELLAR_SERVER);
    StellarSdk.Config.setAllowHttp(true);
    StellarSdk.Network.usePublicNetwork();

    server.loadAccount(public_key)
        .then(function(receiver) {
            var transaction = new StellarSdk.TransactionBuilder(receiver)
                .addOperation(StellarSdk.Operation.changeTrust({
                    asset: nezlyToken,
                    limit: '120000000'
                }))
                .build();

            transaction.sign(StellarSdk.Keypair.fromSecret(secret_key));
            return server.submitTransaction(transaction);
        })
        .catch(function(error) {
            console.error('Error!', error);
        });
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

function page_preview_payment()
{
    var to_address = $("#toaddress").val();
    var asset_name = $("#asset option:selected").text();
    var amount = $("#amount").val();

    swal({
        title: 'Confirm Transaction',
        text: "Sending " + amount + " " + asset_name + " to " + to_address,
        type: 'info',
        showCancelButton: true,
        confirmButtonColor: '#00aeef',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Confirm Payment',
        cancelButtonText: 'Cancel'
    }).then(function () {

        var nezlyToken = new StellarSdk.Asset('NEZ', NEZ_ISSUER);

        server = new StellarSdk.Server(STELLAR_SERVER);
        StellarSdk.Config.setAllowHttp(true);
        StellarSdk.Network.usePublicNetwork();

        if (asset_name === 'NEZ')
        {
            //TODO: check if recipient accepts NEZ first

            server.loadAccount(public_key)
                .then(function (receiver) {

                    var transaction = new StellarSdk.TransactionBuilder(receiver)
                        .addOperation(StellarSdk.Operation.payment({
                            destination: to_address,
                            asset: nezlyToken,
                            amount: amount
                        }))
                        .build();
                    transaction.sign(StellarSdk.Keypair.fromSecret(secret_key));

                    window.swal({
                        title: "Sending Payment",
                        text: "Please wait",
                        imageUrl: "images/ajaxloader.gif",
                        showConfirmButton: false,
                        allowOutsideClick: false
                    });

                    return server.submitTransaction(transaction);
                })
                .then(function(result) {

                    window.swal({
                        title: "Payment Sent!",
                        text: 'SENT ' + amount + ' ' + asset_name + ' to ' + to_address,
                        type: "error"
                    });
                    page_wallet();

                    //$("#transactiondiv").html('<div class="text-center"><h3>SENT ' + amount + ' ' + asset_name + ' to</h3><br /><p>' + to_address + '</p></div>');
                })
                .catch(function (error) {
                    window.swal({
                        title: "Problem",
                        text: "There was an error performing this transaction. - '" + error.message + "'",
                        type: "error"
                    });
                    console.error('Error!', error);
                });
        }
        else
        {
            server.loadAccount(public_key)
                .then(function (receiver) {

                    var transaction = new StellarSdk.TransactionBuilder(receiver)
                        .addOperation(StellarSdk.Operation.payment({
                            destination: to_address,
                            asset: StellarSdk.Asset.native(),
                            amount: amount
                        }))
                        .build();
                    transaction.sign(StellarSdk.Keypair.fromSecret(secret_key));

                    window.swal({
                        title: "Sending Payment",
                        text: "Please wait",
                        imageUrl: "images/ajaxloader.gif",
                        showConfirmButton: false,
                        allowOutsideClick: false
                    });

                    return server.submitTransaction(transaction);
                })
                .then(function(result)
                {
                    window.swal({
                        title: "Payment Sent!",
                        text: 'SENT ' + amount + ' ' + asset_name + ' to ' + to_address,
                        type: "error"
                    });
                    page_wallet();
                    //$("#transactiondiv").html('<div class="text-center"><h3>SENT ' + amount + ' ' + asset_name + ' to</h3><br /><p>' + to_address + '</p></div>');
                })
                .catch(function (error) {

                    window.swal({
                        title: "Problem",
                        text: "There was an error performing this transaction. - '" + error.message + "'",
                        type: "error"
                    });
                    console.error('Error!', error);
                });
        }

    }).catch(swal.noop);
}

function generate_new_wallet()
{
    var new_wallet_text;

    var pair = StellarSdk.Keypair.random();
    public_key = pair.publicKey();
    secret_key = pair.secret();

    new_wallet_text =  '<h3>Keep your key secure. This secret key will only be showed to you once. Nezly does not save it and will not be able to help you recover it if lost.</h3>';
    new_wallet_text += '<p>&nbsp;</p><p>Public key (will be your Account ID and Address):<br />';
    new_wallet_text += public_key;
    new_wallet_text += '</p><p>Secret key (<strong>SAVE THIS AND KEEP THIS SECURE</strong>):<br />';
    new_wallet_text += secret_key;
    new_wallet_text += '<br /><span><a href="#" class="copysecret">Copy to clipboard</a></span><p>&nbsp;</p>';
    new_wallet_text += '<h3>Account generation security notes</h3><p style="text-align: left;">The key is generated using entropy from <a href="https://github.com/dchest/tweetnacl-js#random-bytes-generation" target="_blank"> TweetNaCl\'s randomByte function</a> which, in most browsers, uses getRandomValues from the <a href="https://w3c.github.io/webcrypto/Overview.html" target="_blank">Web Cryptography API</a>. However, using a secure random number generation does not protect you from a compromised computer. Take great care to make sure your computer is secure and do not run this on a computer you do not trust.</p>'
    new_wallet_text += '<div class="all_fields"><input class="loginpage" type="submit" value="LOG IN" /></div><p>&nbsp;</p>';
    new_wallet_text += '<p>&nbsp;</p><hr style="width: 100%; border-top: 1px solid #00aeef;" /><p>&nbsp;</p>';

    $("#new-wallet-div").html(new_wallet_text);
}

function copy_public_address()
{
    if (public_key === null)
    {
        sweet_popup("Problem", "There was an error copying your public address.", "error");
    }
    else
    {
        var addr = document.createElement("input");

        document.body.appendChild(addr);
        addr.setAttribute("id", "addr_id");
        document.getElementById("addr_id").value = public_key;
        addr.select();
        document.execCommand("copy");
        document.body.removeChild(addr);

        sweet_popup("Public Address Copied", "Your public address has been copied to your clipboard", "success");
    }
}

function copy_secret_to_clipboard()
{
    if (secret_key === null)
    {
        sweet_popup("Problem", "There was an error copying your secret key to clipboard. Please try copying manually.", "error");
    }
    else
    {
        var addr = document.createElement("input");

        document.body.appendChild(addr);
        addr.setAttribute("id", "addr_id");
        document.getElementById("addr_id").value = secret_key;
        addr.select();
        document.execCommand("copy");
        document.body.removeChild(addr);

        sweet_popup("Secret Key Copied", "Your secret key has been copied to your local computer's clipboard. We do not store this nor have access to it if lost.", "success");
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

function sort_dropdown_list(select_id)
{
    var selectList = $('#' + select_id + ' option');

    selectList.sort(function(a,b)
    {
        a = a.value;
        b = b.value;

        return a-b;
    });

    $('select').html(selectList);
}

jQuery.validator.addMethod("secretStartsWithS", function(secret_key, element) {
    return secret_key.match(/^s/i);
}, "Secret Key should start with S");

jQuery.validator.addMethod("secretStartsWithG", function(public_key, element) {
    return public_key.match(/^g/i);
}, "Recipient address should start with G");

function destroyAuthCookie()
{
    Cookies.remove('authtoken');
    Cookies.remove('authtoken', { path: '/' });
}

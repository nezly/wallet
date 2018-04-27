const API = 'https://api.nezly.com/api/v1/';
const API_WEB = 'https://api.nezly.com/';
const API_AUTH ='https://api.nezly.com/oauth/token';
const STELLAR_SERVER = 'https://horizon.stellar.org';
const NEZ_ISSUER = 'GDGKBRCPW4C3ENNC5C64PE6U33MG52GBKFXOK5P3OSWF74DAOXRXV6OJ';

var csrf_token = null;
var client_id = 0;
var client_secret = null;
var authtoken = null;
var refresh_token = null;

var key_pair = null;
var public_key = null;
var secret_key = null;
var server = null;

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

function page_wallet()
{
    var xlm_total = 0;
    var nez_total = 0;

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

                server.loadAccount(public_key)
                    .then(function(account) {
                        $.each(account.balances, function (key, asset)
                        {
                            if (asset.asset_type === 'native')
                            {
                                xlm_total = asset.balance;
                            }
                            else if (asset.asset_code === 'NEZ' && asset.asset_issuer === NEZ_ISSUER)
                            {
                                nez_total = asset.balance;
                                $("#nez_line").show();
                            }
                            console.log(asset);
                        });
                        $("#xlmtotal").html(xlm_total);
                        $("#neztotal").html(nez_total);
                    })
                    .catch(function(e) {
                        var response = e.data;

                        switch (response.status)
                        {
                            case 404 :  sweet_popup("Account Needs Activation", 'To activate this account you need to send 5 or more Stellar Lumens (XLM). You can buy XLM from an exchange and send to your public address.', "warning");
                                        $("#xlmtotal").html('Send 5+ XLM to activate');
                                        $("#neztotal").html('');
                                        break;
                        }

                        console.log(response);
                    });
            }
        });
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

jQuery.validator.addMethod("secretStartsWithS", function(secret_key, element) {
    return secret_key.match(/^s/i);
}, "Secret Key should start with S");

function destroyAuthCookie()
{
    Cookies.remove('authtoken');
    Cookies.remove('authtoken', { path: '/' });
}

$(function() {
    /*
     $(document).on('submit', '#login-form', function () {
     event.preventDefault();
     login();
     });
     */

    $("#login-form").validate(
    {
        submitHandler: function (form)
        {
            login();
        },
        rules:
        {
            email:
            {
                required: true,
                email: true
            },
            password:
            {
                required: true
            }
        }
    });


    $("#registration-form").validate(
    {
        submitHandler: function (form)
        {
            //check_captcha();
            register();
        },
        rules:
        {
            firstname:
            {
                required: true
            },
            lastname:
            {
                required: true
            },
            email:
            {
                required: true,
                email: true
            },
            password:
            {
                required: true,
                minlength: 6
            },
            confirmpassword:
            {
                required: true,
                minlength: 6,
                equalTo: "#password"
            }
        }
    });

    $(document).on('click', '.new', function()
    {
        page_new_wallet();
    });

    $(document).on('click', '#buy-with-btc', function()
    {
        page_buy_with_btc();
    });

    $(document).on('click', '#buy-with-eth', function()
    {
        page_buy_with_eth();
    });

    $(document).on('click', '#buy-with-xlm', function()
    {
        page_buy_with_xlm();
    });

    $(document).on('click', '#buy-with-usd', function()
    {
        page_buy_with_usd();
    });

    $(document).on('click', '#btcbuy_cancel', function()
    {
        page_buy();
    });

    $(document).on('click', '#ethbuy_cancel', function()
    {
        page_buy();
    });

    $(document).on('click', '#xlmbuy_cancel', function()
    {
        page_buy();
    });

    $(document).on('click', '#new-transaction', function()
    {
        page_buy();
    });

    $(document).on('click', '#usdbuy_cancel', function()
    {
        page_buy();
    });

    $(document).on('click', '#account_cancel', function()
    {
        load_user(page_buy);
    });

    $(document).on('click', '.transactions', function()
    {
        page_transactions();
    });

    $(document).on('click', '#sent-payment', function()
    {
        payment_sent();
    });

    $(document).on('click', '.nezwrapper', function()
    {
        confirmed_nez_popup();
    });

    $(document).on('click', '.account', function()
    {
        page_account();
    });

    $(document).on('click', '.bounty', function()
    {
        page_bounty();
    });

    $(document).on('click', '.settings', function()
    {
        page_settings();
    });

    $(document).on('click', '.button-enable-2fa', function(event)
    {
        event.preventDefault();
        activate_2fa();
    });

    $(document).on('click', '.button-disable-2fa', function(event)
    {
        disable_2fa();
    });

    $(document).on('click', '.xlm-cancel-transaction', function()
    {
        cancel_transaction();
    });

    $(document).on('click', '.btc-cancel-transaction', function()
    {
        cancel_transaction();
    });

    $(document).on('click', '.eth-cancel-transaction', function()
    {
        cancel_transaction();
    });

    $(document).on('click', '.copy-referral-bounty-link', function()
    {
        copy_bounty_referral_link();
    });

    $(document).on('click', '.txn-click', function(event)
    {
        event.preventDefault();

        var url = $(this).attr('data-url');

        if (url === 'pending')
        {
            //sweet_popup("Pending", "This transaction is currently pending. Once manually verified, a link will be provided to view the transaction with a block explorer link.", "info");
            show_pending_transaction();
        }
        else if (url === 'cancelled')
        {
            sweet_popup("Cancelled Transaction", "This transaction has been cancelled but it remains here for your records.", "info");
        }
        else if (url.substring(0, 5) === 'popup')
        {
            sweet_popup("Free Nezly Tokens", url.substring(5), "success");
        }
        else
        {
            window.open(url);
        }
    });




    /*
        $(document).on('click', '#bifrost-info', function()
        {
            sweet_popup('BiFrost Info', "Bifrost is highly available and secure Bitcoin/Ethereum → Stellar bridge developed by Stellar. It allows users to move BTC/ETH to the Stellar network and automatically trade them for Nezly Tokens at current rates shown on this page.",'info');
        });
    */

});
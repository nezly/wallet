$(function() {

    $("#login-form").validate(
    {
        submitHandler: function (form)
        {
            login();
        },
        rules:
        {
            secretkey:
            {
                required: true,
                secretStartsWithS: true,
                minlength: 56,
                maxlength: 56,
            }
        }
    });

    // $("#payment-form").validate(
    // {
    //     submitHandler: function (form)
    //     {
    //         page_preview_payment();
    //     },
    //     rules:
    //     {
    //         toaddress:
    //         {
    //             required: true,
    //             secretStartsWithG: true,
    //             minlength: 56,
    //             maxlength: 56,
    //         }
    //     }
    // });

    $(document).on('click', '.createwallet', function(event)
    {
        event.preventDefault();
        if ($("#chkterms").prop('checked') === true)
        {
            generate_new_wallet();
        }
        else
        {
            sweet_popup("Terms and Conditions", 'In order to proceed, please remember to check the box indicating you agree with the Terms and Conditions.', "warning");
        }
    });

    $(document).on('click', '.loginpage', function(event)
    {
        event.preventDefault();
        window.location.href = '/';
    });

    $(document).on('click', '.new', function()
    {
        page_new_wallet();
    });

    $(document).on('click', '.publickey', function()
    {
        sweet_popup("Your Public Address", 'Your Public Address can be shared with others to receive payments of both Stellar Lumens (XLM) and Nezly Tokens (NEZ) from other wallets or exchanges.', "info");
    });

    $(document).on('click', '.copyaddress', function()
    {
        copy_public_address();
    });

    $(document).on('click', '.copysecret', function()
    {
        copy_secret_to_clipboard();
    });

});
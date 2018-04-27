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
            secretkey:
            {
                required: true,
                secretStartsWithS: true,
                minlength: 56,
                maxlength: 56,
            }
        }
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
});
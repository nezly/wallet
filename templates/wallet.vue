<div id="page-wrapper" class="no-margins purplebg">
    <div class="row ">
        <nav class="navbar navbar-static-top box-shadow" role="navigation">
            <div class="navbar-header">
                <button aria-controls="navbar" aria-expanded="false" data-target="#navbar" data-toggle="collapse" class="navbar-toggle collapsed" type="button">
                    <i class="fa fa-reorder"></i>
                </button>
                <a href="/" class="navbar-brand"><img src="images/logo2.png" alt="Nezly"></a>
            </div>
            <div class="navbar-collapse collapse purple-bg" id="navbar">
                <ul class="nav navbar-nav">
                    <li class="active pull-right">
                        <a aria-expanded="false" role="button" href="/">Log Out</a>
                    </li>
                    <li>
                        <a aria-expanded="false" role="button" href="#" class="new"> New Wallet </a>
                    </li>
                </ul>
            </div>
        </nav>
    </div>
    <div class="wrapper wrapper-content no-margins no-padding">

        <div class="inner_content no-margins">
            <div style="margin-top: 16px;">
                <div class="checkmail">
                    <div class="contact_form no-margins" style="width:100%;">
                        <div class="row">
                            <div class="col-md-12">
                                <h3 class="nezly-blue" style="margin-top: 0px;">Your Public Address:</h3>
                                <p id="public_key" style="text-align: left;">{{ public_key }}<br /><span class="pull-left"><a href="#" class="copyaddress">Copy</a></span><span class="pull-right"><a href="#" class="publickey">What's this?</a></span></p>
                                <hr style="width: 100%; border-top: 1px solid #00aeef;" />
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-4">
                                <h3 class="nezly-blue" style="margin-top: 0px;">Your Balance:</h3>
                                <h2 id="xlm_line" class="nezly-blue font-bold" style="margin-top: 0px;">XLM: <span class="text-white" id="xlmtotal" v-cloak="true"></span></h2>
                                <h2 id="nez_line" class="nezly-blue font-bold" style="margin-top: 0px;">NEZ: <span class="text-white" id="neztotal" v-cloak="true"></span></h2>
                            </div>
                            <div class="col-md-8" id="transactiondiv">
                                <h3 class="nezly-blue" style="margin-top: 0px;">Transaction:</h3>
                                <form id="payment-form" method="post" action="#">
                                    <div class="form-group" style="margin: 0;">
                                        <input id="toaddress" name="toaddress" type="text" placeholder="Recipient Address" class="all_field" style="margin-top: 0px !important;" />
                                        <input id="amount" name="amount" type="text" placeholder="Amount" class="all_field" style="display: inline; width: 50%; margin-right: 16px;" />
                                        <select id="asset" class="custom-select custom-select-md all_field" style="display: inline; width: 40% !important;">
                                            <option selected value="0">Select Asset</option>
                                        </select>
                                        <!--
                                        <input id="memotext" name="memotext" type="text" placeholder="Message (Optional)" class="all_field" />
                                        -->
                                        <div class="text-center errortxt"></div>
                                        <div class="all_fields"><input type="submit" value="PREVIEW PAYMENT" /></div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="footer fixed">
        <div>
            <strong>Copyright</strong> Nezly Inc &copy; 2018
        </div>
    </div>

</div>
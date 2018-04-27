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
                    <li class="active">
                        <a aria-expanded="false" role="button" href="/">Login With Key</a>
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
            <div class="main_container">
                <div class="checkmail">
                    <div class="contact_form no-margins">
                        <h3 class="nezly-blue" style="margin-top: 0px;">Public Address:</h3>
                        <p id="public_key" style="text-align: left;">{{ public_key }}<br /><span class="pull-left"><a href="#" class="copyaddress">Copy</a></span><span class="pull-right"><a href="#" class="publickey">What's this?</a></span></p>
                        <hr style="width: 100%; border-top: 1px solid #00aeef;" />
                        <h3 class="nezly-blue" style="margin-top: 0px;">Balance:</h3>
                        <h2 id="xlm_line" class="nezly-blue font-bold" style="margin-top: 0px;">XLM: <span class="text-white" id="xlmtotal" v-cloak="true"></span></h2>
                        <h2 id="nez_line" class="nezly-blue font-bold" style="margin-top: 0px;">NEZ: <span class="text-white" id="neztotal" v-cloak="true"></span></h2>
                        <hr style="width: 100%; border-top: 1px solid #00aeef;" />
                        <form id="payment-form" method="post" action="#" style="display: none;">
                            <div class="form-group">
                                <div class="all_fields"><input type="submit" value="PREVIEW PAYMENT" /></div>
                            </div>
                        </form>
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
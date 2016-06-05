<html>
<head>
    <link href='https://fonts.googleapis.com/css?family=Open+Sans:400,700' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" type="text/css" href="shop.css">
    <link rel="stylesheet" type="text/css" href="../mall/font-awesome-4.6.3/css/font-awesome.css">
</head>
<body>
<div class="header">
    <a class="back-link" href="ask.php">Tillbaka till ME-sida</a>
    <span class="sitename"><b>the <i>BOOK</i>shop</b></span>
</div>
    <div class="shop-area">
        <div id="items-area" class="item-area">
            <table id="items" class="item-table">
            </table>
        </div>
        <div class="cart-area">
            <table id="cart-items" class="cart-items">
                <tr id="total-row">
                    <td colspan="2">Totalt</td><td><span id="total-cart">0</span> SEK</td>
                </tr>
            </table>
            <i class="fa fa-trash-o fa-2x pointer" onclick="emptyCart()" aria-hidden="true"></i>
            <i class="fa fa-money fa-2x pointer green" onclick="checkout()" aria-hidden="true"></i>
        </div>
    </div>
    <div id="background-cover">
        <div id="payment-area" class="payment-area">
            <form id="payment-form">
                <div class="left-payment">
                    <p>Credit card holder: <br><input name="card-holder" type="text"></p>
                    <p>Address: <br><input name="address-1" type="text"><br><input name="address-2" type="text"></p>
                    <p>Zip: <br><input name="zip" type="text"></p>
                    <p>City: <br><input name="city" type="text"></p>
                    <p>Country: <br><select name="country"><option value="sweden">Sweden</option><option value="norway">Norway</option></select></p>
                </div>
                <div class="right-payment">
                    <p>Card number:<br><input onkeyup="changedCardNumber(this)" name="card-number" type="text"></p>
                    <p>Card type:<br><input name="card-type" type="text" disabled></p>
                    <p>Expiration: <br><input class="half-width" name="card-expiration-month" type="number" onkeyup="changedCardMonth(this)" placeholder="MM"> / <input class="half-width" onkeyup="changedCardYear(this)" name="card-expiration-year" type="number" placeholder="YY"></p>
                    <p>CVC: <br><input name="cvc" type="number"></p>
                </div>
            </form>
            <div style="clear: both;">
                <button id="pay-button" onclick="checkPayment()">Betala</button>
                <span id="payment-status"></span>
            </div>
        </div>
    </div>
    <div id="info-bar-top" class="info-bar-top">
    </div>
    <?php include('../mall/js.php');?>
    <script src="shop.js"></script>
    <div class="footer">
        <p>This ma page</p>
    </div>

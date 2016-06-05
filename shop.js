/*jslint unparam: true, node: true */
var booksLoaded = 0, errorCount = 0, loadMoreInterval, loadedAllBooks = false, scrolled = false;
var loadBooksPerCall = 3;

function changedCardMonth(ref) {
    "use strict";
    if (event.keyCode === 9 || (event.keyCode >= 16 && event.keyCode <= 18)) {
        return;
    }
    if (ref.value.length >= 2) {
        ref.value = ref.value.substr(0, 2);
        $('#payment-form input[name="card-expiration-year"]').focus();
    }
}

function GetCardType(number) {
    "use strict";
    // visa
    var re = new RegExp("^4");
    if (number.match(re) !== null) {
        return "Visa";
    }

    // Mastercard
    re = new RegExp("^5[1-5]");
    if (number.match(re) !== null) {
        return "Mastercard";
    }

    // AMEX
    re = new RegExp("^3[47]");
    if (number.match(re) !== null) {
        return "AMEX";
    }

    // Discover
    re = new RegExp("^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)");
    if (number.match(re) !== null) {
        return "Discover";
    }

    // Diners
    re = new RegExp("^36");
    if (number.match(re) !== null) {
        return "Diners";
    }

    // Diners - Carte Blanche
    re = new RegExp("^30[0-5]");
    if (number.match(re) !== null) {
        return "Diners - Carte Blanche";
    }

    // JCB
    re = new RegExp("^35(2[89]|[3-8][0-9])");
    if (number.match(re) !== null) {
        return "JCB";
    }

    // Visa Electron
    re = new RegExp("^(4026|417500|4508|4844|491(3|7))");
    if (number.match(re) !== null) {
        return "Visa Electron";
    }

    return "";
}

function changedCardNumber(ref) {
    "use strict";
    if (event.keyCode === 9 || (event.keyCode >= 16 && event.keyCode <= 18)) {
        return;
    }
    var x = 0, spaces, temp, tempArr = [], card;
    temp = ref.value.replace(/ /g, '');
    spaces = (temp.length - 1) / 4;
    card = GetCardType(temp);
    $('#payment-form input[name="card-type"]').val(card);

    if (spaces === 0) {
        ref.value = temp;
    } else if (temp.length >= 16) {
        ref.value = ref.value.substr(0, 19);
        $('#payment-form input[name="card-expiration-month"]').focus();
    } else {
        for (x; x <= spaces; x += 1) {
            tempArr.push(temp.slice(x * 4, (x + 1) * 4));
        }
        if (spaces > 4) {
            tempArr.pop();
        }
        temp = tempArr.join(' ');
        ref.value = temp;
    }

}

function changedCardYear(ref) {
    "use strict";
    if (event.keyCode === 9 || (event.keyCode >= 16 && event.keyCode <= 18)) {
        return;
    }
    if (ref.value.length >= 2) {
        ref.value = ref.value.substr(0, 2);
        $('#payment-form input[name="cvc"]').focus();
    }
}

function alertUser(code, text) {
    "use strict";
    errorCount += 1;
    var boxText = "", theClass = "error";
    var closetimer = 4000;

    if (code === 0) {
        boxText = 'Database connection error.';
    } else if (code === 1) {
        boxText = 'Request error (1).';
    } else if (code === 2) {
        //Stop looking for more books etc.
        clearInterval(loadMoreInterval);
        loadedAllBooks = true;
        $(window).off('scroll');

        closetimer = 6000;
        boxText = 'All books are loaded.';
        theClass = 'info';
        $('#loadDiv').off("mouseover");
    } else if (code === 3) {
        boxText = 'AJAX error (' + text + ').';
    } else if (code === 4) {
        boxText = 'Request error (4).';
    } else if (code === 5) {
        boxText = 'Unable to add book to cart.';
    } else if (code === 6) {
        boxText = 'Successfully emptied cart.';
        theClass = 'success';
        closetimer = 2000;
    } else {
        boxText = code;
        theClass = text;
    }

    boxText = '<p class="box-text">' + boxText + '<small> (Click to close)</small></p>';

    $('<div id="msg-' + errorCount + '" class="' + theClass + '"></div>').html(boxText).hide().prependTo('#info-bar-top').fadeIn();

    $('#msg-' + errorCount).on('click', function () {
        $(this).fadeOut(200, function () { this.remove(); });
    });

    var staticCount = JSON.parse(JSON.stringify(errorCount));
    setTimeout(function () {
        $('#msg-' + staticCount).fadeOut(200, function () { this.remove(); });
    }, closetimer);

}

function checkPosition() {
    "use strict";

    var currScroll = $(window).scrollTop() + window.innerHeight;
    var percent = currScroll * 100 / $(window).height();

    return percent >= 85;
}

function removeFromCart(id) {
    "use strict";
    $.ajax({
        type: 'post',
        url: 'skip_shop.php?do=removeFromCart',
        dataType: 'json',
        data: 'removeBook=' + id,

        success: function (data) {
            console.log(data.action);
            if (data.error) {
                alertUser(data.code);
                console.log(data.error);
            } else {
                if (data.action === 'remove') {
                    $('#cart-items #book-' + data.id).fadeOut(200, function () {
                        $(this).remove();
                    });
                } else if (data.action === 'update') {
                    $('#cart-items #book-' + data.id).fadeOut(200, function () {
                        $('#cart-items #book-' + data.id + ' .cart-qty').text(data.qty + ' x');
                        $('#cart-items #book-' + data.id).fadeIn();
                    });
                }
                $('#total-cart').fadeOut(200, function () {
                    $(this).text(data.sum);
                    $(this).fadeIn();
                });
            }
        },

        error: function (a, b, c) {
            alertUser(3, b);
            console.log(a, b, c);
        }
    });
}

function loadNextBook() {
    "use strict";
    if (loadedAllBooks) {
        return;
    }

    $.ajax({
        type: 'post',
        url: 'skip_shop.php?do=loadNextBook',
        dataType: 'json',
        data: 'loadBook=' + booksLoaded + '&limit=' + loadBooksPerCall,

        success: function (data) {
            if (data.error) {
                alertUser(data.code);
            } else {
                $.each(data, function (ignore, value) {
                    var row = $('<tr></tr>').hide();

                    row.append(
                        $('<td></td>').append(
                            $('<img class="list-img"></img>').attr('src', '../mall/img.php?src=' + value.img + '&width=200&height=150&crop-to-fit')
                        )
                    ).append(
                        $('<td></td>').append(
                            $('<span class="item-title"></span>').text(value.title)
                        ).append('<br>').append(
                            $('<span class="item-price"></span>').text(value.price + ' SEK')
                        )
                    ).append(
                        $('<td></td>').append(
                            $('<i onclick="addToCart(' + value.id + ')" class="pointer fa fa-cart-plus fa-2x" aria-hidden="true"></i>')
                        )
                    );

                    row.appendTo($('#items')).fadeIn();
                });
            }

            if (checkPosition()) {
                loadNextBook();
            }
        },

        error: function (a, b, c) {
            alertUser(3);
            console.log(a, b, c);
        }
    });

    booksLoaded += loadBooksPerCall;
}

function addToCart(id) {
    "use strict";

    $.ajax({
        type: 'post',
        url: 'skip_shop.php?do=addToCart',
        dataType: 'json',
        data: 'addBook=' + id,

        success: function (data) {
            if (data.error) {
                alertUser(data.code);
            } else {
                if (data.action === 'new') {
                    var row = $('<tr class="cart-item" id = "book-' + data.id + '"></tr>').append(
                        $('<td class="cart-qty"></td>').text(data.qty + ' x')
                    ).append(
                        $('<td></td>').text(data.title)
                    ).append(
                        $('<td></td>').text(data.price + ' SEK')
                    ).append(
                        $('<td></td>').append(
                            $('<i onclick="removeFromCart(' + data.id + ')" class="pointer fa fa-minus-square red" aria-hidden="true"></i>')
                        )
                    ).hide();
                    row.prependTo($('#cart-items')).fadeIn();
                } else if (data.action === 'update') {
                    $('#cart-items #book-' + data.id).fadeOut(200, function () {
                        $('#cart-items #book-' + data.id + ' .cart-qty').text(data.qty + ' x');
                        $('#cart-items #book-' + data.id).fadeIn();
                    });
                }
                $('#total-cart').fadeOut(200, function () {
                    $(this).text(data.sum);
                    $(this).fadeIn();
                });
            }
        },

        error: function (a, b, c) {
            alertUser(3, b);
            console.log(a, b, c);
        }
    });
}

function loadCart() {
    "use strict";
    $.ajax({
        type: 'post',
        url: 'skip_shop.php?do=loadCart',
        dataType: 'json',

        success: function (data) {
            if (data.error) {
                alertUser(data.code);
            } else {
                if (data === 'empty') {
                    return;
                }
                $.each(data[0], function (ignore, value) {
                    var row = $('<tr class="cart-item" id = "book-' + value.id + '"></tr>').append(
                        $('<td class="cart-qty"></td>').text(value.qty + ' x')
                    ).append(
                        $('<td></td>').text(value.title)
                    ).append(
                        $('<td></td>').text(value.price + ' SEK')
                    ).append(
                        $('<td></td>').append(
                            $('<i onclick="removeFromCart(' + value.id + ')" class="pointer fa fa-minus-square red" aria-hidden="true"></i>')
                        )
                    ).hide();
                    row.prependTo($('#cart-items')).fadeIn();
                });
            }
            $('#total-cart').text(data[1]);
        },

        error: function (a, b, c) {
            alertUser(3, b);
            console.log(a, b, c);
        }
    });
}

function emptyCart() {
    "use strict";
    $.ajax({
        type: 'post',
        url: 'skip_shop.php?do=clearCart',
        dataType: 'json',

        success: function (data) {
            if (data.error) {
                alertUser(data.code);
            } else {
                $('#cart-items .cart-item').each(function () {
                    $(this).fadeOut(250, function () { this.remove(); });
                });
                alertUser(6);
            }
            $('#total-cart').fadeOut(200, function () {
                $(this).text('0');
                $(this).fadeIn();
            });
        },
        error: function (a, b, c) {
            alertUser(3, b);
            console.log(a, b, c);
        }
    });
}

function checkPayment() {
    "use strict";
    //Validate form, then send AJAX
    $('#payment-form .error-form').removeClass('error-form');

    if ($('#payment-form [name="card-holder"]').val() === '') {
        $('#payment-form [name="card-holder"]').addClass('error-form');
        alertUser('Fyll i vem som äger kortet.', 'error');
        $('#payment-form [name="card-holder"]').focus();
    } else if (($('#payment-form [name="address-1"]').val() === '')) {
        $('#payment-form [name="address-1"]').addClass('error-form');
        alertUser('Fyll i adressen.', 'error');
        $('#payment-form [name="address-1"]').focus();
    } else if (($('#payment-form [name="zip"]').val() === '')) {
        $('#payment-form [name="zip"]').addClass('error-form');
        alertUser('Fyll i zip-kod.', 'error');
        $('#payment-form [name="zip"]').focus();
    } else if (($('#payment-form [name="city"]').val() === '')) {
        $('#payment-form [name="city"]').addClass('error-form');
        alertUser('Fyll i stad.', 'error');
        $('#payment-form [name="city"]').focus();
    } else if (($('#payment-form [name="country"]').val() === '')) {
        $('#payment-form [name="country"]').addClass('error-form');
        alertUser('Fyll i land.', 'error');
        $('#payment-form [name="country"]').focus();
    } else if (($('#payment-form [name="card-number"]').val() === '')) {
        $('#payment-form [name="card-number"]').addClass('error-form');
        alertUser('Fyll i kortnumret.', 'error');
        $('#payment-form [name="card-number"]').focus();
    } else if (($('#payment-form [name="card-expiration-month"]').val() === '')) {
        $('#payment-form [name="card-expiration-month"]').addClass('error-form');
        alertUser('Fyll i utgångsmånad.', 'error');
        $('#payment-form [name="card-expiration-month"]').focus();
    } else if (($('#payment-form [name="card-expiration-year"]').val() === '')) {
        $('#payment-form [name="card-expiration-year"]').addClass('error-form');
        alertUser('Fyll i utgångsår.', 'error');
        $('#payment-form [name="card-expiration-year"]').focus();
    } else if (($('#payment-form [name="cvc"]').val() === '')) {
        $('#payment-form [name="cvc"]').addClass('error-form');
        alertUser('Fyll i cvc-kod.', 'error');
        $('#payment-form [name="cvc"]').focus();
    } else {
        $('#payment-status').text('').removeClass('red');
        $.ajax({
            type: 'post',
            url: 'skip_shop.php?do=checkCard',
            dataType: 'json',
            data: 'card=' + $('#payment-form [name="card-number"]').val(),

            success: function (data) {
                if (data.error) {
                    alertUser(data.code);
                } else {
                    if (data.result) {
                        $('#pay-button').attr('disabled', true);
                        $('#payment-status').text('Betalning slutförd!').addClass('green');
                        emptyCart();
                    } else {
                        $('#payment-status').text('Betalning misslyckad!').addClass('red');
                    }
                }
            },
            error: function (a, b, c) {
                alertUser(3, b);
                console.log(a, b, c);
            }
        });
    }

}
function checkout() {
    "use strict";
    $('#background-cover').fadeIn(200, function () {
        $('#payment-area [name="card-holder"]').focus();
    });
    $('#background-cover').on('click', function () {
        if (event.target === this) {
            $(this).fadeOut();
            $('#background-cover').off('click');
            $('#background-cover').off('keyup');
        }
    });
    $('#background-cover').keyup(function () {
        if (event.keyCode !== 27) {
            return;
        }
        $(this).fadeOut();
        $('#background-cover').off('click');
        $('#background-cover').off('keyup');
    });
}

$(document).ready(function () {
    "use strict";
    loadCart();
    loadNextBook();

    loadMoreInterval = setInterval(function () {
        if (scrolled) {
            scrolled = false;
            if (checkPosition()) {
                loadNextBook();
            }
        }
    }, 250);

    $(window).on("scroll", function () {
        scrolled = true;
    });
});

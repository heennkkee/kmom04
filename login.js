function success(data) {
    "use strict";
    $('#output').hide().removeClass().text(data.output).fadeIn();
}

/**
 * Eventhandler for #login
 */
$('#login').on('click', function () {
    "use strict";

    $('#output').removeClass().addClass('working').html('Performing login...');

    $.ajax({
        type: 'post',
        url: 'skip_login.php?do=login',
        data: $('#form1').serialize(),
        dataType: 'json',
        success: success
    });
});

$('#logout').on('click', function () {
    "use strict";
    $('#output').removeClass().addClass('working').html('Logging out. Please wait...');

    $.ajax({
        type: 'post',
        url: 'skip_login.php?do=logout',
        data: $('#form1').serialize(),
        dataType: 'json',
        success: success
    });
});

$('#status').on('click', function () {
    "use strict";
    $('#output').removeClass().addClass('working').html('Requesting your status.');

    $.ajax({
        type: 'post',
        url: 'skip_login.php?do=status',
        data: $('#form1').serialize(),
        dataType: 'json',
        success: success
    });
});

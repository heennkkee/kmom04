function askMe() {
    "use strict";
    $.ajax({
        url: 'skip_quotes.php',
        dataType: 'json',

        success: function (data) {
            $('#quote').fadeOut(function () {
                $('#quote').html(data.quote).fadeIn();
            });
            console.log('.ajax() request returned successfully.');
        },

        error: function (jqXHR, textStatus, errorThrown) {
            console.log('.ajax() request failed: ' + textStatus + ', ' + errorThrown);
            console.log(jqXHR);
        }
    });
}

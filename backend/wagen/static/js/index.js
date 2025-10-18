

$('.nav_link').on('click', function (e) {
    $(".nav_link").find('span').css('opacity', '0');
    // $('.boxes').toggleClass('box-nd');
    // $('.ol-zoom').toggleClass('box-nd');
    if ($(this).hasClass('active')) {
        // $(".nav_link").find('span').css('opacity', '1');
        // $('.container-fluid').removeClass('body-nd');
        // $('header').removeClass('d-none');
        // $('.submenu').removeClass('d-block');
        // $(this).removeClass('active');
        // $('.boxes').removeClass('box-nd');
        // $('.ol-zoom').removeClass('box-nd');
    }
    else {
        $('.nav_link').removeClass('active');
        $('.container-fluid').addClass('body-nd');
        $(this).addClass('active');
        $('.submenu').removeClass('d-block');
        $(this).next('.submenu').addClass('d-block');
        $('header').addClass('d-none');
        $('.boxes').addClass('box-nd');
        $('.ol-zoom').addClass('box-nd');
    }
})

$('a.nav_link').first().click();

// $('.closeBtn').on('click', function () {
//     $('.nav_link.active').trigger('click');
// })

// $(document).ready(function(){
//     $('#introModal').modal('show')
// })








    $(document).ready(function(){
        var scroll_start = 0
        var startchange = $('#front-right')
        var offset = startchange.offset()
         if (startchange.length){
            $(document).scroll(function() {
              scroll_start = $(this).scrollTop()
                if(scroll_start > offset.top) {
                  $("#navbar-style").css('background-color', 'rgb(138, 125, 118)')
                } else {
                  $('#navbar-style').css('background-color', 'rgba(138, 125, 118, 0.5)')
                }
              })
            }

      })


//hide and show hero image

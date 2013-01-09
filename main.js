$(document).ready(function() {
  var handleResize = function() {
    $('#page').css({
      height: $('#main').height() - $('#googlebar').outerHeight() - $('#topbar').outerHeight()
    });

    $('#map').css({
      width: $('#page').width() - $('#panel').outerWidth()
    });

    $('#content').css({
      height: $('#map').height() - $('#controls').outerHeight() - 10
    });
  };

  handleResize();
  $(window).bind('resize', handleResize);
});

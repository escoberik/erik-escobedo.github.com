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

  $('#print').bind('click', function() {
    window.open('http://erik-escobedo.github.com/');
  });

  $('#link').zclip({
    path: 'http://erik-escobedo.github.io/google-CV/ZeroClipboard.swf',
    copy: location.href
  });


  var showContentFor = function(section) {
    $('#cv-content, #letter-content').hide();
    $('#' + section + '-content').show();
  };

  $('#cv, #letter').bind('click', function() {
    var section = $(this).attr('id');
    showContentFor(section);
  });

  $('#topbar li').bind('click', function() {
    var topic = $(this).data('target');
    showContentFor('cv');
    if (!topic) return;

    var position = $('#' + topic).offset().top - $('#cv-content').offset().top;
    $('#content').animate({ scrollTop: position });
  });
});

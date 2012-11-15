$(document).ready(function() {
  var remainingTime = function() {
    var goal = new Date(2012, 11, 15, 23);
    var now = new Date();
    var sec = parseInt((goal - now) / 1000);
    var min = parseInt(sec / 60);
    var hour = parseInt(min / 60)

    return {
      sec: sec % 60,
      min: min % 60,
      hour: hour,
      total: sec
    };
  };
  window.initial_time = remainingTime();

  var setClock = function(time) {
    $('#clock').text(time.hour + ':' + time.min + ':' + time.sec);
  };
  setClock(remainingTime());
  
  var setNovios = function(time) {
    var origin = window.initial_time.total;
    var remaining = origin - time.total;
    var stepx = 400 / origin;
    var stepy = 350 / 60;

    var x = remaining * stepx;
    var y = Math.abs((remaining % 120) - 60);

    $('#erik').css({
      left: x,
      top: 350 - y * stepy
    });

    $('#gaby').css({
      right: x,
      bottom: 350 - y * stepy
    });
  };
  
  setInterval(function() {
    setClock(remainingTime());
    setNovios(remainingTime());
  }, 500);
});

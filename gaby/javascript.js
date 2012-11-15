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
      hour: hour
    };
  };

  var setClock = function(time) {
    $('#clock').text(time.hour + ':' + time.min + ':' + time.sec);
  }

  setClock(remainingTime());
  setInterval(function() {
    setClock(remainingTime());
  }, 500);
});

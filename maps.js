function initialize() {
  var latlng = new google.maps.LatLng(37.425342495823784, -122.08853515);
  var $map = document.getElementById('map');
  window.map = new google.maps.Map($map, {
    center: latlng,
    zoom: 8,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });

  $(document).ready(function() {
    search('Google, Mountain View, California');

    $('.trackable .item').bind('click', function() {
      var address = $(this).data('address');
      search(address);
    });
  });
}

function search(address) {
  var geocoder = new google.maps.Geocoder();
  $('#searchbar input').val(address);
  geocoder.geocode({ address: address }, function(results) {
    var box = results[0].geometry.viewport;
    window.map.fitBounds(box);
  });
}

$(function() {
  var map = {
    $el: $('#map'),
    tiles: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0]
    ]
  };

  $(map.tiles).each(function(y, row) {
    $(row).each(function(x, tile) {
      var $tile = generateTile(x, y, tile);
      map.$el.append($tile);
    });
  });
});

var tile_width = 100;
var tile_height = 100;

function generateTile(x, y, tile) {
  return $('<div />').attr({ class: 'tile' }).css({
    top: y * tile_width,
    left: x * tile_height
  });
};

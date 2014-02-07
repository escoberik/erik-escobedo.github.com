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

  var lucero = {
    $el: $('#lucero'),
    x: 4,
    y: 9,
    speed: 4
  };

  $(map.tiles).each(function(y, row) {
    $(row).each(function(x, tile) {
      var $tile = generateTile(x, y, tile);
      map.$el.append($tile);
    });
  });

  map.$el.on('click', '.tile', function() {
    var x = $(this).data('x');
    var y = $(this).data('y');
    moveSprite(lucero, x, y);
  });
});

var tile_width = 100;
var tile_height = 100;

function generateTile(x, y, tile) {
  return $('<div />').attr({ class: 'tile' }).data({
    x: x,
    y: y
  }).css({
    top: y * tile_width,
    left: x * tile_height
  });
};

function moveSprite(sprite, x, y) {
  sprite.$el.animate({
    top: y * tile_width,
    left: x * tile_height
  })
};

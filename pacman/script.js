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
    return false;
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
  var delta_x = x - sprite.x;
  var delta_y = y - sprite.y;
  var time = 1000 / sprite.speed;

  if (Math.abs(delta_x) >= Math.abs(delta_y)) {
    if (delta_x < 0) { // LEFT
      sprite.x -= 1;
    } else if (delta_x > 0) {           // RIGHT
      sprite.x += 1;
    }
  } else {
    if (delta_y < 0) { // UP
      sprite.y -= 1;
    } else {           // DOWN
      sprite.y += 1;
    }
  }

  sprite.$el.animate({
    top: sprite.y * tile_width,
    left: sprite.x * tile_height
  }, time);

  if (delta_x == 0 && delta_y == 0) {
    return true;
  } else {
    setTimeout(function() { moveSprite(sprite, x, y) }, time);
  }
};

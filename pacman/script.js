$(function() {
  window.map = {
    $el: $('#map'),
    tiles: [
      [9, 5, 5, 1, 5, 1, 5, 5, 3],
      [10, 9, 5, 4, 1, 4, 5, 3, 10],
      [10, 10, 9, 5, 0, 5, 3, 10, 10],
      [8, 0, 6, 9, 0, 3, 12, 0, 2],
      [10, 8, 1, 6, 10, 12, 1, 2, 10],
      [10, 10, 8, 5, 0, 5, 2, 10, 10],
      [10, 8, 4, 3, 10, 9, 4, 2, 10],
      [8, 0, 3, 12, 0, 6, 9, 0, 2],
      [10, 10, 12, 5, 0 , 5, 6, 10, 10],
      [10, 12, 5, 1, 4, 1, 5, 6, 10],
      [12, 5, 5, 4, 5, 4, 5, 5, 6]
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
  return $('<div />').attr({ class: 'tile walls-' + tile }).data({
    x: x,
    y: y
  }).css({
    top: y * tile_width,
    left: x * tile_height
  });
};

function moveSprite(sprite, x, y) {
  clearTimeout(sprite.engine);
  var delta_x = x - sprite.x;
  var delta_y = y - sprite.y;
  var time = 1000 / sprite.speed;

  if (Math.abs(delta_x) >= Math.abs(delta_y)) {
    if (delta_x < 0) { // LEFT
      if (wall('left', sprite.x, sprite.y)) return;
      sprite.x -= 1;
    } else if (delta_x > 0) {           // RIGHT
      if (wall('right', sprite.x, sprite.y)) return;
      sprite.x += 1;
    }
  } else {
    if (delta_y < 0) { // UP
      if (wall('up', sprite.x, sprite.y)) return;
      sprite.y -= 1;
    } else {           // DOWN
      if (wall('down', sprite.x, sprite.y)) return;
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
    sprite.engine = setTimeout(function() { moveSprite(sprite, x, y) }, time);
  }
};

function wall(direction, x, y) {
  var tile = map.tiles[y][x];

  switch(direction) {
    case 'up':
      return tile % 2 == 1;
    case 'right':
      return tile % 4 == 2 || tile % 4 == 3;
    case 'down':
      return tile % 8 >= 4;
    case 'left':
      return tile >= 8;
  };
};

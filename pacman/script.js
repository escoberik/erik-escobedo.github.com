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
  window.score = 0;

  window.lucero = {
    $el: $('#lucero'),
    speed: 4
  };
  window.ladrones = [
    {
      $el: $('#ladron0'),
      speed: 2
    },
    {
      $el: $('#ladron1'),
      speed: 1.5
    },
    {
      $el: $('#ladron2'),
      speed: 1.5
    },
    {
      $el: $('#ladron3'),
      speed: 1
    }
  ];

  $(map.tiles).each(function(y, row) {
    $(row).each(function(x, tile) {
      var $tile = generateTile(x, y, tile);
      map.$el.append($tile);
    });
  });

  start();

  map.$el.on('click', '.tile', function() {
    var x = $(this).data('x');
    var y = $(this).data('y');
    moveSprite(lucero, x, y);
    return false;
  });
});

var tile_width = 30;
var tile_height = 30;

function generateTile(x, y, tile) {
  return $('<div />').attr({ class: 'tile candy walls-' + tile }).data({
    x: x,
    y: y
  }).css({
    top: y * tile_width,
    left: x * tile_height
  });
};

function start() {
  window.lucero.x = 4;
  window.lucero.y = 9;
  window.lucero.stop = false;

  window.ladrones[0].x = 3;
  window.ladrones[0].y = 4;
  window.ladrones[0].direction = 'left';

  window.ladrones[1].x = 5;
  window.ladrones[1].y = 4;
  window.ladrones[1].direction = 'right';

  window.ladrones[2].x = 3;
  window.ladrones[2].y = 6;
  window.ladrones[2].direction = 'left';

  window.ladrones[3].x = 5;
  window.ladrones[3].y = 6;
  window.ladrones[3].direction = 'right';

  lucero.$el.css({
    top: lucero.y * tile_width,
    left: lucero.x * tile_height
  });
  clearTimeout(lucero.engine);
  $(ladrones).each(function(index, ladron) {
    ladron.$el.css({
      top: ladron.y * tile_width,
      left: ladron.x * tile_height
    });
    clearInterval(ladron.engine);
    ladron.engine = setInterval(function() { moverLadron(ladron) }, 1000 / ladron.speed);
  });
};

function moveSprite(sprite, x, y) {
  if (sprite.stop) return;
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

  $tile = $('.tile').eq(sprite.y * 9 + sprite.x);
  if ($tile.hasClass('candy')) {
    $tile.removeClass('candy');
    window.score += 1;
  }

  if (checkmap()) return;
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

function moverLadron(ladron) {
  var delta_x = lucero.x - ladron.x;
  var delta_y = lucero.y - ladron.y;

  newDirection = function(ladron) {
    switch(ladron.direction) {
      case 'up':
        if (delta_x > 0 && !wall('right', ladron.x, ladron.y)) return 'right';
        if (delta_x < 0 && !wall('left', ladron.x, ladron.y)) return 'left';
        if (wall('up', ladron.x, ladron.y)) {
          return wall('right', ladron.x, ladron.y) ? 'left' : 'right';
        }
        break;
      case 'right':
        if (delta_y > 0 && !wall('down', ladron.x, ladron.y)) return 'down';
        if (delta_y < 0 && !wall('up', ladron.x, ladron.y)) return 'up';
        if (wall('right', ladron.x, ladron.y)) {
          return wall('down', ladron.x, ladron.y) ? 'up' : 'down';
        }
        break;
      case 'down':
        if (delta_x < 0 && !wall('left', ladron.x, ladron.y)) return 'left';
        if (delta_x > 0 && !wall('right', ladron.x, ladron.y)) return 'right';
        if (wall('down', ladron.x, ladron.y)) {
          return wall('left', ladron.x, ladron.y) ? 'right' : 'left';
        }
        break;
      case 'left':
        if (delta_y < 0 && !wall('up', ladron.x, ladron.y)) return 'up';
        if (delta_y > 0 && !wall('down', ladron.x, ladron.y)) return 'down';
        if (wall('left', ladron.x, ladron.y)) {
          return wall('up', ladron.x, ladron.y) ? 'down' : 'up';
        }
        break;
    }
    return ladron.direction;
  };

  ladron.direction = newDirection(ladron);

  switch(ladron.direction) {
    case 'up':
      ladron.y -= 1;
      break;
    case 'right':
      ladron.x += 1;
      break;
    case 'down':
      ladron.y += 1;
      break;
    case 'left':
      ladron.x -= 1;
      break;
  }

  if (checkmap()) return;
  ladron.$el.animate({
    top: ladron.y * tile_width,
    left: ladron.x * tile_height
  }, 1000 / ladron.speed);
};

function checkmap() {
  var dead = false;
  $(ladrones).each(function(index, ladron) {
    if (ladron.x == lucero.x && ladron.y == lucero.y)
      dead = true;
  });
  if (!dead) return false;

  stop();
  setTimeout(start, 1000);
  return true;
};

function stop() {
  $(ladrones).each(function(index, ladron) {
    clearInterval(ladron.engine);
  });
  clearTimeout(lucero.engine);
  lucero.stop = true;
}

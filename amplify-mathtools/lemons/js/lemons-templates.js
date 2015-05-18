angular.module('mtLemons').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/lemonsToolTemplate.html',
    "<div class=mt-lemons-and-cups hm-touch=touch($event) hm-release=release($event) hm-drag=drag($event)><canvas class=mt-lemons-canvas>Error drawing canvas</canvas><canvas class=mt-lemons-background-canvas>Error drawing the background canvas</canvas></div>"
  );

}]);

angular.module('mtPoll').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('templates/pollToolTemplate.html',
    "<div><div class=modal-body><div class=\"mt-poll-container tab-content\" ng-repeat=\"question in poll.questions\"><div class=tab-pane ng-class=\"{'active':isSelected($index)}\"><div class=mt-question-text><h3 style=text-align:center>{{question.text}}</h3></div><div class=mt-poll-options><div class=mt-poll-option-span ng-repeat=\"option in question.options\"><img class=mt-icon-position ng-src=\"{{option.image}}\"><p class=\"mt-poll-font mt-poll-question mt-poll-question{{$index}}\">{{option.text}}</p></div></div><br><div class=mt-poll-options><div class=mt-poll-option-span ng-repeat=\"option in question.options\"><div class=mt-radio-button-holder><mt-poll-radio-button selectedanswer=\"{{isOptionSelected(question, $index)}}\" clicked=\"selectOption(question, $index)\"></div></div></div></div></div></div><div class=modal-footer><button class=\"btn mt-poll-first-button\" ng-class=\"{'disabled': firstButtonDisabled}\" ng-click=clickFirstButton()>{{firstActionLabel}}</button> <button class=\"btn btn-primary mt-poll-second-button\" ng-class=\"{'disabled': secondButtonDisabled}\" ng-click=clickSecondButton()>{{secondActionLabel}}</button></div></div>"
  );

}]);

/* 
 * @fileOverview Модель пользователя
 */

var User = Backbone.Model.extend({
    defaults: {
        id : "noId",
        name : "noName",
		avatarUrl : "img/no_ava.png"
    },
    initialize : function () {
    }
});
/* 
 * @fileOverview Модель фрагмента
 */

var Fragment = Backbone.Model.extend({
	defaults: {
		postId : "no_post_id",
		updateTime : "no_update_time",
		weight : "no_weight",
		tags : [],
		users : []
	}, 
	initialize : function () {
	}
});
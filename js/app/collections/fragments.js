
/* 
 */

var Fragments = Backbone.Collection.extend({
	model: Fragment,
	normalize : function ( data ) {
		return {
			postId : data.Post_ID,
			updateTime : data.updateTime,
			weight : data.Weight,
			tags : data.Tag,
			users : data.User
		};
	},
	parse : function ( data ) {
			var that = this;
		var parsed = _(data).map(this.normalize);
		_(parsed).map( function ( model ){
			that.add(model);
		})

		return parsed;
	}
});

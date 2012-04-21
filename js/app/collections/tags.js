
/* 
 */

var Tags = Backbone.Collection.extend({
	model: Tag,
	normalize : function ( data ) {
		
		return {
			id : data.tag_id, 
			name : data.name
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

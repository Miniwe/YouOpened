
/* 
 */

var Users = Backbone.Collection.extend({
	model: User,
	prepareAva : function (avaUrl) {

		return (avaUrl != null )? avaUrl :'img/no_ava.png'
	},
	normalize : function ( data ) {

		return {
			id : data.user_id,
			name : data.user_name,
			avatarUrl : this.prepareAva(data.avatar_url)
		};
	},
	parse : function ( data ) {
		var that = this;
		var parsed = _(data).map(this.normalize, this);
		_(parsed).map( function ( model ){
			that.add(model);
		});
		return parsed;
	}
});

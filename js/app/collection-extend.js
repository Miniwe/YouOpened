_.extend(Backbone.Collection.prototype, {
	setToAll : function ( attrs, except ) {
		_.each(this.models, function (model){
//			if (except != model) {
				model.set(attrs);
//			}
		});
	},
	findAll : function (field, value) {
		return this.filter(function (el) {
			return ( el.get(field) === value );
		});
	},
	find : function (field, value) {
		return _.find( this.models, function( model ){ 
			return (model.get(field) === value); 
		});
	}
});

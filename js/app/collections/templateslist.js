/* 
 * @fileOverview Обшаяя коллекция шаблонов
 * Позволяет вернуть нужный шаблон
 */

var TemplatesList = Backbone.Collection.extend({
    model: Template,
    search : function (field, value) {
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

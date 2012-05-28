/* 
 * @fileOverview Верхний блок = что искали по табу
 */

var SiteUserView = Backbone.View.extend({
	templateAuth: new Template({
		fileName: 'auth/user_on'
	}),
	templateNonAuth: new Template({
		fileName: 'auth/user_off'
	}),
	events : {
	},
	initialize : function () {
	},
	render : function () {
		$(this.el).empty();
		var template = this.templateNonAuth;
		if (this.model.isAuthorized()) {
			template = this.templateAuth;
		}
		
		var html = template.getTemplate() (this.model.toJSON());
		$(this.el).html(html);
		this.attachEvents();
		return this;
	},
	attachEvents : function () {

	}
});

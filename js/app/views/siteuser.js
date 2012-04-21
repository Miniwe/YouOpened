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
//		return console.log('render top');
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
		$(this.el).find("a.dropdown-toggle").click(function() {
			$(this).parents().toggleClass('open');
			
		});
	}
});

/* 
 * @fileOverview Заголовок для таба
 */

var TabHeaderView = Backbone.View.extend({
	tagName : 'li',
	template: new Template({
		fileName: 'app/tabheader'
	}),
	events : {
		"click": "changeTab",
		"click .closeTab": "closeTab"
	},
	initialize : function () {
		this.name = this.model.get("name");
		this.render();
	},
	getShortName : function (name) {
		var shortName = ((name.length > 18)?name.substring(0,18)+'..':name);
		return shortName;
	},
	render : function () {
		var html = this.template.getTemplate() ({
			name: this.name,
			shortName: this.getShortName(this.name)
		});
		$(this.el)
			.html(html)
			.appendTo("#tab-header");
		return this	;
	},
	refresh: function () {
		var html = this.template.getTemplate() ({
			name: this.name,
			shortName: this.getShortName(this.name)
		});
		$(this.el)
			.html(html);
		if (this.model.isActive()) {
			$("#tab-header li").removeClass("active");
			$(this.el).addClass("active");
		} else {
			$(this.el).removeClass("active");
		}
		return this	;
	},
	changeTab : function () {
		this.model.makeActive();
		return false;
	},
	closeTab : function () {
		this.trigger('closeTab');
		return false;
	}
});

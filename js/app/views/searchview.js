/* 
 * @fileOverview Верхний блок = что искали по табу
 */

var SearchView = Backbone.View.extend({
	template: new Template({
		fileName: 'app/searchview'
	}),
	events : {
	},
	initialize : function () {
		this.posts = this.model.get("posts");
		this.searchParams = this.posts.getSearchParams();
//		console.log('this.searchParams', this.searchParams);
	},
	render : function (renderMode) {


		if (renderMode == RenderMode.NEW) {
			$(this.el).empty();
		}
		
		var html = this.template.getTemplate() ({
			searchString : [],
			users: [],
			tags : []
		});
		
		$(this.el).html(html);
		
		this.renderString(this.searchParams.searchString);
		this.renderUsers(this.searchParams.users);
		this.renderTags(this.searchParams.tags);

		this.eventsAttach();
		
		return this;
	},
	renderString: function  ( str, selected ) {
		var rs = this;
		var cont = $(this.el).find(".items.searchstring");
		if ( this.searchParams.searchString == undefined  || this.searchParams.searchString == '') {
			return false;
		}
		$("<li>")
			.html(
				$("<span>")
					.addClass("label")
					.attr("title", this.searchParams.searchString)
					.html(this.searchParams.searchString)
			)
			.appendTo(cont)
		
	},
	renderUsers: function  ( users ) {
		var cont = $(this.el).find(".items.avatars");
		cont.empty();
		_.each(users, function (user) {
			var rs = this;
			var newLi = this.renderUser(user);
			newLi.appendTo(cont);
		}, this);
	},
	renderTags: function  ( tags ) {
		var cont = $(this.el).find(".items.tags");
		cont.empty();
		_.each(tags, function (tag) {
			var rs = this;
			var newLi = this.renderTag (tag);
			newLi.appendTo(cont)
		}, this);
	},
	renderUser : function ( item ) {
		var rs = this;
		var renderedItem =  $("<li>")
		.html(
			$("<img>")
			.attr("src", item.get("avatarUrl"))
			.attr("alt", item.get("name"))
			.attr("title", item.get("name"))
			);		
		return renderedItem;
	},
	renderTag : function (  item ) {
		var rs = this;
		var renderedItem = $("<li>")
		.html(
			$("<span>")
			.addClass("label notice")
			.attr("title", item.get("name"))
			.html(item.get("name"))
			);
		return renderedItem;
	},
	eventsAttach: function  ( ) {
		var rs = this.model.get("view").sidebar;
		$(".btn.new-search").unbind().click(function(){
//			console.log('btn click');
			rs.startSearch();
			return false;
		});
		$("#searchForm").unbind().submit(function(){
//			console.log('sf submit');
			$(".btn.new-search").click();
			return false;
		});
		
	}
});

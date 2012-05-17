/* 
 * @fileOverview Верхний блок = что искали по табу
 */

var SearchView = Backbone.View.extend({
	template: new Template({
		fileName: 'app/searchview'
	}),
	templatePostForm: new Template({fileName: 'posts/postform'}),
	initialize : function () {
		this.posts = this.model.get("posts");
		this.searchParams = this.posts.getSearchParams();
//		console.log('this.searchParams', this.searchParams);
	},
	showStartNew : function() {
		this.renderForm();
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
		$(".start-new").hide();
		if (this.renderFormFlag != undefined)
		{
			$(".start-new").show();
		}
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
	removeForm: function () {
		$("#scont").html("");
	},
	renderForm : function () {
		var searchView = this;
		this.removeForm();
		var params = {
			siteUser: "",// this.model.get("siteUser").toJSON()
			user: ""
		};
		var postForm = this.templatePostForm.getTemplate() (params);
		postForm = $(postForm).appendTo($("#scont"));

		$(postForm).find(".help-block").html("Start new conversation text");
		$(postForm).find(".btn.cancel")
			.show()
			.unbind()
			.click(function(){
				searchView.removeForm();
			});
		this.postFormEvents(postForm);
		return this;
	},
	postFormEvents:  function ( postForm ) {
		var searchView = this;
		$(postForm).find("#postMessage")
				.autoResize();

		$(postForm).submit(function(){
			var postParams = {
				postID: "",
				text: $(this).find("#postMessage").val()
			}
			console.log('start new params', postParams, searchView);
			
			searchView.model.startNewConversation(postParams);
			
			$(this).resetForm();
			
			searchView.removeForm();
			
			return false;
		})
	},
	
	eventsAttach: function  ( ) {
		var rs = this.model.get("view").sidebar;
		var searchView = this;
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
		$(".start-new").unbind().click(function(){
//			console.log('sf submit');
			searchView.showStartNew();
			return false;
		});
		
	}
});

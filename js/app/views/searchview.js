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
	
	getSortType : function() {
		if (this.posts.params.sortType == 'time') {
			return 'Sort by time ';
		}
		else if (this.posts.params.sortType == 'massive') {
			return 'Sort by comments';
		}
		else {
			return '';
		};
	},
	
	render : function (renderMode) {

		if (renderMode == RenderMode.NEW) {
			$(this.el).empty();
			
			var templateParams = {
				searchString : [],
				users: [],
				tags : [],
				link : "#invite/" + this.prepareUid(),
				sortType : this.getSortType()			 // this.sortType
			};
			
			var html = this.template.getTemplate() (templateParams);
			
			$(this.el).html(html);
			
		}
		
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
	
	prepareUid: function  ( ) {
		var uid = "";
		uid += this.prepareQuery(this.posts.params);
		uid = Base64.encode(uid);
		return uid;
	},
	
	prepareQuery: function ( params ) {
		var query = '';
		if (params.postID != undefined && params.postID.length > 0) {
			query += 'postID=' + params.postID + "&";
		}
		if (params.searchString != undefined && params.searchString != '') {
			query += 'searchString=' + params.searchString.toString() + '&';
		}
		if (params.userID != undefined && params.userID != '') {
			query += 'userID=' + params.userID.toString() + '&';
		}
		if (params.tagID != undefined && params.tagID != '') {
			query += 'tagID=' + params.tagID.toString() + '&';
		}
		query += 'sortType=' + params.sortType + '&';
		query += 'childSortType=' + params.childSortType + '&';
		
		console.log('prepare query', this.posts.parent, params, query);
		return query;
	},
	
	renderString: function  ( str, selected ) {
		var rs = this;
		var cont = $(this.el).find(".items.searchstring");
		var str = this.searchParams.searchString;
		if ( str == undefined  || str == '') {
			return false;
		}
		$("<li>")
			.html($("<span>")
				.addClass("label")
				.html(str)
			)
			.attr("title", this.searchParams.searchString)
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
			)
		.addClass("with-tooltip")
		.attr("title", item.get("name"))
		.attr("rel", item.get("tooltip"));		
		return renderedItem;
	},
	
	renderTag : function (  item ) {
		var rs = this;
		var renderedItem = $("<li>")
			.html($("<span>")
				.addClass("label label-info")
				.html(item.get("name"))
			)
			.attr("title", item.get("name"));
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

		$(postForm).find(".submit-form").val("Start conversation");
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
			
			$('.dropdown-toggle').dropdown();
			
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
		

		$("#searchbox")
			.unbind()
			.change(function (){
				rs.addToRequest( $(this).val() );
//				rs.startFilter();
			});
		$("#searchForm").submit(function(){
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
			$('.dropdown-toggle.start-new').dropdown();
//			return false;
		});
		
		$(this.el).find('.with-tooltip').tooltip({
			placement : "bottom",
			delay: { show: 500, hide: 100 }
		})
		
		var sorttypeSelected = $(this.el).find('.sorttype-selected');
		$(this.el).find(".sorttype-option").click(function(){
			rs.posts.params.sortType = $(this).attr("data-sorttype");
			sorttypeSelected.html($(this).html() +  " ");
			rs.posts.refresh();
		});
		
		$("#frlink").unbind().click(function (){
			var link = SERVER_HTTP_HOST() +  $(this).attr("href");

			if (window.clipboardData)  { // IE 
					window.clipboardData.setData("Text", link);
			}
			else {
		    window.prompt("To copy link to fragment press Ctrl+C и Enter", link);
			}
			return false;
		});
		
	}
});

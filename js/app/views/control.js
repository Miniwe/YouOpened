/* 
 * @fileOverview Блок выбора параметров	
 */

var Control = Backbone.View.extend({
	template: new Template({ fileName: 'app/control' }),
	templateSearchView: new Template({ fileName: 'app/searchview' }),
	templatePostForm: new Template({fileName: 'posts/postform'}),
		
	events : {
	},
	
	initialize : function () {
		this.initPosts(this.model.get("posts"));
		this.resetSelected();
		
		this.sidebar = $("#sidebar");
		this.searchView = $("#searchView");

		this.searchParams = this.posts.getSearchParams();
	},
	
	initPosts: function (posts) {
		this.posts = posts;
		this.params = posts.params;
		this.searchString = "";
		this.users = posts.users;
		this.tags = posts.tags;
		
	},
	
	resetSelected: function  ( ) { 
		this.selected = {
			searchString : '',
			users: new Users(),
			tags : new Tags()
		};
	},
	
	resetView: function  ( ) { 
		$("#sidebar").find(".looking, .items_searched").addClass("hidden");
		$("#sidebar").find(".items_searched.avatars, .items_searched.tags").html("");
		
		$("#searchbox").val("");
		
	},

	update : function ( posts ) {
		
		this.initPosts(posts);
		
		this.renderUsers(this.users.last(20), ".items.avatars");
		this.renderUsers(this.selected.users.models, ".items_searched.avatars");
		
		this.renderTags(this.tags.last(20), ".items.tags");
		this.renderTags(this.selected.tags.models, ".items_searched.tags");
		
		// update link to fragment
		$("#frlink").attr("href",  "#invite/" + this.prepareUid());
		
		// update sort by
		this.sortTypeEvent();

		// DO NEW TWITES !!!
		this.posts.parent.get('view').renderAlertLink();
		
		this.eventsAttach();
		
	},
	clear : function ( ) {
		this.sidebar.html("&#0160;");
	},
	render : function () {
		
		var html = this.template.getTemplate() ({ });
		this.sidebar.html(html);
		
			
		var templateParams = {
			link : "#invite/" + this.prepareUid(),
			sortType : this.getSortType()
		};
		var htmlSearchView = this.templateSearchView.getTemplate() (templateParams);
		this.searchView.html(htmlSearchView);
		
		this.renderStringSV(this.searchParams.searchString);
		this.renderUsersSV(this.searchParams.users);
		this.renderTagsSV(this.searchParams.tags);
		
		this.update(this.model.get('posts'));

		$(".start-new").hide();
		if (this.renderFormFlag != undefined)
		{
			$(".start-new").show();
		}
		
		return this;
	},
	
	renderStringSV: function  ( str ) {
		var cont = this.searchView.find(".items.searchstring");
		if ( str == undefined  || str == '') {
			return false;
		}
		$("<li>")
			.html($("<span>")
				.addClass("label")
				.html(str)
			)
			.attr("title", str)
			.appendTo(cont)
	},
	
	renderUsersSV: function  ( users ) {
		var cont = this.searchView.find(".items.avatars");
		cont.empty();
		_.each(users, function (user) {
			this.renderUserSV(user).appendTo(cont);
		}, this);
	},
	
	renderUserSV : function ( item ) {
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
	
	renderTagsSV: function  ( tags ) {
		var cont = $(this.el).find(".items.tags");
		cont.empty();
		_.each(tags, function (tag) {
			this.renderTagSV(tag).appendTo(cont)
		}, this);
	},
	
	renderTagSV : function (  item ) {
		var renderedItem = $("<li>")
			.html($("<span>")
				.addClass("label label-info")
				.html(item.get("name"))
			)
			.attr("title", item.get("name"));
		return renderedItem;
	},
	
	eventsAttach: function  ( ) {
		/*
		$(this.el).find('.with-tooltip').tooltip({
			placement : "bottom",
			delay: { show: 500, hide: 100 }
		});
		*/
		
		var control = this;
		var searchView = this.searchView;
		$(".btn.new-search").unbind().click(function(){
			control.startSearch();
			return false;
		});

		$("#searchbox")
			.unbind()
			.change(function (){
				control.addToRequest( $(this).val() );
//				rs.startFilter();
			});
		$("#searchForm").submit(function(){
			control.startSearch();
			return false;
		});
		
		$("#searchForm").unbind().submit(function(){
//			console.log('sf submit');
			$(".btn.new-search").click();
			return false;
		});
		
		$(".start-new").unbind().click(function(){
//			console.log('sf submit');
			control.showStartNew();
			$('.dropdown-toggle.start-new').dropdown();
//			return false;
		});
		
		searchView.find('.with-tooltip').tooltip({
			placement : "bottom",
			delay: { show: 500, hide: 100 }
		})

		this.frLinkEvent();
		
	},
	
	sortTypeEvent: function  () {
		var control = this;
		var sorttypeSelected = control.searchView.find('.sorttype-selected');
		sorttypeSelected.html( this.getSortType() );
		control.searchView.find(".sorttype-option").unbind().click(function(){
			control.setSortType($(this).attr("data-sorttype"))
			sorttypeSelected.html($(this).html() +  " ");
			control.posts.refresh();
		});
		
	},
	
	frLinkEvent: function  () {
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
		
	},
	
	emptyRequest: function  (searchParams) {
		var testStr = searchParams.searchString + searchParams.tagID + searchParams.userID;
		return (testStr == '');
	},
	
	startSearch: function  ( ) {
		var searchParams = this.prepareSearchRequest(this.selected);
		
		if (this.emptyRequest(searchParams)) {
			return false;
		} 
		
		var tabName = this.prepareTabName(this.selected);
		
		this.model.get("app").addTab( {
			name: tabName,
			searchParams: searchParams
		} );
		
//		this.resetSelected();

		return true;	
	},
	
	prepareTabName : function ( params ) {
		var tabName = '';
		if (params.tags != undefined && params.tags.length > 0) {
			tabName += params.tags.pluck("id").join(',') + " ";
		}
		if (params.users != undefined && params.users.length > 0) {
			tabName += params.users.pluck("id").join(',') + " ";
		}
		if (params.searchString != undefined && params.searchString != '') {
			tabName += params.searchString.toString();
		}
		if (params.postID != undefined && params.postID != '') {
			tabName += params.postID.toString();
		}
		return tabName;
	},
	
	startFilter: function  ( ) {
		// СДЕЛАТЬ ЧТОБ ПРИ ФИЛЬТРАЦИИ ТАБА ФИЛЬТР ПРИМЕНЯЛСЯ ТАКЖЕ ДЛЯ АКТИВНОГО ФРАГМЕНТА СРАЗУ
		// console.log('- - - - -  - - - - - - - - - - - - - - - -  ');
		var posts = this.posts;
		
		var searchParams = this.prepareSearchRequest(this.selected);
		
		searchParams = this.prepareFilterParams(searchParams);
		
		if (posts.rootPost().get('id') != this.model.get('posts').rootPost().get('id')) {
			// console.log('set filter control');
			posts.setFilter(_.extend(searchParams, {
				withChilds : 1
			}));
		}
		/*
		this.model.get('posts').setFilter(searchParams);
		var activeFrame = this.model.get('posts').parent.getActiveFrame();
		if (activeFrame) {
			activeFrame.get('view').control.startFilter();
		}
		*/
		
	},
	
	prepareFilterParams : function ( params ) {
		var prepared = {};
		if (params.searchString != "") {
			prepared.searchString = params.searchString;
		}
		if (params.userID != "") {
			prepared.userID = params.userID;
		}
		if (params.tagID != "") {
			prepared.tagID = params.tagID;
		}
//		if (!_.isEmpty(prepared))
		{
			// prepared.postID = this.posts.pluck('id').join(',');
		}
		return !_.isEmpty(prepared) ? prepared : false ;
	},
	
	prepareSearchRequest : function ( params ) {
		var prepared = {};
		if (params.searchString != undefined) {
			prepared.searchString = params.searchString.toString();
		}
		if (params.users != undefined && params.users.length > 0) {
			prepared.userID = params.users.pluck("id").join(',');
		}
		else {
			prepared.userID = "";
		}
		if (params.tags != undefined && params.tags.length > 0) {
			prepared.tagID = params.tags.pluck("id").join(',');
		}
		else {
			prepared.tagID = "";
		}
		return prepared;
	},
	
	renderUsers: function  ( users,  cont ) {

		var contEl = this.sidebar.find(cont);
		contEl.empty();
		
		_.each(users, function (user) {
			var newLi = this.renderUser( user );
			newLi.appendTo(contEl);
		}, this);
		
		if ( ".items_searched.avatars" == cont ) {
			this.showLooking('.avatars', this.selected.users);
		}
		this.typeboxEvents($(cont).parents(".widget"), 'users');
	},
	
	renderUser : function ( item ) {
		var control = this;
		var renderedItem =  $("<li>")
			.html(
				$("<img>")
					.attr("src", item.get("avatarUrl"))
					.attr("alt", item.get("name"))
					.attr("title", item.get("name"))
			)
			.addClass("with-tooltip")
			.attr("title", item.get("name"))
			.attr("rel", item.get("tooltip"))
			.click( function () {
				control.addToRequest( item );
				control.startFilter();
			});		
		return renderedItem;
	},
	
	renderTags: function  ( tags,  cont ) {
		var contEl = this.sidebar.find(cont);
		contEl.empty();
		
		_.each(tags, function (tag) {
			var newLi = this.renderTag( tag );
			newLi.appendTo(contEl);
		}, this);
		
		this.showLooking('.tags', this.selected.tags);

		this.typeboxEvents($(cont).parents(".widget"), 'tags');
	},
	
	renderTag : function ( item ) {
		var control = this;
		var renderedItem =  $("<li>")
		.html(
			$("<span>")
			.addClass("label label-info")
			.attr("title", item.get("name"))
			.html(item.get("name"))
			)
		.click( function () {
			control.addToRequest( item );
			control.startFilter();
		});		
		return renderedItem;
	},
	
	addToRequest: function  ( param ) {
		var added,
			res = false;

		if (param instanceof User) {
			var added = this.selected.users.get(param.id);
			if (added) {
				delete (this.selected.users.remove(added));
				res = false;
			}
			else {
				this.selected.users.add(param.toJSON());
				res = true;
			}
			this.renderUsers(this.selected.users.models, ".items_searched.avatars");
		}
		else if (param instanceof Tag) {
			var added = this.selected.tags.get(param.id);
			if (added) {
				delete (this.selected.tags.remove(added));
				res = false;
			}
			else {
				this.selected.tags.add(param.toJSON());
				res = true;
			}
			this.renderTags(this.selected.tags.models, ".items_searched.tags");
		}
		else {
			this.selected.searchString = param.toString();
			res = true;
		}
		return res;
	},
	
	showLooking: function  ( el, list ) {
		var widget = this.sidebar.find(".items"+el).parents(".widget");

		if (list.length > 0){
			widget.find(".looking").removeClass("hidden").show();
			widget.find("ul.items_searched").removeClass("hidden").show();
		}
		else {
			widget.find(".looking").addClass("hidden");
			widget.find("ul.items_searched").addClass("hidden");
		}
	},
	
	filterList : function ( str, list ) {
		var res = list.filter(function (item, index){
			return (item.get("name").indexOf(str) > -1);
		});
		return res;
	},
	
	renderFiltered : function ( widget, list ) {
		var cont = widget.find("ul.items");
		cont.empty();
		var count = 0;
		_.each(list, function( item ){
			if (count < 20) {
				this.renderItem( item ).appendTo(cont);
			}
			count++;
		}, this);
	},
	
	renderItem : function ( item ) {
		if (item instanceof Tag) {
			return this.renderTag( item );
		} 
		else if (item instanceof User){
			return this.renderUser( item );
		}
		return false;
	},
	
	typeboxEvents : function ( widget, type ) {
		var rs = this;
		var widgetEl = widget.find(".typebox");
		widgetEl.unbind('focus').unbind('blur').unbind('keyup')
		.focus(function () {
			var oldValue = $(this).attr("placeholder");
			$(this).attr("placeholder", $(this).attr("title"))
					.attr("title", oldValue)
					.addClass("pactive")
		})
		.blur(function () {
			var oldValue = $(this).attr("placeholder");
			$(this).attr("placeholder", $(this).attr("title"))
					.attr("title", oldValue)	
					.removeClass("pactive")
			widgetEl.keyup();
		})
		.keyup(function (){
			var str = $(this).val(),
				base = [];
				
			base = rs[type];
			
			if (str == '') {
				rs.renderFiltered(widget, base.models);
				return false;
			}
			else {
			   rs.renderFiltered(widget, rs.filterList(str, base));
			   return true;
			}
		})
		.change(function(){
			widgetEl.keyup();
		});
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
		
		return query;
	},

	removeForm: function () {
		$('.dropdown-toggle').dropdown(); 
		$("#scont").html("");
	},
	
	renderForm : function () {
		var searchView = this;

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
			
			var postParams = {
				postID: "",
				text: $(this).find("#postMessage").val()
			}
			
			searchView.model.startNewConversation(postParams);
			$(this).resetForm();
			searchView.removeForm();
			return false;
		})
	},
	
	setSortType : function(sortType) {
		
		if (this.posts.parent instanceof Frame) {
			this.posts.params.childSortType = sortType;
		}
		else {
			this.posts.params.sortType = sortType;
		}
	},
	getSortType : function() {
		var curSortType = this.posts.params.sortType;
		if (this.posts.parent instanceof Frame) {
			curSortType = this.posts.params.childSortType;
		}
		if (curSortType == 'time') {
			return 'Sort by time ';
		}
		else if (curSortType == 'massive') {
			return 'Sort by comments';
		}
		return '';
	},
	showStartNew : function() {
		console.log('show stat new');
		this.renderForm();
	}
	
	
});

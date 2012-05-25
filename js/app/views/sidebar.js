/* 
 * @fileOverview Блок выбора параметров	
 */

var SidebarView = Backbone.View.extend({
	template: new Template({
		fileName: 'app/sidebar'
	}),
	events : {
	},
	initialize : function () {
		this.initPosts(this.model.get("posts"));
		
		this.resetSelected();
	},
	initPosts: function (posts) {
		this.posts = posts;
		this.sortType = posts.params.sortType;
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
		$(this.el).find(".looking, .items_searched").addClass("hidden");
		$(this.el).find("#searchbox").val("");
		$(this.el).find(".items_searched.avatars, .items_searched.tags").html("");
	},
	prepareUid: function  ( ) {
//		console.log('this', this);
		var uid = "";
		uid += this.prepareQuery(this.posts.params);
//		console.log('uid',uid);
		uid = Base64.encode(uid);
		return uid;
	},
	prepareQuery: function ( params ) {
		var query = '';
		if (params.postID != undefined && params.postID.length > 0) {
			query += 'postID=' + params.postID + "&";
		}
		if (params.tags != undefined && params.tags.length > 0) {
			query += 'tagID=' + params.tags.pluck("id").join(',') + "&";
		}
		if (params.users != undefined && params.users.length > 0) {
			query += 'userID=' + params.users.pluck("id").join(',') + "&";
		}
		if (params.searchString != undefined && params.searchString != '') {
			query += 'searchString=' + params.searchString.toString();
		}
		return query;
	},
	render : function (renderMode, posts) {
		if (posts != undefined) {
//			console.log('frame posts', posts);
			// posts.compileSubData();
			this.initPosts(posts);
		}
		else {
			this.initPosts(this.model.get('posts'));
		}
		
		if (renderMode == RenderMode.NEW) {
			$(this.el).empty();
			var html = this.template.getTemplate() ({
				link : "#invite/"+this.prepareUid(),
				sortType : this.sortType
			});
			
			$(this.el).html(html);
			
			this.resetView();
			
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
		this.renderString(this.searchString); // 
		
		this.renderUsers(this.users.last(520), ".items.avatars");
		this.renderUsers(this.selected.users.models, ".items_searched.avatars");
		
		this.renderTags(this.tags.last(20), ".items.tags");
		this.renderTags(this.selected.tags.models, ".items_searched.tags");
		
		this.eventsAttach();
		
//		$("<div>"+ JSON.stringify(this.searchParams)+"</div>").appendTo("#innerRS");
		
		return this;
	},
	eventsAttach: function  ( ) {
		var sidebar = this;
		$(this.el).find("#sortType").change(function(){
			console.log("change sidebar sort type", sidebar, $(this).val());
			sidebar.posts.params.sortType = $(this).val();
			console.log('sidebar.posts.params', sidebar.posts.params);
			sidebar.posts.refresh();
		})
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
		
		this.selected.searchString = "";
		
//		this.resetSelected();
	},
	startFilter: function  ( ) {
		var posts = this.posts;
		if ( this.model.get('posts') != posts ) {
			posts = this.model.get('posts');
		}
		var searchParams = this.prepareSearchRequest(this.selected);
		searchParams = this.prepareFilterParams(searchParams);
		// console.log('call start filter from side bar', posts, searchParams);
		posts.setFilter(searchParams);
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

		return tabName;
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
	renderString: function  ( str ) {
		var rs = this;

		$("#searchbox")
			.val(str)
			.unbind()
			.change(function (){
				rs.addToRequest( $(this).val() );
//				rs.startFilter();
			});
		$("#searchForm").submit(function(){
			rs.startSearch();
			return false;
		});
	},
	renderUsers: function  ( users,  cont ) {

		var contEl = $(this.el).find(cont);
		contEl.empty();
		
		_.each(users, function (user) {
			var rs = this;
			var newLi = this.renderUser(user, contEl);
			newLi.appendTo(contEl);
		}, this);
		
		if ( ".items_searched.avatars" == cont ) {
			this.showLooking('.avatars', this.selected.users);
		}
		this.typeboxEvents($(cont).parents(".widget"), 'users');
	},
	renderUser : function ( item, cont) {
		var rs = this;
		var renderedItem =  $("<li>")
		.html(
			$("<img>")
			.attr("src", item.get("avatarUrl"))
			.attr("alt", item.get("name"))
			.attr("title", item.get("name"))
			)
		.click( function () {
//			console.log('user clicked');
			rs.addToRequest( item );
			rs.startFilter();
		});		
		return renderedItem;
	},
	renderTags: function  ( tags,  cont ) {
		var cont = $(this.el).find(cont);
		cont.empty();
		
		_.each(tags, function (tag) {
			var rs = this;
			var newLi = this.renderTag(tag, cont);
			newLi.appendTo(cont);
		}, this);
		
		this.showLooking('.tags', this.selected.tags);

		this.typeboxEvents($(cont).parents(".widget"), 'tags');
	},
	renderTag : function ( item, cont) {
		var rs = this;
		var renderedItem =  $("<li>")
		.html(
			$("<span>")
			.addClass("label notice")
			.attr("title", item.get("name"))
			.html(item.get("name"))
			)
		.click( function () {
			rs.addToRequest( item );
			rs.startFilter();
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
		var widget = $(this.el).find(".items"+el).parents(".widget");

//		console.log('show looking', widget, list.length);
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
			if (count < 520) {
				this.renderItem( item ).appendTo(cont);
			}
			count++;
		}, this);
	},
	renderItem : function (  item ) {
		if (item instanceof Tag) {
			return this.renderTag( item );
		} 
		else if (item instanceof User){
			return this.renderUser( item );
		}
	},	
	typeboxEvents : function ( widget, type ) {
		// console.log('call type box event DISABLED @TODO');
		// return false;
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
//			console.log('keyup');
			var str = $(this).val(),
				base = [];
				
			base = rs[type];
			
//			console.log('str', str, widget, base);				
			if (str == '') {
				console.log('render empty');
				rs.renderFiltered(widget, base.models);
				return false;
			}
			else {
			   rs.renderFiltered(widget, rs.filterList(str, base));
			}
		})
		.change(function(){
			console.log('change');
			widgetEl.keyup();
		});
	}
	
});

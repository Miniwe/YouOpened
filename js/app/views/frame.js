var FrameView = Backbone.View.extend({
	tagName : 'div',
	className : 'frame span10',
	template: new Template({
		fileName: 'posts/frame'
	}),
	templateAlert: new Template({
		fileName: 'posts/alert'
	}),
	templateMore: new Template({
		fileName: 'app/more'
	}),
	events: {
		"click .more-posts" : "loadMorePosts"
	},
	initialize: function () {
//		this.sidebar = new SidebarView ({
//			el: $("#sidebar"),
//			model: this.model
//		});
		this.posts = this.model.get("posts");
		this.sidebar = this.model.get('parent').get("view").sidebar;
	},
	showNewAlert : function () {
		
	},
	render : function () {
		this.clearFrame();
//		console.log('render fraMe', this.model.get("state"));
		if (this.model.isExpanded()) {
			this.renderAll();
			this.renderMoreLink();
			$(this.el).addClass("expanded");
			this.refreshSidebar();
		}
		else {
			$(this.el).removeClass("expanded");
			this.renderRoot();
		}

		return this;
		
	},
	renderPost: function( post ) {
		post.render();
		$(post.get("view").el).appendTo(this.el);
		return post;
	},
	renderNewPost: function( post ) {
		var rootPostEl = this.posts.rootPost().get("view").el;
		post.render();
		$(post.get("view").el).insertAfter(rootPostEl);
		return post;
	},
	renderMoreLink: function( ) {
		$(this.el).find("a.more-posts").parent().remove();
		if (this.model.isExpanded() && 
			this.posts.rootPost().get("childsCount") > this.posts.models.length) {
			$(this.templateMore.getTemplate() ({})).appendTo(this.el);
		}
	},
	renderAlertLink: function( newCount ) {
//		console.log('render alert link');
		var FrameView = this;
		var rootPostEl = this.posts.rootPost().get("view").el;
		this.removeAlertLink(rootPostEl);
		$(this.templateAlert.getTemplate() ({
			newCount: newCount
		})).appendTo(rootPostEl);
		$(this.el).find(".new-twits").click(function(){
//			console.log('frame view load new posts');
			FrameView.posts.loadNewPosts(newCount);
//			console.log('frame view remove alert link');
			FrameView.removeAlertLink();
//			console.log('AFTER !! frame view remove alert link');
			return false;
		})
	},
	removeAlertLink: function() {
		$(this.el).find(".alertnew").remove();
	},
	renderAll: function( ) {
		_.each(this.posts.models, function ( post ){
			this.renderPost(post);
		}, this);
	},
	renderRoot : function( ) {
		var post = this.posts.rootPost();
		this.renderPost(post);
	},
	clearFrame: function( ) {
		$(this.el).empty();
	},
	refreshSidebar : function () {
//		console.log('render side bar', this);
		this.sidebar.render(RenderMode.NEW, this.posts);
	},
	loadMorePosts : function ( ) {
		this.posts.nextChildPage();
		return false;
	},
	loadPosts : function ( postId) {
		
		var that = this.model,
			requestParams = {
				procedure: "getInfoFr",
				postID : postId,
				withChilds : this.get("state")
			};

		this.get("posts").updateParams(requestParams);
		this.get("posts").getData(function () {
			that.get("posts").setToAll({"parent" : that});
			that.makeActive();
		}, {});
	},
	openFrame: function( ) {
		this.render();
		$(this.el).addClass("expanded");
		this.scrollToView( 'animated' );
	},
	closeFrame: function( ) {
		this.render();
		var parentFrame = this.model;
		$(parentFrame.get("view").el).removeClass("expanded");
		$(parentFrame.get("view").el).css({"padding-top":"0"});
		parentFrame.get("view").render();
	},
	update : function () {
		if (!this.model.isExpanded()) {
			this.render();
			return false;
		}
		var firstNew = false,
			newPost = null;
		_.each(this.posts.models, function( model ){
			if ($(this.el).find(".postdiv[data-id="+model.get("id")+"]").length > 0) {
				model.get("view").update();
			}
			else {
				newPost = this.renderNewPost( model );
				if (!firstNew) {
					firstNew = newPost;
				}
			}
		}, this);
		$(this.el)
			.find('.postdiv').not(":first")
			.tsort({attr:"data-timestamp", order:"desc"});

		this.renderMoreLink();
		$(this.el).find(".frarment-toolbar").appendTo($(this.el));
		
		
		if (firstNew) {
			firstNew.get("view").scrollToView();
			this.refreshSidebar();
		}
	},
	updateByFilter : function () {
//		console.log("this.model.get('posts')", this.posts);
		_.each(this.model.get('posts').filteredList, function(post){
//			console.log('filtered posts', post)
		}, this);
	},
	scrollToView : function () {
	   this.posts.rootPost().get('view').scrollToView();
	}
});

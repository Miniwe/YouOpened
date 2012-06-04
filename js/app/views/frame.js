/*
 * вызов refreshControl
 * 	вызывает перерисовку
 * 		users
 * 		tags
 * 	вызывает изменение свойств 
 * 		sort by
 * 		link to fragment
 * 		newest twittes
 * 
 */
var FrameView = Backbone.View.extend({
	tagName : 'div',
	className : 'frame',
	template: new Template({
		fileName: 'posts/frame'
	}),
	templateAlert: new Template({
		fileName: 'posts/alert'
	}),
	templateMore: new Template({
		fileName: 'app/more'
	}),
	templateMessage: new Template({
		fileName: 'app/message'
	}),
	events: {
		"click .more-posts" : "loadMorePosts"
	},
	initialize: function () {
		this.control = this.model.get('parent').get("view").control;
	},
	showNewAlert : function () {
		
	},
	render : function () {
		this.clearFrame();
		if (this.model.isExpanded()) {
			this.renderAll();
			this.renderMoreLink();
			$(this.el).addClass("expanded");
			this.refreshControl();
		}
		else {
			$(this.el).removeClass("expanded");
			this.model.get('parent').get("view").refreshControl(RenderMode.UPDATE);
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
		var rootPost = this.model.get('posts').rootPost(),
			rootPostEl = false;
		if (rootPost.get("view") != undefined) {
			rootPostEl = rootPost.get("view").el;
		}
		if (!rootPostEl) {
			$(this.el).find(".postdiv[data-id="+rootPost.get("id")+"]").remove();
			rootPost.render();
			$(rootPost.get("view").el).prependTo(this.el);
			rootPostEl = rootPost.get("view").el
		}
		if (post.get('id') != rootPost.get('id')) {
			post.render();
			$(post.get("view").el).insertAfter(rootPostEl);
		}
		return post;
	},
	renderMoreLink: function( ) {
		var posts = this.model.get('posts');
		$(this.el).find("a.more-posts").parent().remove();
		if (this.model.isExpanded() && 
			posts.rootPost().get("childsCount") > posts.models.length) {
			$(this.templateMore.getTemplate() ({})).appendTo(this.el);
			$(this.el).find('.more-posts').html('more comments');
		}
	},
	renderAlertLink: function( newCount ) {
//		console.log('add event to new t b f');
		var FrameView = this;
		$(".new-twits").unbind().click(function(){
			FrameView.model.get('posts').loadNewPosts(newCount);
			FrameView.removeAlertLink();
			return false;
		})
	},
	removeAlertLink: function() {
//		$(this.el).find(".alertnew").remove();
	},
	renderAll: function( ) {
		
		var rootPost = this.model.get('posts').rootPost();
		var fragmentView = this;
		
		if (!rootPost) {
			$(this.templateMessage.getTemplate() ({
				message : "Posts not found"
			})).appendTo(this.el);
		}
		
		this.renderRoot();
		
		var models = this.model.get('posts').filter(function(model){
			return model.id != rootPost.id;
		});

		if (models.length > 0) {

			models = _.sortBy(models, function(model){
				return -1 * model.get("createTimestamp");
			});
			_.each(models, function ( model ){
				
				this.renderPost(model);
			}, this);
		}

	},
	renderRoot : function( ) {
		var post = this.model.get('posts').rootPost();
		this.renderPost(post);
	},
	clearFrame: function( ) {
		$(this.el).empty();
	},
	refreshControl : function () {
		this.control.update(this.model.get('posts'));
	},
	loadMorePosts : function ( ) {
		this.model.get('posts').nextChildPage();
		return false;
	},
	openFrame: function( ) {
		this.render();
		$(this.el).addClass("expanded");
		this.scrollToView( );
	},
	closeFrame: function( ) {
		this.render();
		$(this.el).removeClass("expanded");
		//this.scrollToView( );
		// $(this.el).css({"padding-top":"0"});
	},
	update : function () {
		if (!this.model.isExpanded()) {
			this.render();
			return false;
		}
		var firstNew = false,
			newPost = null;
		_.each(this.model.get('posts').models, function( model ){
			if ($(this.el).find(".postdiv[data-id="+model.get("id")+"]").length > 0) {
				if (model.get("view") == undefined) {
					this.renderNewPost( model );
				}
				else {
					model.get("view").update();
				}
			}
			else {
				newPost = this.renderNewPost( model );
				// if (!firstNew)
				{
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
			this.refreshControl();
		}
		
		return true;
	},
	updateByFilter : function () {
//		console.log("this.model.get('posts')", this.model.get('posts'));
		_.each(this.model.get('posts').filteredList, function(post){
//			console.log('filtered posts', post)
		}, this);
	},
	scrollToView : function () {
		var rootPost = this.model.get('posts').rootPost().get('view');
		 if (rootPost) {
			rootPost.scrollToView();
		 } 
		 else {
			
		 }
	}
});

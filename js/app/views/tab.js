/* 
 * @fileOverview Вид таба 
 */

var TabView = Backbone.View.extend({
	tagName : 'div',
	className : 'tab',
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
		_(this).bindAll('closeTab');
		
		this.tabHeader = new TabHeaderView ({
			model: this.model
		});
		this.tabHeader.bind("closeTab", this.closeTab);

		this.control = new Control ({
			model: this.model
		});
		
	},
	clearTab : function ( ) {
		$(this.el).empty();
		$("#tab-content").empty();
		$("body#application").scrollTop(0);
	},
	render : function () {
//		console.log('render NEW');
		this.tabHeader.render();
		
		this.update(RenderMode.NEW);

		$(this.el).attr("data-cid", this.model.cid);
		return this	;
	},
	renderAlertLink: function( newCount ) {
		var TabView = this;
		$(".new-twits")
			.parent().hide();
		$(".new-twits")
			.find(".ntcount").html("");

		$(".new-twits")
			.find(".ntcount").html(newCount)
		$(".new-twits")
			.parent().show();
		
		$(".new-twits").unbind().click(function(){
			console.log('call load new twits');
			TabView.model.get("posts").loadNewPosts(newCount);
			TabView.removeAlertLink();
			return false;
		})
	},
	removeAlertLink: function() {
		$(".new-twits")
			.parent().hide();
		$(".new-twits")
			.find(".ntcount").html("");

		$(".new-twits")
			.parents('').show();
			
	},
	renderMoreLink: function( ) {
		
		var view = this;
		
		$(this.el).find("a.more-posts").parent().remove();
		if (this.model.isActive()/*&& this.model.get('frames').length > 9*/) {
			$(this.templateMore.getTemplate() ({})).appendTo(this.el);
		}
		$(this.el).find("a.more-posts").click(function(){
			view.loadMorePosts();
		})
	},
	renderPageHeader : function () {
		this.tabHeader.refresh();
	},
	refreshControl: function (renderMode) {
		switch (renderMode) {
			case RenderMode.NEW:
				this.control.render();
				break;
			case RenderMode.UPDATE:
				this.control.update(this.model.get('posts'));
				break;
			case RenderMode.CLEAR:
				this.control.clear();
				break;
			default:
				this.control.render();
		}
	},
	update : function (renderMode) {
		if (!this.model.isActive()) {
			return false;
		}
		this.renderPageHeader();
		
		this.refreshControl(renderMode);
		
		var container = $(this.el);
		
		this.clearTab();
		$(container).appendTo("#tab-content");
		if (this.model.get("frames").length > 0) {
			var frames = this.model.get("frames");
			if (this.model.get("posts").params.sortType == "massive") {
				frames = frames.sortBy(function(frame){
					return frame.get("posts").rootPost().get("childsCount");
				});
			}
			else {
				frames = frames.sortBy(function(frame){
					return frame.get("posts").rootPost().get("createTimestamp");
				});
			}
			
			

			// console.log('in render FRAMES', this.model.get("frames").models);
			_.each(frames, function (frame) {
				var view;
				view = frame.render().el;
				$(view).prependTo(container);
				/*
				// @todo make new and update
				if (frame.get('view') == undefined || frame.get('view').el == undefined) {
				}
				else {
				}
				*/
			});
			this.removeAlertLink();		
			this.renderMoreLink();
		}
		else {
			$(this.templateMessage.getTemplate() ({
				message : "Fragments not found"
			})).prependTo(container);
		}
	},
	loadMorePosts : function ( ) {
		console.log('load more Fragments');
		this.model.get("posts").nextFragmentsPage();
		return true;
	},
	updateByFilter : function () {
		_.each(this.model.get("posts").filteredList, function(post){
			// get frame by post
			var frame = this.model.get("frames").getFrameByPost(post.id);
			if (!frame) {
				return false;
			}
			// get frame view
			var frameView = frame.get("view");
			// add class shadow if fragmentWeigth <= 0
			if (post.fragmentWeight <=0) {
				frame.toggleState();
				frame.setStateCollapsed();
				$(frameView.el).addClass("shadowed");
			}
			// else remove shadowClass
			else {
				$(frameView.el).removeClass("shadowed");
			}
			// @todo amnimate change opaciti
		}, this);
//		console.log('update by filter from tab', this.model.getActiveFrame());
		if (!this.model.getActiveFrame()) {
			this.refreshControl(RenderMode.UPDATE);
		}
	},
	closeTab : function () {
		this.tabHeader.remove();
		this.refreshControl(RenderMode.CLEAR);
		$(this.el).remove();
		this.model.collection.setState(this.model.cid, TabState.DEFAULT);
	}
});

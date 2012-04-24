/* 
 * @fileOverview Вид таба 
 */

var TabView = Backbone.View.extend({
	tagName : 'div',
	className : 'tab',
	templateAlert: new Template({
		fileName: 'posts/alert'
	}),
	initialize: function () {
		_(this).bindAll('closeTab');
		
		this.tabHeader = new TabHeaderView ({
			model: this.model
		});
		this.tabHeader.bind("closeTab", this.closeTab);

		this.sidebar = new SidebarView ({
			el: $("#sidebar"),
			model: this.model
		});
		
		this.searchView = new SearchView ({
			el: $("#searchView"),
			model: this.model
		});

		this.posts = this.model.get("posts");
		this.frames = this.model.get("frames");

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
//		console.log('render alert link');
		var TabView = this;
		this.removeAlertLink();
		var a = $(this.templateAlert.getTemplate() ({
			newCount: newCount
		})).appendTo($("#searchView"));
		
		$("#searchView").find(".new-twits").click(function(){
			TabView.model.get("posts").loadNewPosts(newCount);
			TabView.removeAlertLink();
			return false;
		})
	},
	removeAlertLink: function() {
		$("#searchView").find(".alertnew").remove();
	},
	renderPageHeader : function () {
		this.tabHeader.refresh();
	},
	refreshSidebar : function () {
		this.sidebar.render();
	},
	update : function (renderMode) {
		console.log('in render', this.model.get("state"), renderMode);
		if (!this.model.isActive()) {
			return false;
		}
		this.renderPageHeader();
		if (!this.model.get("posts").filterParams) {
			this.sidebar.render(renderMode);
			
		}
		
		var container = $(this.el);
		
		// if (renderMode == RenderMode.NEW)
		{
			this.searchView.render(renderMode);
		}
		this.clearTab();
		$(container).appendTo("#tab-content");
		
		console.log('in render FRAMES', this.model.get("frames").models);
		_.each(this.model.get("frames").models, function (frame) {
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
	},
	updateByFilter : function () {
		_.each(this.model.get("posts").filteredList, function(post){
			// get frame by post
			var frame = this.frames.getFrameByPost(post.id);
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
			this.sidebar.render(RenderMode.NEW);
		}
	},
	closeTab : function () {
		$(".page-header h1").empty();
		this.tabHeader.remove();
		$(this.sidebar.el).empty();
		$(this.searchView.el).empty();
		$(this.el).remove();
		this.model.collection.setState(this.model.cid, TabState.DEFAULT);
	}
});

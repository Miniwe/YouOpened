/* 
 * @fileOverview Модель фрейма
 */

var Frame = Backbone.Model.extend({
	defaults: {
		state : FrameState.COLLAPSED
	},
	events: {
		"change:state" : "autoUpdate"
	},
	initialize : function () {
		var frame = this;
		this.bind('change:state', this.autoUpdate);
		this.set({
			"posts": new Posts()
//			'newParams' : this.get('parent').get('newParams')
		});
		this.get("posts").parent = this;
		
		this.get("posts").bind("updatedCount", function () {
//			console.log('refresh this FRAME by auto update COUNT COUNT COUNT', arguments);
			frame.updateNewCountEvent(arguments[0]);
		});
		this.get("posts").bind("updated", function () {
//			console.log('update frame process', frame.get("posts"));
//			frame.update(AddMode.UPDATE);
			frame.get("view").update(RenderMode.UPDATE);
		});
		this.get("posts").bind("filtered", function () { 
			frame.get("view").updateByFilter();
		});
		
	},
	getView : function () {
		var view = false;
		if (view = this.get("view")) {
			return view;
		}
		else {
			return this.render();
		}
	},
	makeActive : function () {
		this.set({
			"state" : FrameState.EXPANDED
		});
	},
	updateNewCountEvent : function ( count ) {
		var newCount = arguments[0];
		if (newCount > 0) {
			if (this.get("state") == FrameState.EXPANDED) {
				this.get("view").renderAlertLink( newCount );
			}
			else {
				this.get("view").removeAlertLink( );
			}
		}
		else {
		}
	},
	render : function () {
		this.set({
			'view': new FrameView({
				model: this
			}) 
		});
		return this.get('view').render();
	},
	autoUpdate : function () {
		if (this.get("state") == FrameState.EXPANDED) {
			this.setUpdateOn();
		}
		else {
			this.setUpdateOff();
		}
	},
	setUpdateOn : function ( ) {
		this.get("posts").setUpdateCountFlag(true);
	},
	setUpdateOff : function ( ) {
		this.get("posts").setUpdateCountFlag(false);
	},
	updateRootData : function ( post ) {
		this.get("posts").rootPost().updateData(post);
	},
	addRootData : function ( post ) {

		var newPosts = this.get("posts");
		newPosts.add(post.toJSON());

		newPosts.updateParams( post.collection.params );
		newPosts.updateParams( { "postID": post.get("id") });
		
		newPosts.updateFilterParams( post.collection.filterParams );


		newPosts.compileSubData();
		
		this.set({
			'posts': newPosts
		});
		
	},
	toggleState : function () {
		var exceptThis = this;
		this.collection.closeFrames( exceptThis );
		if ( this.get("state") == FrameState.COLLAPSED ) {
			this.setStateExpanded();
		}
		else {
			this.setStateCollapsed();
		}
	},
	setStateExpanded : function () {
		this.set({
			"state" : FrameState.EXPANDED
			});
	},
	setStateCollapsed : function () {
		this.set({
			"state" : FrameState.COLLAPSED
			});
	},
	getWeight : function () {
		return this.get("posts").rootPost().get("fragment").get("weight");
	},
	disableIfNull : function () {
		if (this.getWeight() == 0) {
			$(this.get('view').el).addClass("shadowed");
		}
		else {
			$(this.get('view').el).removeClass("shadowed");
		}
	},
	isExpanded	: function () {
		return (this.get("state") == FrameState.EXPANDED);
	},
	refresh	: function () {
//		console.log('refresh', this);
		this.changeActiveClass();
		this.trigger("checkActiveFrame");
		
	},
	changeActiveClass : function () {
		if (this.get("state") == FrameState.COLLAPSED) {
			// clear frame data
//			console.log('close frame', this);
			this.get("view").closeFrame();
		}
		else {
//			console.log('open frame', this);
			this.get("view").openFrame();
			// close other
		}
	}
});

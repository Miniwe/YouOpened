/* 
 * @fileOverview Модель таба
 */

var Tab = Backbone.Model.extend({
	defaults: {
		name : '*new tab',
		state : TabState.DEFAULT,
		posts : new Posts(),
		frames : new Frames()
	},
	events: {
		"change:state" : "changeActiveClass"
	},
	initialize : function () {
		this.bind('change:state', this.changeActiveClass);
		this.resetTabData();
	},
	resetTabData : function () {
		var tab = this;
		this.set({
			'posts': new Posts(),
			'frames': new Frames()
		});
		this.get("posts").parent = this; // @todo Must Be Removed
		
		this.get("posts").bind("updatedCount", function () {
			tab.updateNewFragmentCountEvent(arguments[0]);
		});
		this.get("posts").bind("updated", function () {
			// console.log('tab mast be updated');
			tab.update(AddMode.REPLACE);
			tab.get("view").update(RenderMode.NEW);
		});
		this.get("posts").bind("filtered", function () { 
			tab.get("view").updateByFilter();
		});
	},
	getData : function () {
		
		var tab = this;
		this.get("posts").updateParams(this.get("searchParams"));
//		console.log('this.get("posts")', this.get("posts").params);
		
		(new TRequest()).doPath(this.get("posts").params);
		
		this.get("posts").getData(function () {
			tab.update(AddMode.REPLACE);
			tab.makeActive();
		});
	},
	update : function (addMode) {
		if (addMode == AddMode.REPLACE) {
			// clear tab frames data
			this.set({"frames": new Frames()});
		}
		// console.log('update tab with frames', this.get('frames'), this.get("posts").models);
		_.each( this.get("posts").models, function (model) {
			var frame = this.get("frames").getFrameByPost(model.id);
			if ( frame ) {
				frame.updateRootData(model);
			}
			else {
				frame = this.addFrame(model);
			}
		}, this);
		// console.log('update tab data');
	},
	makeActive : function () {
		this.collection.setState(this.cid, TabState.ACTIVE);
	},
	changeActiveClass : function () {
		var activeFrame = this.getActiveFrame();

		if ( this.get("state") == TabState.ACTIVE) {
			if (this.get("view") == undefined) { // @todo проверить по cid и по view el 
				this.render();
			}
			else {
				this.get("view").update(RenderMode.NEW);
			}
			
			this.get("posts").setAutoUpdateNewCount(true);
		}
		else {
			this.get("posts").setAutoUpdateNewCount(false);
			
		}
		this.setFramesAutoUpdate(this.get("state"));
	},
	setFramesAutoUpdate : function ( state ) {
		_.each(this.get('frames').models, function(frame){
			if (state == TabState.ACTIVE) {
				frame.autoUpdate();
			}
			else {
				frame.setUpdateOff();
			}
		});
	},
	render : function () {
		this.set({
			'view': new TabView({
				model: this
			}) 
		});
		this.get("view").render(RenderMode.NEW);
	},
	/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - */
	updateNewFragmentCountEvent : function ( newCount ) {
		if (newCount > 0) {
			this.get("view").renderAlertLink( newCount );
		} else {
			this.get("view").removeAlertLink( );
		}
	},
	startUpdateWithFilter : function () {
		var searchParams = this.get("posts").prepareSearchRequest(this.get("newParams"));
		this.updateWithFilter({searchParams: searchParams});
	},
	checkActiveFrame : function () {
		var activeFrame = this.getActiveFrame();
		if ( !activeFrame ) {
			 this.get("view").sidebar.render(RenderMode.NEW);
		} 
	},
	updateWithFilter : function (options) {
		var tab = this;
		options.searchParams.postID = this.get("posts").getIds();

		this.get("posts").updateParams(options.searchParams);
		this.get("posts").getData(function () {
			tab.updateFrames(AddMode.UPDATE);
			tab.get("view").updateTab(RenderMode.UPDATE);
			tab.disableNullFrames();
		});
	},
	updateFrames : function ( addMode ) {
		var frames;
		if (addMode == AddMode.UPDATE) {
			frames = this.get("frames");
		}
		else {
			frames = new Frames();
		}

		_.each( this.get("posts").models, function (model) {
			var frame = frames.getFrameByPost(model.id);
			if ( frame ) {
				frame.updateByPost(model);
			}
			else {
				frame = this.addFrame(model);
				
			}
		}, this);
		this.set({
			"frames": frames
		});
	},
	addFrame : function ( frameData ) {
		var frame = new Frame({
			parent : this,
			app: this.get("app")
		});
		frame.bind("checkActiveFrame", this.checkActiveFrame, this);
		frame.addRootData( frameData );
		this.get("frames").add(frame);
		return frame;
	},
	updatePosts : function ( addMode ) {
		var posts = new Posts();
		if (addMode == AddMode.UPDATE) {
			posts = this.get("posts");
		}
		_.each( this.get("posts").models, function (model) {
			var post = posts.get(model.id);
			if ( post ) {
				post.updateData(model);
			}
			else {
				posts.add(model);
			}
		}, this);
		this.set({
			"posts": posts
		});
		this.updateFrames( addMode );
	},
	disableNullFrames : function ( ) {
		_.each( this.get("frames").models, function (model) {
			model.disableIfNull();
		}, this);
	},
	isActive : function ( ) {
		return (this.get("state") == TabState.ACTIVE);
	},
	getActiveFrame : function () {
		return this.get("frames").getExpanded();
	}
	
});
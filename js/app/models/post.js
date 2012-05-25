/* 
 * @fileOverview Модель поста
 */

var Post = Backbone.Model.extend({
	defaults: {
		id : "no_post_id",
		pid : "no_post_pid",
		user : "no_user",
		fragment : "no_fragment",
		text : "no_post_text",
		createTime : "no_post_createTime",
		createTimestamp : "no_post_createTimestamp",
		tags : "no_post_tags",
		childsCount : 0,
		weight : 0,
		siteUser: null,
		renderForm : false
	}, 
	events: {
		"change:childsCount" : "updateChildsCount"
	},
	initialize : function () {
		this.bind('change:childsCount', this.updateChildsCount);
	},
	render : function () {
		this.set({
			'view': new PostView({
				model: this
			}) 
		});	
		this.get('view').render();
	},
	getFragmentWeight : function () {
		if (this.get("fragment") != 'no_fragment' && this.get("fragment") instanceof Fragment) {
			return this.get("fragment").get("weight");
		}
		else {
			return 0;
		}
	},
	isActiveFrame : function () {
//		log('this', this);
		return this.collection.parent.get("state");
	},
	updateData : function ( post ) {
		_.extend(this.attributes, post.attributes);
//		log('update existing post', this, post);
	},
	updateChildsCount : function ( post ) {
		var El = false;
		if (this.get("view")) {
			this.get("view").update();
		}
		else {
			if (El = this.getEl()) {
				this.set({
					'view': new PostView({
						model: this,
						el: El
					})
				});	
				this.get('view').update();
			}
		}
	},
	getEl : function ( ) {
		return $(".postdiv.row[data-id="+ this.get('id') +"]");
	},
	sendReply : function ( params ) {
		var posts = this.collection;
		var replyPosts = new Posts();
		replyPosts.updateParams(params);
		replyPosts.getData( function () {
			if (posts.updateWithNew(replyPosts)) {
				posts.parent.get("view").update();
			}
		}, {
			url : AppConfig.SERVER + 'PostMessage.json'
		});
	},
	loadRelatives : function ( postId ) {

		this.collection.page = 1;
		this.collection.childPage = 1;
		this.collection.params.offset = 0;
		this.collection.params.childOffset = 0;
		
		var posts = this.collection;
		var state = posts.parent.get("state");
		var subparams = {
			"postID": postId,
			"withChilds" : state
		};
		
		// params = this.applyParentFilter(params);
		var params = posts.prepareParams(subparams);
		params.searchString = "";
		params.userID = "";
		params.tagID = "";
		
		posts.loadData ( function () {
			posts.parent.refresh();
			var maxId =  posts.shiftMax();
			console.log('posts', posts);
			
			var users = posts.pluck('user');
			var userID = '';
			_.each(users, function(user){
				userID += "," + user.get('id');
			});
			userID = userID.substring(1,userID.length);
			console.log('pluck users', userID);
			(new TRequest()).prepareRequest({
			 userID : userID,
			 max_id : maxId
			 }).doUserPath();
		}, params,  {} );
		
			
	},
	applyParentFilter : function ( params ) {
		return params;
	},
	openChilds : function () {
		if ( this.collection.rootPost() == this ) {
			this.collection.parent.toggleState();
		}
		
		if (this.collection.parent.get('state') == FrameState.EXPANDED) {
//			console.log('load more childs');
			this.loadRelatives(this.get("id"));
		}
		else {
//			console.log('dont load - open root');
			var posts = this.collection;
			var params = {
				"postID": this.get("id"),
				"withChilds" : posts.parent.get("state")
			};
			params = this.applyParentFilter(params);
			posts.updateParams(params);
			posts.parent.refresh();
		}
	},
	openParent : function () {
		this.loadRelatives(this.get("pid"));
	}
});

/*
	closeFrame : function () {
//		this.get("parent").set({"state": FrameState.COLLAPSED});
		var parentFrame = this.get("parent");
		parentFrame.addCollection( new Posts(this.toJSON()) ); // reset collection to root post
//		parentFrame.set({"state": FrameState.COLLAPSED});
		$(parentFrame.get("view").el).removeClass("expanded");
		$(parentFrame.get("view").el).css({"padding-top":"0"});
		parentFrame.get("view").render();
				
	}
 */
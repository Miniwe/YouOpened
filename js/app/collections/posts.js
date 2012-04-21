/* 
 * Posts
 * Получение данных по params 
 * Обновлние условий params 
 * Получение количества новых записей по params 
 * Обновление posts по params для новых записей
 * Получение допонительных posts по params = next page
 * Фильтрация данных по filterParams + postIds = применение новых значений 
 * Применение параметров фильтра после обновления массива postID
 * Запуск триггера на обновление отображения
 * - Возможно - но не факт что надо оставить один массив posts и с ним работат но это порождает различные варианты поведения
 */
// this.loadMode = "update";

var Posts = Backbone.Collection.extend({
	model: Post,
	loadMode: "replace",
	pageSize: 10,
	childPageSize: 4,
	autoUpdate: false,
	autoUpdateCount: false,
	autoUpdateFragmensCountFlag: false,
	initialize : function () {
		this.page = 1;
		this.childPage = 1;
		this.params = {
			withChilds: 0,
			childSortType: "time",
			sortType : "time",
			count : this.pageSize,
			offset : 0,
			childCount : this.childPageSize,
			childOffset : 0
		};
		this.filterParams = false;
		this.filteredList = [];
		this.users = new Users();
		this.tags = new Tags();
		this.fragments = new Fragments();
	},
	url : function ( ) {
		return  AppConfig.SERVER + 'Search.json';
	},
	setFilter : function ( params ) {
		this.filterParams = params; 
		this.applyFilter();
	},
	updateParams : function (params) {
//		console.log('add params', params);
		_.extend(this.params, params);
	},
	updateFilterParams : function (params) {
//		console.log('add params', params);
		_.extend(this.filterParams, params);
	},
	getData : function ( success, fetchParams ) {
		var fetchOptions = {
			data: this.params,
			dataType: 'jsonp',
			jsonp: 'jsonp_callback',
			success : success
		};
		_.extend( fetchOptions, fetchParams);
		delete(fetchOptions.data.users);
		delete(fetchOptions.data.tags);
		this.fetch(fetchOptions);
	},
	setUpdateFlag : function ( flag ) {
		var old = this.autoUpdate;
		this.autoUpdate = flag;
		if (this.autoUpdate && (old != this.autoUpdate)) {
			this.autoUpdatePosts();
		}
	},
	applyFilter : function ( ) {
		if (this.filterParams) {
//			this.filterParams.postID = this.pluck('id').join(',');
			
			var posts = this;
			var newPosts = new Posts();
			
			newPosts.params = posts.filterParams;
			newPosts.getData(function (){
				posts.filteredList = [];
				newPosts.each(function(post){
					posts.filteredList.push({
						id: post.id,
						weigth: post.get("weight"),
						fragmentWeight: post.getFragmentWeight()
					});
				});
				posts.trigger("filtered");
			}, {});
		}
		
	},
	autoUpdatePosts : function ( ) {
//		console.log('this posts params', this.params);
		if (this.autoUpdate) {
//			console.log('--> update one more');
			var posts = this;
			var newPosts = new Posts();
			
			newPosts.params = posts.params;
			newPosts.getData(function (){
				posts.updateCollection(newPosts);
				posts.trigger("updated");
				posts.applyFilter();
			}, {});
				
			setTimeout(function() {
				posts.autoUpdatePosts( );
			}, 6000);
			
		}
        		
	},
	setUpdateCountFlag : function ( flag ) {
		var old = this.autoUpdateCount;
		this.autoUpdateCount = flag;
		if (this.autoUpdateCount && (old != this.autoUpdateCount)) {
			this.autoUpdatePostsCount();
		}
	},
	autoUpdatePostsCount : function ( ) {
//		console.log('auto update fragment'); 
		if (this.autoUpdateCount) {
			var posts = this;
			var rootPost = this.rootPost();
//			console.log('rootPost', rootPost);
			var data = {
				postID : rootPost.get('id'),
				fromTime : rootPost.get('fragment').get("updateTime"),
				withChilds: 0
			};
			var oldValue = rootPost.get("childsCount");
			var ajaxOpts = {
				type      : 'get',
				url       : AppConfig.SERVER + 'Search.json',
				success   : function (data, textStatus, jqXHR) {
					if (posts.autoUpdateCount) {
						posts.trigger('updatedCount', data.Posts[0].ChildCount - oldValue);
					}
				},
				complete : function () {
					setTimeout(function () {
						posts.autoUpdatePostsCount();
					}, 6000);
				},
				dataType  : 'jsonp',
				jsonp     : 'jsonp_callback',
				data      : data,
				error     : function () {	
					console.log('error in posts:updateNewCount');
					return true;
				},
				timeout   : 30000
			}; 
			$.ajax( ajaxOpts );	
		}
        		
	},
	getMaxTimeFragmentsUpdate : function ( ) {
		var fragments = this.pluck('fragment');	
		var lastFragment  = _.max(fragments, function(fragment){ return fragment.get("updateTime"); });
		return (lastFragment instanceof Fragment)?lastFragment.get("updateTime"):0;	
	},
	setUpdateFragmentsCountFlag : function ( flag ) {
		var old = this.autoUpdateFragmensCountFlag;
		this.autoUpdateFragmensCountFlag = flag;
		if (this.autoUpdateFragmensCountFlag && (old != this.autoUpdateFragmensCountFlag)) {
			this.autoUpdateFragmentsCount();
		}
	},
	autoUpdateFragmentsCount : function ( ) {
		if (this.autoUpdateFragmensCountFlag) {
			var posts = this;
			var data = {
				procedure : "getNewResultCount",
				fromTime : this.getMaxTimeFragmentsUpdate(),
				withChilds: 0
			};
			_.extend(data, this.params);
			var ajaxOpts = {
				type      : 'get',
				url       : AppConfig.SERVER + 'Search.json',
				success   : function (data, textStatus, jqXHR) {
//					console.log('success', data);
					if (data.Count > 0) {
						posts.trigger('updatedFragmentsCount', data.Count);
					}
				},
				complete : function () {
					setTimeout(function () {
						posts.autoUpdateFragmentsCount();
					}, 6000);
				},
				dataType  : 'jsonp',
				jsonp     : 'jsonp_callback',
				data      : data,
				error     : function () {	
					console.log('error in fragments post count:updateNewFragmentsCount');
					return true;
				},
				timeout   : 30000
			}; 
			$.ajax( ajaxOpts );	
		}
        		
	},
	updateCollection : function (newPosts) {
		var newFlag = false;
		_.each(newPosts.models, function( model ){
			var existing = this.get(model.get("id"));
			if (existing) {
				existing.updateData(model);
			}
			else {
				this.add(model.toJSON());
				newFlag = true;
			}
		}, this);
		return newFlag;
		
		return true;
	},
	getOffset : function (page,  size) {
		return (page - 1) * size;
	},
	loadNewPosts : function ( count ) {
//		console.log('load new posts 1');
		var posts = this;
		var newPosts = new Posts();
		var params = {
			postID: this.rootPost().get("id"),
			childCount :  count,
			withChilds: 1,
			childSortType: "time"
		};
		newPosts.updateParams (params);
		newPosts.getData(function (){
//			console.log('load new posts 3', newPosts);
			posts.updateCollection(newPosts);
//			console.log('load new posts 4', posts);
			posts.trigger("updated");
			console.log('applieng filter for fragment');
			posts.applyFilter();
		}, {}
		);
	},
	loadNewFragments : function ( count ) {
		var posts = this;
		var newPosts = new Posts();
		var params = {
			count :  count,
			withChilds: 0,
			sortType: "time"
		};
//		console.log('load new posts 2');
		newPosts.updateParams (params);
		newPosts.getData(function (){
			posts.updateCollection(newPosts);
//			console.log('load new posts 4', posts);
			posts.trigger("updated");
			posts.applyFilter();
		}, {}
		);
	},
	nextChildPage : function ( ) {
		var posts = this;
		var newPosts = new Posts();
		this.childPage += 1;
		newPosts.childPage = this.childPage;
		var params = {
			childOffset: newPosts.getOffset( newPosts.childPage, newPosts.childPageSize ),
			postID: this.rootPost().get("id"),
			childCount :  newPosts.childPageSize,
			withChilds: 1,
			childSortType: "time"
		};
		newPosts.updateParams (params);
		newPosts.getData(function (){
			posts.updateCollection(newPosts);
			posts.trigger("updated");
		}, {}
		);
	},
	updateWithNew : function ( newPosts ) {
		var updateFlag = false;
		_.each(newPosts.models, function( model ){
			var existing = this.get(model.get("id"));
			if (existing) {
				existing.updateData(model);
			}
			else {
				this.add(model.toJSON());
				updateFlag = true;
			}
		}, this);
		return updateFlag;
	},
	normalizeParams : function ( params ) {
		var normalized = params;

		if ( params.userID != undefined ) {
			var tmpUsers = params.userID.split(',');

			normalized.users = _.filter(this.users.models, function (user){
				return (_.indexOf(tmpUsers, user.get('id')) > -1)
			});

		}
		if ( params.tagID != undefined ) {
			var tmpTags = params.tagID.split(',');
			normalized.tags = _.filter(this.tags.models, function (tag){
				return (_.indexOf(tmpTags, tag.get('id')) > -1)
			});
		}

		return normalized;
	},
	getSearchParams : function () {
		return this.normalizeParams(_.clone(this.params)); // @todo clone BAD not working
	},
	compileSubData : function () {
		// @todo remove from anywere and add to end of parse
		this.users = new Users();
		this.tags = new Tags();
		this.fragments = new Fragments();

		_.each(this.models, function (model){
			if (!this.users.find("id", model.get("user").get("id"))) {
				this.users.add(model.get("user"));
			}
			else {
					// @todo maybe update 
			}
			_.each(model.get("tags"), function (tag){
				if (!this.find("id", tag.get("id"))) {
					this.add( tag );
				}
				else {
					// @todo maybe update 
				}
			}, this.tags);
			
			this.fragments.add({
				postId : model.get("id"),
				updateTime : model.get("createTime"),
				weight : 0,
				tags : model.get("tags"),
				users : model.get("user")
			});
		}, this);
	},
	makeRequestparams : function ( ) {
		var params = this.params;
		if ( !_.isEmpty(params)) {
			return "?" + _.map(params, function(value, key) {
				return key + "=" + value;
			}).join("&");
		} 
		else {
			return "";
		}
	},
	normalize : function ( data ) {
		var that = this;
		var tags = _.map(data.Tag, function (tag) {
			return that.tags.find('id', tag);
		});
		
		return {
			id : data.Post_ID,
			pid : data.Ppost_ID,
			user : this.users.find("id", data.user_id),
			fragment : this.fragments.find("postId", data.Post_ID),
			text : data.Text,
			createTimestamp : data.createTime,
			createTime : formatDate(data.createTime),
			tags : tags,
			weight: data.Weight,
			childsCount : data.ChildCount
		};
	},
	parse : function ( response ) {
		var Posts = response.Posts;
		if (this.loadMode == 'update') {
			Posts = this.removeDoubles(response.Posts);
		}
		
		this.users = new Users();
		this.tags = new Tags();
		this.fragments = new Fragments();
		this.users.parse(response.Users);
		this.tags.parse(response.Tags);
		this.fragments.parse(response.Fragments);
		
		var parsedPosts = _(Posts).map(this.normalize, this);
		return parsedPosts;
	},
	updated : function ( ) {
		console.log('it updateD');
	},
	removeDoubles : function ( Posts ) {
		var noDoublesPosts = [];
		_.each(Posts, function(post, i){
			var existingPost = this.get(post.Post_ID);
			if (existingPost) {
				existingPost.updateData(this.normalize(post));
			}
			else {
				noDoublesPosts.push(post);
			}
		},  this);
		return noDoublesPosts;
	},
	rootPost : function ( ) {
		return this.at(0);
	},
	rootPost : function ( ) {
		return this.at(0);
	},
	getIds: function () {
		return this.pluck("id").join(",");
	},
	getNewCount : function ( ) {
		var posts = this;
        
        this.updateNewCount();
		
        if (this.autoUpdate) {
			setTimeout(function() {
				posts.getNewCount();
			}, 6000);
		}
        		
	}
});

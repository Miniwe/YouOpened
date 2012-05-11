/* 
== Posts
Таб 
	Получение количества новых постов (фрагментов) по таймеру
		Отображение кнопки новые посты для таба для количества новых > 0
			Кнопка исчезает при нажатии или если новых < 0
	Обновление (добавление) к существующим постам (и фреймам) новых
		в результате клика на кнопке Новые посты
		в результате клика на кнопке More post (ранее написанные фрагменты)
			кнопка исчезает при нажатии
		То есть получаем для фрагмент таба
	При открытии фрагмента учитывается существующий фильтр
	При выборе параметров sidebar и запуске search создается новый таб с соответсвующими условиями
	При смене таба загружается состояние учитывающие предыдущий поиск и наложенный фильтр
Фрагмент
	Получение количества новых постов (по родительскому ID ) по таймеру
		Отображение кнопки новые посты для фрагмента для количества новых > 0
			Кнопка исчезает при нажатии или если новых < 0
	Обновление (добавление) к существующим постам новых
		в результате клика на кнопке Новые посты
		в результате клика на кнопке More post (ранее написанные посты)
			кнопка исчезает при нажатии
	Получение списка постов при нажатии на фильтр для таба и фрагмента
		То есть получаем для фрагмента и вызываем получение для таба
	При выборе параметров sidebar и запуске search создается новый таб с соответсвующими условиями
	При смене таба загружается состояние если активный фрагмент то загружается его контент учитывая предыдущий поиск 
	и наложенный фильтр
		
==================
Таб вид
	кнопка новые посты
	кнопка еще посты
	установка/запуск  условий
		поиска
		фильтра
	открытие фрагмента
Фрагмент вид
	кнопка новые посты
	кнопка еще посты
	установка/запуск  условий
		поиска
		фильтра
	закрытие фрагмента
	смена рутового поста фрагмента
Posts
	таймер на обнолвение списка постов
	trigger об обновлении
	trigger на фольтр ()?

 */

var Posts = Backbone.Collection.extend({
	model: Post,
	pageSize: 10,
	childPageSize: 4,
	autoUpdate: false,
	autoUpdateNewCount: false,
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
		
		this.comparator = function(post) {
		  return post.get("createTime");
		};
	},
	url : function ( ) {
		return  AppConfig.SERVER + 'Search.json';
	},
	setFilter : function ( params ) {
		// console.log('call set filter');
		
		var posts = this;
		
		this.filterParams = params; 
		
		var params = this.prepareParams({});
		
		(new TRequest()).prepareRequest(this.params).prepareFilter(this.filterParams).doPath();
		
		this.loadData(function(){
			// console.log('call update after filter', posts);
			posts.trigger('updated');
		}, params, {
			
		});
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
		this.loadData(success, this.params, fetchParams);
	},
	loadData : function (success, params, fetchParams ) {
		var fetchOptions = {
			data: params,
			dataType: 'jsonp',
			jsonp: 'jsonp_callback',
			success : success
		};
		_.extend( fetchOptions, fetchParams);
		
		delete(fetchOptions.data.users);
		delete(fetchOptions.data.tags);
		
		this.fetch(fetchOptions);
	},
	applyFilter : function ( ) {
		console.log('apply dont need pocible - commented');
		return false;
		if (this.filterParams) {
//			this.filterParams.postID = this.pluck('id').join(',');
			console.log('call to apply filter');
			return false;
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
	setAutoUpdateNewCount : function ( flag ) {
		var old = this.autoUpdateNewCount;
		this.autoUpdateNewCount = flag;
		if (this.autoUpdateNewCount && (old != this.autoUpdateNewCount)) {
			this.autoUpdateNewCountPosts();
		}
	},
	autoUpdateNewCountPosts : function ( ) {
		if (this.autoUpdateNewCount) {
			var posts = this;
			
			var params = this.prepareParams({
				procedure: "getNewResultCount",
				fromTime : this.getMaxTimeFragmentsUpdate(),
			});
			
			this.updateFragmentsCount();
			this.getTwitterDataByFragments();
			
			var ajaxOpts = {
				type      : 'get',
				url       : AppConfig.SERVER + 'Search.json',
				success   : function (data, textStatus, jqXHR) {
					if (posts.autoUpdateNewCountPosts) {
						posts.trigger('updatedCount', data.Count);
					}
				},
				complete : function () {
					setTimeout(function () {
						posts.autoUpdateNewCountPosts();
					}, 90000);
				},
				dataType  : 'jsonp',
				jsonp     : 'jsonp_callback',
				data      : params,
				error     : function () {	
					console.log('error in posts:autoUpdateNewCountPosts');
					return true;
				},
				timeout   : 30000
			}; 
			$.ajax( ajaxOpts );
		}
        		
	},
	getTwitterDataByFragments : function ( ) {
		var posts = this;
		var fragments = this.pluck('fragment').filter(function(fragment){
			return fragment != "no_fragment";
		});
		var maxPost = this.at(0).id;
		var requests = [];
		if (fragments.length == 1) {
			console.log('fragments length')
			maxPost = this.max(function(post){
				return post.id;
			});
			
			requests.push({
				sinceId : maxPost.id,
				toUser : maxPost.get('user').id
			});
		}
		else if (fragments.length > 1) {
			_.each(fragments, function (fragment){
				var rootPost = posts.get(fragment.get('postId'));  
				requests.push({
					sinceId : rootPost.id,
					toUser : rootPost.get('user').id
				});
			});	
		}
		else {
			return false;
		}
		
		for (var i=requests.length; i--; ) {
			// console.log('requests[i]', requests[i]);
			(new TRequest()).prepareRequest(requests[i]).doUserPath();
		}
		// по каждому фрагменту получить его рутовый пост
		// maxRootid = rootPostId
		// max id = max (maxRootid,  childs(root))
		// get userid root
		// сделать по каждому фрагменту цикл   
	},
	updateFragmentsCount : function ( ) {
		var posts = this;
		// get fragments root post ids
		var ids = this.pluck('id');
		// get request by fragments without childs
		var params = this.prepareParams({
			postID : ids.join(','),
			withChilds: 0
		});
		params.tagID = '';
		params.userID = '';
		params.searchString = '';
		
		var ajaxOpts = {
			type      : 'get',
			url       : AppConfig.SERVER + 'Search.json',
			success   : function (data, textStatus, jqXHR) {
				posts.updatedFragmentsCountData(data);
			},
			dataType  : 'jsonp',
			jsonp     : 'jsonp_callback',
			data      : params,
			error     : function () {	
				console.log('error in posts:updateFragmentsCount');
				return true;
			},
			timeout   : 30000
		}; 
		$.ajax( ajaxOpts );
		
		// update fragmnets count
		// call trigger by count update
	},
	updatedFragmentsCountData : function ( data ) {
		var posts = this;
		_.each(data.Posts, function (postData){
			var post = posts.get(postData.Post_ID);
			if (post) {
				post.set({"childsCount": postData.ChildCount });
			}
		});
	},
	getMaxTimeFragmentsUpdate : function ( ) {
		var fragments = this.pluck('fragment');
		var lastFragment  = _.max(fragments, function(fragment) {
			if (fragment instanceof Fragment) {
				return fragment.get("updateTime");
			}
			else {
				return 0;
			}	
		 });
		 if (this.rootPost() == undefined) {
		 	return 0;
		 }
		return (lastFragment instanceof Fragment)?lastFragment.get("updateTime"):this.rootPost().get('createTimestamp');	
	},
	updateCollection : function (newPosts) { // depricated
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
	extendParams : function (obj, exten) {
		var base = {
			userID : obj.userID || '',
			tagID : obj.tagID || ''
		};
		obj = _.extend(obj, exten);
		
		var key = "userID";
		if (exten[key] != undefined) {
			obj[key] = base[key].split(','); 
			_.each(exten[key].split(','), function(v){
				obj[key].push(v); 
			});
			obj[key] = _.uniq(obj[key]).join(',');
		}
		
		key = "tagID";
		if (exten[key] != undefined) {
			obj[key] = base[key].split(','); 
			_.each(exten[key].split(','), function(v){
				obj[key].push(v); 
			});
			obj[key] = _.uniq(obj[key]).join(',');
		}
		// if (extended.tagID != undefined) {
			// obj.tagID = _.uniq(base_tagID.split(',').push( exten.tagID.split(',') )).join(','); 
		// }
		return obj;
	},
	prepareParams : function ( subparams ) {
		var params = {};
		
		params = this.extendParams(params, this.params);
		 
		if (this.filterParams) {
			params = this.extendParams(params, this.filterParams);
		}
		params = this.extendParams(params, subparams);
		 
		return params;
	},
		// params.userID += (subparams.userID != undefined && subparams.userID != '') ? ',' + subparams.userID : ''; 
		// params.tagID += (subparams.tagID != undefined && subparams.tagID != '') ? ',' + subparams.tagID : '';
	loadNewPosts : function ( count ) {
		var posts = this;
		//var newPosts = new Posts();
		var subparams = {};
		
		if (this.params.postID != undefined) {
			_.extend(subparams, {
				childCount : 10//count
			});
		} else {
			_.extend(subparams, {
				count : 10//count
			});
		}
		var params = this.prepareParams(subparams);
		
		posts.loadData(function () {
			//posts.updateCollection(newPosts);
			posts.trigger("updated");
			// posts.applyFilter();
		}, params);
	},
	nextChildPage : function ( ) {
 		var posts = this;
		
		var newPosts = new Posts();
		
		this.childPage += 1;
		var params = this.prepareParams({
			childOffset: newPosts.getOffset( posts.childPage, newPosts.childPageSize ),
			withChilds: 1
		});
		params.tagID = '';
		params.userID = '';
		params.searchString = '';
		
		newPosts.loadData(function(){
			posts.updateCollection(newPosts);
			posts.trigger('updated');
		}, params, {});
	},
	nextFragmentsPage : function ( ) {
		
		var posts = this;
		
		this.page += 1;
		var params = this.prepareParams({
			offset: posts.getOffset( posts.page, posts.pageSize ),
			withChilds: 0
		});
		posts.loadData(function(){
			posts.trigger('updated');
		}, params, {});
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
		console.log('it updated in posts');
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
		var rootPost = this.at(0);
		var fragments = this.pluck('fragment').filter(function(fragment){
			return fragment != "no_fragment";
		});
		if (fragments.length == 1) {
			rootPost = this.get(fragments[0].get('postId'));
		}
		return rootPost;
	},
	getIds: function () {
		return this.pluck("id").join(",");
	}
});

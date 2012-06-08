
/*
 * @fileOverview Корневая модель приложения
 * 
 * @todo 
 *	определить в роутере фукнцию 
 *	которая будет вызавыть из Application стартовую загрузку 
 *	перенести в нее вывод коллекции
 *	и в целом научиться в роутере запускать функции Application
 *	по возможности сделать так чтоб они друг о друге знали меньше
 * 
 * @todo
 *	определять видимые фреймы и только по ним делать обновления
 */

// ========================================================================== //
var Application = Backbone.Model.extend({
	defaults: {
		tabs : new Tabs()
	},
	addInvite: function (uid) {
		if (uid == "") {
			return false;
		}
		this.addTab(this.parseUid(uid));
	},
	addTab : function (params) {
		params.app = this;
		var newTab = new Tab(params);
		this.get('tabs').add(newTab);
		newTab.getData();
	},
	applyAuthDecoration : function (app, user) {
		Post.prototype.defaults.renderForm = true;
		Post.prototype.defaults.siteUser = user;
		
		Control.prototype.renderFormFlag = true;
		Control.prototype.siteUser = user;
		
		app.addTab({
			name: "My talks",
			searchParams: {
				userID : user.get("id"),
				sortType : 'time'
			}
		});
		
	},
	setSiteUser : function () {
		this.set({
			siteUser: new SiteUser()
		});
	},
	initialize : function () {
		this.setRouter();
		
		this.setTemplates();
		
		this.setSiteUser();
	
		this.render();
		
		this.startApplication();
		
		var app = this;
		this.get("siteUser").bind("setAuthorized", function (user) {
			app.applyAuthDecoration(app, user);
		});
		
	},
	getActiveTab : function () {
		return this.get("tabs").getActive();
	},
	getActive : function () {
		var activeTab = false;
		var activeFrame = false;
		if (activeTab = this.getActiveTab()) {
			activeFrame = activeTab.getActiveFrame();
		}
		return activeFrame ? activeFrame : activeTab;
	},
	parseUid: function (uid) {
		var parsed = Base64.decode(uid);
		parsed = this.parseQuery(parsed);
		
		return {
			name: this.prepareTabName(parsed),
			searchParams: parsed
		};
	},
	prepareTabName : function ( params ) {
		var tabName = 'Invite: ';
		if (params.tagID != undefined && params.tagID != "") {
			tabName += params.tagID + " ";
		}
		if (params.userID != undefined && params.userID != "") {
			tabName += params.userID + " ";
		}
		if (params.postID != undefined && params.postID != "") {
			tabName += params.postID + " ";
		}
		if (params.searchString != undefined && params.searchString != '') {
			tabName += params.searchString.toString();
		}
		return tabName;
	},
	parseQuery: function (query) {
		var queryString = {};
		query.replace(
				new RegExp("([^?=&]+)(=([^&]*))?", "g"),
				function($0, $1, $2, $3) { queryString[$1] = $3; }
		);
		return queryString;
	},
	render : function () {
		this.set({
			'view': new ApplicationView({
				el : $("#application"),
				model: this
			}) 
		});
		this.get("view").render();
	},
	setRouter : function () {
		this.set({
			app_router : new AppRouter
		});
		this.get('app_router').app = this;
		Backbone.history.start();
	},
	setTemplates : function () {
		this.set({
			templatesList : new TemplatesList()
		});
	},
	startApplication : function () {
		// this.addTab({
		// name: "Admire",
		// searchParams: {
		// searchString : 'woman',
		// tagID: 'admire'
		// }
		// });
//		this.addTab({
//			name: "Long Request line",
//			searchParams: {
//				userID : 'killinemkels,RihannasWiFE,megbracey,KMartian_Artist,TheVagician__,SheIsAnele,seobified,happimomo26'
//			}
//		});

		//this.addTab({
		//	name: "girls",
		//	searchParams: {
		//		searchString : 'girls'
		//	}
		//});
		//this.addTab({
		//	name: "i am",
		//	searchParams: {
		//		userID : 'XandFalcon2012'
		//	}
		//});
		/*
		var a=new Date();
		a.setTime((new Date()).getTime() - 60*60*24*1000); 
		this.addTab({
			name: "Bigest talks",
			searchParams: {
				searchString : '',
				sortType : 'time',
				fromTime : Math.round(a.getTime() / 1000)
			}
		});
		*/
		//this.addTab({
		//	name: "girls*time",
		//	searchParams: {
		//		searchString : 'girls',
		//		sortType : 'massive'
		//	}
		//});
		
		this.addTab({
			name: "woman*mix",
			searchParams: {
				searchString : 'woman',
				userID : '  NiCizHere,Henz_Cher,AdrianneCurry,cocosworld',
				//tagID : 'sore,vocabulary,springer',
				sortType : 'massive'
			}
		});
		
		//this.addTab({
			//name: "to Twitter",
			//searchParams: {
			//	userID : 'ldnnavy,StephanieRosee2',
			//	tagID : 'guess',
				//searchString : 'happy'
				//}
		//});
	}
   
});

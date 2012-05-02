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
	setSiteUser : function () {
		this.set({
			siteUser: new SiteUser()
		});
	},
	setRouter : function () {
		this.set({
			app_router : new AppRouter
		});
		Backbone.history.start();
	},
	setTemplates : function () {
		this.set({
			templatesList : new TemplatesList()
		});
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
	initialize : function () {
		this.setRouter();
		
		this.setTemplates();
		
		this.setSiteUser();
	
		this.render();
		
		this.startApplication();
		
		this.get("siteUser").bind("setAuthorized", this.applyAuthDecoration);
		
	},
	applyAuthDecoration : function (user) {
		Post.prototype.defaults.renderForm = true;
		Post.prototype.defaults.siteUser = user;
	},
	addTab : function (params) {
		params.app = this;
		var newTab = new Tab(params);
		this.get('tabs').add(newTab);
		newTab.getData();
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
	startApplication : function () {
		this.addTab({
			name: "Admire",
			searchParams: {
				searchString : 'woman',
				tagID: 'admire'
			}
		});
//		this.addTab({
//			name: "Long Request line",
//			searchParams: {
//				userID : 'killinemkels,RihannasWiFE,megbracey,KMartian_Artist,TheVagician__,SheIsAnele,seobified,happimomo26'
//			}
//		});
		this.addTab({
			name: "woman",
			searchParams: {
				searchString : 'woman'
			}
		});
		this.addTab({
			name: "to Twitter",
			searchParams: {
				userID : 'ldnnavy,StephanieRosee2',
				tagID : 'guess',
				searchString : 'happy'
			}
		});
	}
   
});

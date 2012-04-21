/* 
 * @fileOverview Модель пользователя сайта 
 */

var SiteUser = User.extend({
	events: {
		"change:authorized": "setAuthorized"
	},
    initialize : function () {
		this.bind("change:authorized", this.setAuthorized);
		this.set({
			authorized: false,
			view: new SiteUserView({
				el : $("#userarea"),
				model: this
			}) 
		});
		this.processAuth();
    },
	processUserOff : function (data) {
		this.set({"authorized": false});
	},
	processUserOn : function (data) {
		this.fillModelData(data);
		this.set({"authorized": true});
	},
	fillModelData : function (data) {
		this.set(this.normalize(data.User));
	},
	processResponse : function (data) {
		if (undefined == data.Result 
			|| undefined == data.Result.isAuthorized 
			|| 0 == data.Result.isAuthorized) {
			
			this.processUserOff(data);
		}
		else {
			this.processUserOn(data);
		}
		this.get('view').render();
	},
    processAuth : function () {
		var siteUser = this; 
		var data = {};
		var ajaxOpts = {
			type      : 'get',
			url       : AppConfig.SERVER + 'AuthInfo.json',
			success   : function (data, textStatus, jqXHR) { 
				siteUser.processResponse(data);
				return true;
			},
			dataType  : 'jsonp',
			jsonp     : 'jsonp_callback',
			data      : data,
			error     : function () {	
				log('error in application:userProcess');
				return true;
			},
			timeout   : 30000
		}; 

		$.ajax( ajaxOpts );	

    },
	prepareAva : function (avaUrl) {

		return (avaUrl != null )? avaUrl :'img/no_ava.png'
	},
	normalize : function ( data ) {

		var n= {
			id : data.userId,
			name : data.userName,
			avatarUrl : this.prepareAva(data.avatarUrl)
		};

		return n;
	},
    setAuthorized : function () {
		if (this.isAuthorized()) {
			this.trigger('setAuthorized', this);
		}
	},
    isAuthorized : function () {
		return this.get("authorized");
    }
});
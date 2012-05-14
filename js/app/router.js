/* 
 * @fileOverview Роутер приложения
 * 
 */

var AppRouter = Backbone.Router.extend({
	routes: {
		"invite/:uid": "invite",
		"testajax": "testajax",
		"*actions": "defaultRoute" 
	},
	defaultRoute: function (actions) {
//		console.log('default');
	},
	testajax: function( ){
//		console.log('test ajax');
		
//		alert('ta 1');
		var ajaxOpts = {
			url       : AppConfig.SERVER + 'Search.json',
			success   : function (data, textStatus, jqXHR) { 
				console.log('ajax result', data);
				return true;
			},
			dataType  : 'jsonp',
			jsonp     : 'jsonp_callback',
			data      : {},
			error     : function() {
				console.log('ajax error');
			},
			timeout   : 30000
		}; 

		$.ajax( ajaxOpts );
	},
	invite: function( uid ){
		this.app.addInvite(uid)
	}
});


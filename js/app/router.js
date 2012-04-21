/* 
 * @fileOverview Роутер приложения
 * 
 * @todo
 *	Узнать у Жени нужно ли ему точно параметл jsonp=jsonp_callback в запросе ?
 *	Исправить MIME type для результатов ajaxP запроса к серверу
 */

var AppRouter = Backbone.Router.extend({
	routes: {
		"/invite/:uid": "invite",
		"/testajax": "testajax",
		"*actions": "defaultRoute" 
	},
	defaultRoute: function (actions) {
	},
	testajax: function( ){
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
		console.log( 'invite to ', uid ); 
	}
});


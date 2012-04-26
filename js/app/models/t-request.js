/* 
 * @fileOverview Общение с твиттером
 */

console.log('twitter here');

var TwitterUser = Backbone.Model.extend({
	defaults : {
		userId : "",
		userJson : ""
	},
	getJson : function() {
		
	}
});
var TwitterUsers = Backbone.Collection.extend({
	model : TwitterUser,
	getSelfJsons : function () {
		console.log('this', this);
		// add request result to user linked field
		_.each(this.models, function(model){
			model.getJson();
		});
	} 
});
var TRequest = Backbone.Model.extend({
    defaults: {
        query : "noQuery",
        data : "noData"
    },
    initialize : function () {
    },
    prepareRequest : function (request) {
    	var prepared = request;
    	return prepared;
    },
    getUniq : function ( data, baseResponse ) {
    	// var dataUsers = baseResponse; 
    	// _.each(data.sers, function(userData){
    		// var user = new TwitterUsers(userData);
    	// })
    	// return [];
    },
    getBaseData : function ( data, callback ) {
    	callback();
    	return data;
    },
    sendAllToServer : function ( ) {
    	return true;
    },
    doPath : function ( request ) {
    	var tRequest = this;
		// create object for our server
		var data = {
			request: {},
			baseData : {},
			users : new TwitterUsers 
		}
		// prepare request
		data.request = this.prepareRequest(request);
		// get first json
		this.getBaseData(data, function (){
			// get 10 uniq users
			tRequest.getUniq( data );
			// make request for each user
			data.users.getSelfJsons();
			
			// send all for post to server
			tRequest.sendAllToServer(data);
		});
		
		// drop all
		data = "";
		delete data;
		
		this.destroy();
    },
    destroy: function () {
    	
    }
});

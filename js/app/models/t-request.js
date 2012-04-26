/* 
 * @fileOverview Общение с твиттером
 */

console.log('twitter here');

var TwitterUser = Backbone.Model.extend({
	defaults : {
		to_user : "",
		json : ""
	},
	getJson : function() {
  		var tUser = this;
  		var d = $.Deferred();
		
		$.getJSON("http://search.twitter.com/search.json?callback=?",
			{
				rpp : 100,
				q : "from:"+this.get("to_user")+" OR to:"+this.get("to_user")
			},
			function(data){
				tUser.set({"json": data});				
				d.resolve(); ;
			}
		);
	  	
	  	return d.promise();
	}
});
var TwitterUsers = Backbone.Collection.extend({
	model : TwitterUser,
	getSelfJsons : function () {
  		var d = $.Deferred(),
  			users = this,
  			counter = 0;
  			
		// add request result to user linked field
		_.each(this.models, function(model){
			model.getJson().done(function(){
				counter++;	
			});
			if (counter == users.length) {
				d.resolve();
			}
		});
		
	  	return d.promise();
	} 
});
var TRequest = Backbone.Model.extend({
    defaults: {
		request: {},
		baseData : {},
		users : new TwitterUsers 
	},
	initialize : function () {
		
    },
    prepareRequest : function (request) {
    	var prepared = {
    		callback : "?",
    		rpp: 100,
    		q: []
    	};
    	if (request.searchString != undefined && request.searchString != "") {
    		prepared.q.push(request.searchString)
    	}
    	prepared.q = prepared.q.join(" ");
    	
    	this.set({"request": prepared});
    },
    getUniq : function ( ) {
  		var d = $.Deferred();
    	var baseData = this.get("baseData");
    	var users = this.get("users");
    	var cRes = {};
    	
		for (var i = baseData.results.length - 1; i--; ) {
			cRes = baseData.results[i];
			if (cRes.to_user != undefined && cRes.to_user != "") {
				if (!_.find(users.models, function (user){
					return (user.to_user == cRes.to_user); 
				})) {
					users.add(cRes);
				}				
			}
			
			if (users.length > 2) {
				break;
			}
		}
		d.resolve();
		
	  	return d.promise();
    },
    getBaseData : function ( ) {
  		var tRequest = this;
  		var d = $.Deferred();
		
		$.getJSON("http://search.twitter.com/search.json?callback=?",
			tRequest.get("request"),
			function(data){
				tRequest.set({"baseData": data});				
				d.resolve(); ;
			}
		);
	  	
	  	return d.promise();
    },
    sendAllToServer : function ( ) {
    	console.log('all data', this.toJSON());
    	return true;
    },
    doPath : function ( params ) {
    	var tRequest = this;
		// create object for our server
		// prepare request
		this.prepareRequest(params);
		// get first json
		this.getBaseData()
			.done( function() {
				tRequest.getUniq ();
			})
			.done( function() {
				tRequest.get("users").getSelfJsons();
			})
			.done( function (){
				tRequest.sendAllToServer();
			})
			// .done( function() {
				// // drop all
				// data = "";
				// delete data;
				//
				// tRequest.destroy();
			// });
		
    },
    destroy: function () {
    	
    }
});

function myfunc(){
	console.log('aaaa');
} 
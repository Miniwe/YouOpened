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
    	console.log('new request', request)
    	
    	var prepared = {
    		callback : "?",
    		rpp: 100,
    		q: []
    	};
    	if (request.searchString != undefined && request.searchString != "") {
    		prepared.q.push('"'+request.searchString+'"')
    	}
    	if (request.userID != undefined && request.userID != "") {
    		var users = request.userID.split(',');
    		for (var i=users.length; i--;) {
    			users[i] = "from:"+users[i]+" OR to:"+users[i]
    		}
    		prepared.q.push(users.join(' OR '));
    	}
    	if (request.tagID != undefined && request.tagID != "") {
    		var tags = request.tagID.split(',');
    		prepared.q.push(tags.join(' OR '));
    	}
    	prepared.q = prepared.q.join(" ");
    	console.log('prepared request', prepared);
    	this.set({"request": prepared});
    	
    	return this;
    },
    prepareFilter: function (request) {
    	console.log('new filter', request)
    	
    	var prepared = {
    		callback : "?",
    		rpp: 100,
    		q: []
    	};
    	if (request.searchString != undefined && request.searchString != "") {
    		prepared.q.push('"'+request.searchString+'"')
    	}
    	if (request.userID != undefined && request.userID != "") {
    		var users = request.userID.split(',');
    		for (var i=users.length; i--;) {
    			users[i] = "from:"+users[i]+" OR to:"+users[i]
    		}
    		prepared.q.push(users.join(' OR '));
    	}
    	if (request.tagID != undefined && request.tagID != "") {
    		var tags = request.tagID.split(',');
    		prepared.q.push(tags.join(' OR '));
    	}
    	prepared.q = prepared.q.join(" ");
    	console.log('filter request', prepared);
    	
    	this.addFilterToRequest(prepared);
    	
    	return this;
    },
    addFilterToRequest: function ( filter ) {
    	var baseRequest = this.get("request");
    	
		baseRequest.q = "("+baseRequest.q+") AND ("+filter.q+")";
    	this.set({"request": baseRequest});
    	console.log('common request', this.get("request"));
    },
    getUniq : function ( ) {
  		var d = $.Deferred();
    	var baseData = this.get("baseData");
    	var users = this.get("users");
    	var cRes = {};

		for (var i = baseData.results.length; i--; ) {
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
    	console.log('data to send', this.toJSON());
    	$.ajax({
		  type: 'post',
		  url: "http://youopened.com/framework/TwitterClientStream.json",
		  data: JSON.stringify(this.toJSON()),
		  success: function() {
		  	console.log('all sended', arguments);
		  } ,
		  dataType: "html"
		});
    	return true;
    },
    doPath : function ( ) {
    	var tRequest = this;
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
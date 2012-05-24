/* 
* @fileOverview Общение с твиттером
*/

var TwitterUser = Backbone.Model.extend({
defaults : {
	to_user : "",
	json : ""
},
getJson : function() {
  var tUser = this;
  var d = $.Deferred();
  var data = {
    rpp : 100
  };
  var userName = this.get("to_user");
  if (userName !='') {
    data.q = "from:"+userName+" OR to:"+ userName;
  }
  
  $.getJSON("http://search.twitter.com/search.json?callback=?", data, function(data){
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
		  counter ++;	
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
  },
  initialize : function () {
    this.set({
      request: {},
      baseData : {},
      users : new TwitterUsers 
    });
  },
  prepareRequest : function (request) {
	var prepared = {
	  callback : "?",
	  lang : "en",
	  rpp: 100,
	  q: []
	};
	if (request.min_id != undefined && request.min_id != "") {
	  prepared.min_id = request.min_id; 
	}
	if (request.max_id != undefined && request.max_id != "") {
	  prepared.max_id = request.max_id; 
	}
	if (request.sinceId != undefined && request.sinceId != "") {
	  prepared.sinceId = request.sinceId; 
	}
	if (request.toUser != undefined && request.toUser != "") {
	  prepared.q.push('to:' + request.toUser + '')
	}
	if (request.searchString != undefined && request.searchString != "") {
	  prepared.q.push('"'+request.searchString+'"')
	}
	if (request.searchString != undefined && request.searchString != "") {
	  prepared.q.push('"'+request.searchString+'"')
	}
	if (request.userID != undefined && request.userID != "") {
	  var users = request.userID.split(',');
	  for (var i=users.length; i--;) {
        if (users[i] != '') {
          users[i] = "from:"+users[i]+" OR to:"+users[i]
        }
	  }
	  prepared.q.push(users.join(' OR '));
	}
	if (request.tagID != undefined && request.tagID != "") {
	  var tags = request.tagID.split(',');
	  prepared.q.push(tags.join(' OR '));
	}
	
	prepared.q = prepared.q.join(" ");
	this.set({"request": prepared});
	
	return this;
  },
  prepareFilter: function (request) {
  
	var prepared = {
	  callback : "?",
	  rpp: 100,
	  q: []
	};
//    console.log('request', request);
	if (request.searchString != undefined && request.searchString != "") {
	  prepared.q.push('"'+request.searchString+'"')
	}
	if (request.userID != undefined && request.userID != "") {
	  var users = request.userID.split(',');
	  for (var i=users.length; i--;) {
        if (users[i] != '') {
          users[i] = "from:"+users[i]+" OR to:"+users[i]
        }
	  }
	  prepared.q.push(users.join(' OR '));
	}
	if (request.tagID != undefined && request.tagID != "") {
	  var tags = request.tagID.split(',');
	  prepared.q.push(tags.join(' OR '));
	}
	prepared.q = prepared.q.join(" ");
//	console.log('filter request', prepared);
	
	this.addFilterToRequest(prepared);
	
	return this;
  },
  
  addFilterToRequest: function ( filter ) {
	var baseRequest = this.get("request");
	
	baseRequest.q = "("+baseRequest.q+") AND ("+filter.q+")";
	this.set({"request": baseRequest});
//	console.log('common request', this.get("request"));
	},
  
  getUniq : function ( baseData ) {
	var d = $.Deferred();
	var users = this.get("users");
	var cRes = {};
//	console.log('get');
	for (var i = baseData.results.length; i--; ) {
	cRes = baseData.results[i];
	
	if (cRes.to_user != undefined && cRes.to_user != "") {
	if (!_.find(this.get("users").models, function (user){
	return (user.get('to_user') == cRes.to_user); 
	})) {
	users.add(cRes);
	}				
	}
	
	if (this.get("users").length > 2) {
      break;
	}
	}
	d.resolve();
	
	return d.promise();
  },
  
  getBaseData : function ( ) {
	var tRequest = this;
	var d = $.Deferred();
    
    if (tRequest.get("request").q == "") {
      d.resolve();
	}
	else {
      $.getJSON("http://search.twitter.com/search.json?callback=?",
        tRequest.get("request"),
        function(data){
          tRequest.set({"baseData": data});				
          d.resolve();
        }
      );
	}		
	
	return d.promise();
  },
  
  sendAllToServer : function ( ) {
    if (SERVER_HTTP_HOST() != 'http://youopened.com') {
//      console.log('data to send: not host', JSON.stringify(this.toJSON()));
      
      return false;
    }
//    console.log('data to send', JSON.stringify(this.toJSON()));
    
	$.ajax({
      type: 'post',
      url: "http://youopened.com/framework/TwitterClientStream.json",
      data: JSON.stringify(this.toJSON()),
      success: function() {
//        console.log('all sended', arguments);
      } ,
      dataType: "html"
	});
	return true;
  },
  
  doPath : function ( ) {
    //return false;
	var tRequest = this;
	this.getBaseData ()
      .done( function () {
        if (!tRequest.hasBaseResults()) {
          return false;
        }
        tRequest.getUniq (tRequest.get('baseData'));
      })
      .done( function () {
        tRequest.get("users").getSelfJsons();
      })
      .done( function () {
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
  
  doUserPath : function ( ) {
    //return false;
	var tRequest = this;

    this.getBaseData()
      .done( function() {
        if (!tRequest.hasBaseResults()) {
          return false;
        }
      })
      .done( function (){
        //console.log('user data only');
        if (tRequest.hasBaseResults()) {
          tRequest.sendAllToServer();
        }
      })
	// .done( function() {
	// // drop all
	// data = "";
	// delete data;
	//
	// tRequest.destroy();
	// });
  },
  
  hasBaseResults : function () {
    return (this.get("baseData").results != undefined && this.get("baseData").results.length > 0);
  },
  
  destroy: function () {
  
  }
});
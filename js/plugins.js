
// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
/*
window.log = function(){
  log.history = log.history || [];   // store logs to an array for reference
  log.history.push(arguments);
  if(this.console) {
    arguments.callee = arguments.callee.caller;
    var newarr = [].slice.call(arguments);
    (typeof console.log === 'object' ? log.apply.call(console.log, console, newarr) : console.log.apply(console, newarr));
  }
};
*/
// make it safe to use console.log always
(function(b){function c(){}for(var d="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,timeStamp,profile,profileEnd,time,timeEnd,trace,warn".split(","),a;a=d.pop();){b[a]=b[a]||c}})((function(){try
{console.log();return window.console;}catch(err){return window.console={};}})());

// place any jQuery/helper plugins in here, instead of separate, slower script files.
function formatDate ( indate )
{
    var d = new Date();
    d.setTime(indate * 1000);
    
    return $.format.date(d, 'dd/MM/yyyy hh:mm:ss a');
}


function SERVER_HTTP_HOST(){  
    var url = window.location.href;  
    url = url.replace("http://", "");   
      
    var urlExplode = url.split("/");  
    var serverName = urlExplode[0];  
      
    serverName = 'http://'+serverName;  
    return serverName;  
}  

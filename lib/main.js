var {Cc, Ci} = require("chrome");
var tabs = require("sdk/tabs");
var file = require("sdk/io/file");
var timers = require("sdk/timers");

// full path is required
var urls = file.read("/home/nan/urls.txt").split("\n");
var textWriter = file.open("/home/nan/httptraffic.txt", "w");

var nsIFile = Ci.nsIFile;

function openUrl(targetUrl) {	
  tabs.open({
		url: targetUrl,
		onReady : function onReady(tab) {
      timers.setTimeout(
        function(){
          tab.close();
        }, 
        5000);
    }
	});	
}

var nsIHttpActivityObserver = Ci.nsIHttpActivityObserver;

var httpActivityObserver = {
  observeActivity: function(aHttpChannel, aActivityType, aActivitySubtype, aTimestamp, aExtraSizeData, aExtraStringData){
    if(aActivityType == nsIHttpActivityObserver.ACTIVITY_TYPE_HTTP_TRANSACTION){
      switch(aActivitySubtype){
        case nsIHttpActivityObserver.ACTIVITY_SUBTYPE_REQUEST_HEADER:
          textWriter.write("********************** request header ******************");
          textWriter.write(aExtraStringData);
          break;
        case nsIHttpActivityObserver.ACTIVITY_SUBTYEP_RESPONSE_HEADER:
          textWriter.write("********************** response header *****************");
          textWriter.write(aExtraStringData);
          break;
      } 
    }  
  } 
}
 
var activityDistributor = Cc["@mozilla.org/network/http-activity-distributor;1"].getService(Ci.nsIHttpActivityDistributor);
activityDistributor.addObserver(httpActivityObserver); 

urls.forEach(openUrl);
// why close the writer will flush all content of file?
//textWriter.close();

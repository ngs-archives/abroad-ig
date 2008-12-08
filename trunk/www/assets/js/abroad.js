//@charset "utf-8";
/* ========================================

  @author : Atsushi Nagase

  Copyright 2008 Atsushi Nagase All rights reserved.
  http://ngsdev.org/

======================================== */

var ASSETS_PATH = "http://abroad-ig.googlecode.com/svn/trunk/www/assets/";
var API_KEY = "b0b3029cd492f70f";
var MODULE_ID;
var TABNAMES,
    DIV_IDS = ["form","results","starred"],
    DES_KEYS = ["area","country","city"];
var prefs, tabs;
var REQUEST_PARAMS = {};
REQUEST_PARAMS[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;

function getRandomQuery() { return "rnd="+Math.ceil(Math.random()*10000000).toString(); }
function serializeQuery(obj) {
	var ret = "";
	$.each(obj,function(i){ ret+=i+"="+this+"&"; });
	return ret;
}

var ABROAD = {
	init : function(mid) {
		MODULE_ID = mid;
		prefs = new gadgets.Prefs(MODULE_ID);
		TABNAMES = [
			prefs.getMsg("search")||"search",
			prefs.getMsg("result")||"result",
			prefs.getMsg("starred")||"starred"
		];
		CALLBACKS = [showForm,showResult,showStarred];
		tabs = new gadgets.TabSet(MODULE_ID,TABNAMES[prefs.getInt("tab")||0]);
		$.each(TABNAMES,function(i){ tabs.addTab(this,DIV_IDS[i],CALLBACKS[i]); });
		function showForm() {
		}
		function showResult() {
			
		}
		function showStarred() {
			if(!(prefs.getArray("starred")||[]).length) {
				$("#starred").html("<p class=\"notice\">"+prefs.getMsg("nostarred")+"<\/p>");
				return;
			}
			
		}
		function getResults(query,callback) {
			query.format = "json"; query.key = API_KEY;
			var url = "http://webservice.recruit.co.jp/ab-road/tour/v1/alliance/?"+serializeQuery(query);
			gadgets.io.makeRequest(url, callback, REQUEST_PARAMS);
		}
	}
}

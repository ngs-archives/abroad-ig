//@charset "utf-8";
/* ========================================

  @author : Atsushi Nagase

  Copyright 2008 Atsushi Nagase All rights reserved.
  http://ngsdev.org/

======================================== */

var ASSETS_PATH = "http://abroad-ig.googlecode.com/svn/trunk/www/assets/";

var MODULE_ID;
var TABNAMES, DIV_IDS = ["form","results","starred"];
var prefs, tabs;

function getRandomQuery() { return "rnd="+Math.ceil(Math.random()*10000000).toString(); }

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
			
		}
	}
}

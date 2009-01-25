//@charset "utf-8";
/* ========================================

  @author : Atsushi Nagase

  Copyright 2008 Atsushi Nagase All rights reserved.
  http://ngsdev.org/

======================================== */

$.gadgets.ready(function(){
	var ASSETS_PATH = "http://abroad-ig.googlecode.com/svn/trunk/www/assets/";
	Recruit.UI.key = "b0b3029cd492f70f";
	var DIV_IDS = ["form","results","starred"],
		DES_KEYS = ["area","country","city"],
		CALLBACKS = [showForm,showResult,getStarred];
	var NOIMAGE_GIF = ASSETS_PATH+"img/noimage.gif";
	var MAX_TITLE_LENGTH = 30;
	var MAX_POINT_LENGTH = 50;
	var PrefKey = {
		DESTINATION : "destination",
		STARRED      : "starred"
	};
	var forminit = false, tabindex, content;
	var resultsinit = false, starredinit = false;
	var selectedArea = {};
	function getRandomQuery() { return "rnd="+Math.ceil(Math.random()*10000000).toString(); }
	function init() {
		$("#tabs-ul li span.link").each(function(i){
			$(this).bind("click",CALLBACKS[i]);
		});
		$($("#tabs-ul li span.link")[$.opensocial.person("viewer").isOwner()?0:1]).trigger("click");
		new ABROAD.UI.Places.Pulldown({
			area : {
				first_opt_text  : "エリアを選択",
				with_tour_count : true,
				val             : selectedArea.area || ""
			},
			country : {
				first_opt_text  : "国を選択",
				with_tour_count : true,
				val             : selectedArea.country || ""
			},
			city    : {
				first_opt_text  : "都市を選択",
				with_tour_count : true,
				val             : selectedArea.city || ""
			}
		});
		$("#search-form").bind("submit", function(){
			resultsinit = false;
			return false;
		});
	}
	function setContent(idx) {
		if(tabindex==idx) return false;
		tabindex = idx;
		content = $("#"+DIV_IDS[idx]);
		$.each(DIV_IDS,function(i){
			if(i==idx) $("#main").addClass(this);
			else $("#main").removeClass(this);
		})
		return true;
	}
	function showForm() {
		setContent(0);
	}
	function showResult() {
		if(setContent(1)) {
			$("fieldset#dest select").each(function(){
				selectedArea[$(this).attr("name")] = $(this).val();
				$.opensocial.data.set(PrefKey.DESTINATION,selectedArea,function(){
					if(!resultsinit) getResults();
				});
			})
		}
	}
	function showStarred() {
		if(setContent(2)&&!starredinit) getResults();
	}
	function getResults() {
		var driver =  new Recruit.UI.Driver.JSONP({
			url   : "/ab-road/tour/v1/alliance",
			disable_cache : true,
			prm : { type : "lite" }
		});
		var prm = {}, err, ele = $("#"+DIV_IDS[tabindex]);
		switch(tabindex) {
			case 1:
				$("#search-form").serializeArray().each(function(i){
					prm[i.name] = prm[i.name]||[];
					prm[i.name].push(i.value);
				});
				$.each(prm,function(i){ prm[i] = this.join(); })
				prm.count = 20;
				resultsinit = true;
				break;
			case 2:
				var ar = getStarred();
				if(!ar.length) return showNotice("該当するツアーが見つかりませんでした。");
				prm.id = ar.join();
				prm.count = 100;
				starrediniit = true;
				break;
			default:
				return;
		}
		content.html("<div class=\"loading\"><p>読み込み中<\/p><\/div>");
		driver.get(appendResults,prm);
	}
	function appendResults(s,d,h) {
		var res = d&&d.results?d.results:{};
		var err = res.error&&res.error[0]&&res.error[0].message?res.error[0].message:"フィードが取得できません。";
		if(!s) return showNotice(err);
		var tours = res.tour;
		if(!tours||!tours.length) return showNotice("該当するツアーが見つかりませんでした。");
		var ht = [
			"<div class=\"header\">",
			"<p id=\"hitnum\">",
			"<em class=\"int\">",res.results_available,"<\/em>",
			"<span class=\"unit\">件ありました<\/span>",
			"<\/p>",
			"<\/div>",
			"<div class=\"body\"><form class=\"checkbox-wrapper\">",
			"<ul class=\"tours\">"
		];
	var id_prefix = tabindex == 1 ? "res":"star";
	$.each(tours,function(i){
		var img = (this.img[0]||{}).s || NOIMAGE_GIF;
		var alt = (this.img[0]||{}).caption || "&nbsp;";
	var ttl = this.title || "";
	if(ttl.length>MAX_TITLE_LENGTH) ttl = ttl.substr(0,MAX_TITLE_LENGTH)+"...";
	var pt = (this.tour_point||"").replace(/<BR>|\n|\s|\t/ig," ");
	if(pt.length>MAX_POINT_LENGTH) pt = pt.substr(0,MAX_POINT_LENGTH)+"..."; 
	var atag_s = "<a href=\""+ this.urls.pc +"\" title="+ ttl +" target=\"_blank\">";
	var atag_e = "<\/a>";
	var id = this.id;
	var starred = isStarred(id);
	var starred_msg = starred?"スターを外す":"スターをつける";
	ht.push([
		"<li class=\"tour ",id," ",i%2?"odd":"even",starred?" starred":"","\" id=\"",id_prefix,"-",id,"\">",
	"<div class=\"text\">",
	"<h3>",atag_s,ttl,atag_e,"<\/h3>",
	"<blockquote class=\"point\"><p>",pt,"<\/p><\/blockquote>",
	"<p class=\"star\">",
	"<span class=\"link\" onclick=\"ABROAD_IG.toggleStar('",id,"')\" title=\"",starred_msg ,"\">", starred_msg, "<\/span>",
	"<\/p>",
	"<\/div>",
	"<p class=\"pict\">",atag_s,"<img src=\"",img,"\" alt=\"",alt,"\" \/>",atag_e,"<\/p>",
	"<\/li>"
	].join(""));
	});
	ht.push("<\/ul><\/form><\/div>");
	content.html(ht.join(""));
	}
	function showNotice(msg) {
		content.html("<p class=\"notice\">"+(msg||"不明なエラーです")+"<\/p>");
	}
	//
	// star
	//
	function addStar(id) {
		var ar = getStarred();
		if(!isStarred(id)) ar.push(id);
		$("ul.tours li."+id).addClass("starred");
	var msg = prefs.getMsg("remove_star");
	$("ul.tours li."+id+" p.star span").html(msg).attr("title",msg);
		handleStarChange(ar,id);
	}
	function removeStar(id) {
		var ar = getStarred();
		ar = $.grep(ar,function(n,i){ return n != id; })
		$("#star-"+id).remove();
	$("ul.tours li."+id).removeClass("starred");
	var msg = "スターをはずす"
	$("ul.tours li."+id+" p.star span").html(msg).attr("title",msg);
		handleStarChange(ar,id);
	}
	function handleStarChange(ar,id) {
		prefs.set("starred",getStarred(ar).join());
	if(tabindex==2) {
		if(!ar.length) showNotice("スター付きのツアーはありません。");
	else {
		$("#"+DIV_IDS[2]+" ul.tours li").each(function(i){
	$(this).removeClass(!i%2?"odd":"even");
	$(this).addClass(i%2?"odd":"even");
				});
			}
		} else starredinit = false;
	}
	function getStarred(ar) {
		ar = ar || (prefs.getString("starred") || "").split(",");
	ar = $.grep(ar,function(n,i){ return typeof(n)=="string"&&n.length==8; })
		while(ar.length>20) ar.pop();
		return ar;
	}
	function isStarred(id)  { return $.inArray(id,getStarred())!=-1; }
	function toggleStar(id) { return (isStarred(id)?removeStar:addStar)(id); }
	this.toggleStar = toggleStar;
	$.opensocial.data.get(PrefKey.DESTINATION,"owner",function(d){
		d = d || {};
		selectedArea = d;
		$.opensocial.person("viewer",function(p){
			init();
		});
	});
});

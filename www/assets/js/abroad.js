;//@charset "utf-8";
/* ========================================

  @author : Atsushi Nagase

  Copyright 2008 Atsushi Nagase All rights reserved.
  http://ngsdev.org/

======================================== */

;$.gadgets.ready(function(){
	var ASSETS_PATH = "http://abroad-ig.googlecode.com/svn/trunk/www/assets/";
	Recruit.UI.key = "b0b3029cd492f70f";
  //Recruit.UI.key = "2e9f07a047728523";
	var DIV_IDS = ["form","results","starred"],
		DES_KEYS = ["area","country","city"],
		CALLBACKS = [showForm,showResult,showStarred];
	var NOIMAGE_GIF = ASSETS_PATH+"img/noimage.gif";
	var CANVAS = $.gadgets.view().getName()=="canvas";
	var MAX_TITLE_LENGTH = CANVAS?60:30;
	var MAX_POINT_LENGTH = CANVAS?100:50;
	var COUNT_PAR_PAGE = 10;
	var PrefKey = {
		SEARCH_CONDITION : "searchcondition",
		STARRED          : "starred"
	};
	var forminit = false, tabindex, content;
	var resultsinit = false, starredinit = false;
	var focusindex = [0,0];
	var condition = {};
	function getRandomQuery() { return "rnd="+Math.ceil(Math.random()*10000000).toString(); }
	function init() {
		condition = $.opensocial.data.get(PrefKey.SEARCH_CONDITION,"owner",null,true)||{};
		$("#tabs-ul li span.link").each(function(i){
			$(this).bind("click",CALLBACKS[i]);
		});
		new ABROAD.UI.Price.Pulldown();
		new ABROAD.UI.Term.Pulldown();
		new ABROAD.UI.Month.Pulldown(); 
		new ABROAD.UI.Places.Pulldown({
			area : {
				first_opt_text  : "エリアを選択",
				with_tour_count : true,
				val             : condition.area || ""
			},
			country : {
				first_opt_text  : "国を選択",
				with_tour_count : true,
				val             : condition.country || ""
			},
			city    : {
				first_opt_text  : "都市を選択",
				with_tour_count : true,
				val             : condition.city || ""
			}
		});
		condition.dept = condition.dept || [];
		$.each(condition.dept,function(){
			$("p.deptcity input:checkbox[@value='"+this+"']").attr("checked","checked");
		});
		condition.keyword = condition.keyword || "";
		if($.opensocial.container.mixi) condition.keyword = utf.URLdecode(condition.keyword);
		$("input[@name='keyword']").val(condition.keyword);
		$.each(["ym","term_min","term_max","price_min","price_max"],function(){
			if(condition[this]) $("*[@name='"+this+"']").val(condition[this]);
		});
		$("#search-form").bind("submit", function(){
			resultsinit = false;
			showResult();
			return false;
		});
		$(window).bind("keydown",onKeyDown)
		if($.opensocial.person("viewer").isOwner()) showForm();
		else showResult();
		setTimeout(function(){
			$.gadgets.height("auto");
		},99);
	}

	function onKeyDown(e) {
		var key = String.fromCharCode(e.keyCode);
		var li = $("ul.tours li",content);
		if(!li.size()) return;
		var idx = focusindex[tabindex-1];
		switch(key) {
			case "J": idx++; break;
			case "K": idx--; break;
			default: return;
		}
		if(!li[idx]) return;
		li = $(li[idx]);
		window.scrollTo(0,li.offset().top);
		focusindex[tabindex-1] = idx;
	}

	function setContent(idx) {
		if(tabindex==idx) return false;
		tabindex = idx;
		content = $("#"+DIV_IDS[idx]);
		$.each(DIV_IDS,function(i){
			if(i==idx) $("#main").addClass(this);
			else $("#main").removeClass(this);
		});
		return true;
	}
	function showForm() {
		setContent(0);
		$.gadgets.height("auto");
	}
	function showResult() {
		if(setContent(1)) {
			if(resultsinit) return $.gadgets.height("auto");
			showLoading();
			$("fieldset#dest select").each(function(){
				condition[$(this).attr("name")] = $(this).val();
			});
			condition.dept = [];
			$("p.deptcity input:checkbox").each(function(){
				if($(this).attr("checked")) condition.dept.push($(this).attr("value"))
			});
			condition.keyword = $("input[@name='keyword']").val();
			if($.opensocial.container.mixi) condition.keyword = encodeURIComponent(condition.keyword).toLowerCase();
			$.each(["ym","term_min","term_max","price_min","price_max"],function(){
				condition[this] =$("*[@name='"+this+"']").val()||"";
			});
			$.opensocial.data.set(PrefKey.SEARCH_CONDITION,condition,getResults);
		}
	}
	function showStarred() {
		if(setContent(2)&&!starredinit) getResults();
		$.gadgets.height("auto");
	}
	function getResults(start) {
		if(isNaN(start)) start = 1;
		var driver =  new Recruit.UI.Driver.JSONP({
			url   : "/ab-road/tour/v1/alliance",
			disable_cache : true,
			prm : { type : "lite" }
		});
		var prm = {}, err, ele = $("#"+DIV_IDS[tabindex]);
		prm.count = COUNT_PAR_PAGE;
		prm.start = start;
		switch(tabindex) {
			case 1:
				$("#search-form").serializeArray().each(function(i){
					prm[i.name] = prm[i.name]||[];
					prm[i.name].push(i.value);
				});
				$.each(prm,function(i){ prm[i] = this.length&&this.length>1?this.join():this.toString(); })
				resultsinit = true;
				break;
			case 2:
				var ar = getStarred();
				if(!ar.length) return showNotice("該当するツアーが見つかりませんでした。");
				prm.id = ar.join();
				starrediniit = true;
				break;
			default:
				return;
		}
		showLoading();
		driver.get(appendResults,prm);
	}
	function showLoading() {
		content.html("<div class=\"loading\"><p>読み込み中<\/p><\/div>"); 
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
			var dname = this.dept_city.name || "";
			var cname = this.city_summary || "";
			var term = this.term?this.term+"日間 ":"";
			var price = Math.floor(this.price.min/100)/100;
			if(this.price.min<this.price.max) price += "～"+Math.floor(this.price.max/100)/100;
			price += "万円"
			if(ttl.length>MAX_TITLE_LENGTH) ttl = ttl.substr(0,MAX_TITLE_LENGTH)+"...";
			var pt = (this.tour_point||"").replace(/<BR>|\n|\s|\t/ig," ");
			if(pt.length>MAX_POINT_LENGTH) pt = pt.substr(0,MAX_POINT_LENGTH)+"..."; 
			var atag_s = "<a href=\""+ this.urls.pc +"\" title="+ ttl +" target=\"_blank\">";
			var atag_e = "<\/a>";
			var id = this.id;
			var starred = isStarred(id);
			var starred_msg = starred?"スターをはずす":"スターをつける";
			ht.push([
				"<li class=\"tour ",id," ",i%2?"odd":"even",starred?" starred":"","\" id=\"",id_prefix,"-",id,"\">",
					"<div class=\"text\">",
						"<h3>",atag_s,ttl,atag_e,"<\/h3>",
						"<p class=\"spec caption\">",cname,"<br \/>",dname,"発 ",term,price,"<\/p>",
						"<blockquote class=\"point\"><p>",pt,"<\/p><\/blockquote>",
						"<p class=\"star\">",
							"<span class=\"link\" onclick=\"ABROAD_IG.toggleStar('",id,"','",ttl,"')\" title=\"",starred_msg ,"\">", starred_msg, "<\/span>",
						"<\/p>",
					"<\/div>",
					"<p class=\"pict\">",atag_s,"<img src=\"",img,"\" alt=\"",alt,"\" \/>",atag_e,"<\/p>",
				"<\/li>"
			].join(""));
		});
		ht.push("<\/ul><\/form>");
		var pgn = paginate(res.results_start,res.results_available);
		if(pgn) ht.push(pgn);
		ht.push("<\/div>");
		content.html(ht.join(""));
		focusindex[tabindex-1] = 0;
		window.scrollTo(0,0);
		$.gadgets.height("auto");
	}
	function paginate(start,total) {
		var pv = start==1?null:start-COUNT_PAR_PAGE, nx = start+COUNT_PAR_PAGE;
		if(pv!=null&&pv<1) pv = 1;
		if(nx>total) nx = false;
		if(!nx&&!pv) return;
		var pvp = COUNT_PAR_PAGE;
		if(start<pvp) pvp = start-1;
		var nxp = COUNT_PAR_PAGE;
		if(nx+nxp>total) nxp = total-nxp*2;
		var ht = ["<div class=\"paginate\"><ul>"];
		if(pv) ht.push("<li class=\"prev\"><span class=\"link\" onclick=\"ABROAD_IG.getResults("+pv+");\">前の"+pvp+"件<\/span><\/li>");
		if(nx) ht.push("<li class=\"next\"><span class=\"link\" onclick=\"ABROAD_IG.getResults("+nx+");\">次の"+nxp+"件<\/span><\/li>"); 
		ht.push("<\/ul><\/div>");
		return ht.join("");
	}
	
	function showNotice(msg) {
		content.html("<p class=\"notice\">"+(msg||"不明なエラーです")+"<\/p>");
	}

	function addStar(id,title) {
		var ar = getStarred();
		if(!isStarred(id)) ar.push(id);
		$("ul.tours li."+id).addClass("starred");
		var msg = "スターをはずす";
		$("ul.tours li."+id+" p.star span").html(msg).attr("title",msg);
		handleStarChange(ar,id,function(){
			$.opensocial.activity.send("「"+title+"」にスターをつけました"); 
		});
	}

	function removeStar(id,title) {
		var ar = getStarred();
		ar = $.grep(ar,function(n,i){ return n != id; })
		$("#star-"+id).remove();
		$("ul.tours li."+id).removeClass("starred");
		var msg = "スターをつける";
		$("ul.tours li."+id+" p.star span").html(msg).attr("title",msg);
		handleStarChange(ar,id);
	}
	function handleStarChange(ar,id,callback) {
		$.opensocial.data.set(PrefKey.STARRED,ar,function(){
			if(tabindex==2) {
				if(!ar.length) showNotice("スター付きのツアーはありません。");
				else {
					$("#"+DIV_IDS[2]+" ul.tours li").each(function(i){
						$(this).removeClass(!i%2?"odd":"even");
						$(this).addClass(i%2?"odd":"even");
					});
				}
			} else starredinit = false;
			if(callback) callback();
		}); 
	}
	function getStarred(ar) {
		ar = $.opensocial.data.get(PrefKey.STARRED,"owner",null,true)||[];
		ar = $.grep(ar,function(n,i){ return typeof(n)=="string"&&n.length==8; })
		while(ar.length>20) ar.pop();
		return ar;
	}
	function isStarred(id)  { return $.inArray(id,getStarred())!=-1; }
	function toggleStar(id,title) { return (isStarred(id)?removeStar:addStar)(id,title); }
  window.ABROAD_IG = { toggleStar:toggleStar, getResults:getResults };
	$.opensocial.data.get("*","owner",function(d){
		$.opensocial.person("viewer",function(p){
			init();
		});
	});
});

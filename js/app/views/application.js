/* 
 * @fileOverview Основной вид приложения
 */

var ApplicationView = Backbone.View.extend({
	innerRS_prevDraw : "",
	events : {
		"scroll" : "alignActiveFrame"
	},
	initialize : function () {
		var appView = this;
		$("#mainBottom").css({"height": window.height+"px"})
		$(window).scroll(_.throttle(function () {appView.alignActiveFrame()}, 1));
	},
	alignActiveFrame : function ( ) {
		var scrollTop = $(window).scrollTop(),
			topNavHeight = $(".navbar").outerHeight(),
			subNavHeight = $(".subnav").outerHeight(),
			topOffset = topNavHeight + subNavHeight,
			activeFrame = $(".frame.expanded");
		
		var offsetTop = topOffset + 20;
		
		if (scrollTop > 0) {
			$("#sidebar").find("#innerRS").css({"width":"inherit","position":"fixed", "top": offsetTop + "px"});
		}
		else {
			$("#sidebar").find("#innerRS").css({"width":"","position":"", "top": "0px"});
		}
		if ($(".subnav").hasClass("subnav-fixed")) {
			$('#maincontent').css({"padding-top": (subNavHeight + 20) + "px"})
		}
		else {
			$('#maincontent').css({"padding-top":""})
		}
		
		if (activeFrame.length > 0) {
			(function (activeFrame) {
				var rootPost = activeFrame.find(".postdiv").first(),
					rootPostTop = topOffset,
					activeFrameTop = activeFrame.offset().top,
					activeFrameBottom = activeFrameTop + activeFrame.outerHeight(true) - scrollTop,
					rootPostHeight = rootPost.outerHeight(true);
				// если верх рутового поста меньше или равно нижней границе (navbar + subnav)=topOffset
				// учитывая скроллинг scrollTop
				if ( activeFrameTop - scrollTop < topOffset ) {
				// для активного фрейма рутового поста назначем клаасс float
				// 						top = нижней границе navbar + subnav
					rootPost.addClass("float");
				// padding top активного фрема = высота рутового поста
					activeFrame.css({"padding-top": rootPostHeight + "px"});
					
				// 		если нижняя граница фрагмента < высота рутового поста + его оффсет
					if ( activeFrameBottom  < rootPostHeight + topOffset) {
				// 		top рутового поста уменьшается на разницу между ними
						rootPostTop -= ( rootPostHeight + topOffset - activeFrameBottom);
					}
				// применяем top в стили
					rootPost.css({"top": rootPostTop + "px"});
				}
				// иначе
				else {
				// для активного фрейма рутового поста убираем клаасс float
					rootPost.removeClass("float");
					rootPost.css({"top": "0"});
				// padding top активного фрема = 0
					activeFrame.css({"padding-top": ""});
				}
				
			}( activeFrame ));
		}
		else {
			$(".frame").css({"padding-top":""});
		}
		
		/*
		$("#tab-content").css({
			"padding-top": $(".page-header").outerHeight(true)
		});
		var tabPaddingTop = $(".page-header").outerHeight(true);

		if (activeFrame instanceof Frame) {
			(function (activeFrame) {
				var topOffset = $(".topbar").outerHeight(true) + tabPaddingTop,
					activeViewEl = $(activeFrame.get("view").el),	
					ave_top = activeViewEl.offset().top,
					activeFrameRootPost = activeViewEl.find(".postdiv").first( ),
					outerHeightRP = activeFrameRootPost.outerHeight( true ) ;

				if ( ave_top - scrollTop < topOffset ) {
					activeFrameRootPost.addClass("float");
					// вместо него сдвигать padding top фрагмента на разницу между его высотой, верхней границей и скроллингом
					var paddingTop = outerHeightRP;
					activeViewEl.css({
						"padding-top": paddingTop +"px"
					})

					// если нижняя граница рутового поста становиться меньше низа фрагмента со двигом
					// вычислить низ фрагмента
					var fragmentHeight = activeViewEl.outerHeight(true);
					var fragmentBottom = fragmentHeight + ave_top - topOffset - 20;
					// высислить низ рутового поста
					var rootBottom = outerHeightRP;
					// вычислить cдвиг плавающего рутового поста
					var delta = fragmentBottom - scrollTop - rootBottom ;

					// сдвигать плвающий блок вверх
					if ( delta < 0) {
						activeFrameRootPost.css({
							"top": (topOffset + delta) +"px"
						})
					}
					else {
						activeFrameRootPost.css({
							"top": topOffset + "px"
						})
					}

				}
				// иначе сделать нормальным
				else {
					activeViewEl.css({
						"padding-top": "0px"
					})
					activeFrameRootPost.removeClass("float");
				}
			
			}( activeFrame ));
		}
		else {
			$(".frame").css({"padding-top":"0"});
		}
		
		*/
		/*
		var innerRS = $("#innerRS");
		innerRS.top = $("#tab-content").offset().top;
		innerRS.draw = "tab";
		if (innerRS.top < $(".topbar").outerHeight() + 20) {
			innerRS.top = $(".topbar").outerHeight() + 20;
		}

		if (activeFrame && activeFrame instanceof Frame ) {
			var activeViewEl = $(activeFrame.get("view").el);
//			innerRS.top = activeViewEl.find(".postdiv.float:first").offset().top - scrollTop + 20;
			if (innerRS.top < activeViewEl.offset().top - scrollTop) {
//				console.log(innerRS.top,  activeViewEl.offset().top - scrollTop)
				innerRS.removeClass("fragment");
				innerRS.draw = "tab";
			}
			else {
				innerRS.addClass("fragment");
				innerRS.draw = "fragment";
			}
			
			if (activeViewEl.offset().top + activeViewEl.outerHeight() - scrollTop < $(".topbar").outerHeight()) {
				innerRS.removeClass("fragment");
				innerRS.draw = "tab";
			}
			
			if (innerRS.draw != this.innerRS_prevDraw) {
				$("#sidebar").fadeOut("medium", function (){
					if (innerRS.draw == "fragment") {
						activeFrame.get("view").refreshSidebar();
					}
					else {
						activeTab.get("view").refreshSidebar();
					}
//					console.log('innerRS', innerRS.css("top"));
					innerRS.css({"top": $("#tab-content").offset().top});
//					innerRS.top = 0;
					$("#sidebar").fadeIn("medium");
				});
				this.innerRS_prevDraw = innerRS.draw;
			}
		}
		
//		innerRS.css({"top": innerRS.top});
		*/
		
	},
	cacheTemplates : function () {
		var templatesList = this.model.get("templatesList");
		for ( var i = AppConfig.TEMPLATES.length; i--; ) {
			templatesList.add( new Template( {
				fileName: AppConfig.TEMPLATES[i]
			} ) );
		}
	}
});
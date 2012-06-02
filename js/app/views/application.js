/* 
 * @fileOverview Основной вид приложения
 */

var ApplicationView = Backbone.View.extend({
	prevDraw : "",
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
	// определить чего рисовать
		var activeTabModel = this.model.getActiveTab();
		var activeFrameModel = this.model.getActive();
		var draw = 'tab';
		
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
					rootPostTop = 0;
	// для активного фрейма рутового поста убираем клаасс float
					rootPost.removeClass("float");
					rootPost.css({"top": ""});
	// padding top активного фрема = 0
					activeFrame.css({"padding-top": ""});
				}

				if ((activeFrameTop - scrollTop <= topOffset) && (activeFrameBottom >= topOffset) ) {
					draw = 'fragment';
				}
				
			}( activeFrame ));
			
			
		}
		else {
			$(".frame").css({"padding-top":""});
		}
		
	// определить - надо ли менять отрисованное
		if (draw != this.prevDraw) {
	// если надо менять отрисованное
	// если удовлетворяет условиям рисования фрагмента то рисуем фрагмент
			if (draw == 'fragment') {
				activeFrameModel.get("view").refreshControl();
			}
	// иначе если tab то рисуем таб
			else if (draw == 'tab') {
				activeTabModel.get("view").refreshControl();
			}
	// сохраняем предыдщее значение перерисовывания
			this.prevDraw = draw;
		}
		
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
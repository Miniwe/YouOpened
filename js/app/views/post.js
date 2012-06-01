/* 
 * @fileOverview Вид поста
 */

var PostView = Backbone.View.extend({
	tagName : 'div',
	className : 'postdiv row-fluid',
	template: new Template({fileName: 'posts/post'}),
	templatePostForm: new Template({fileName: 'posts/postform'}),
	/*events: {
		"click .parent .icon" : "openParent",
		"click .childs" : "openChilds",
		"click .text" : "openChilds"
	},*/
	initialize : function () {
	},
	render : function () {
		this.remove();
		$(this.el)
			.html(this.template.getTemplate() (this.model.toJSON()))
			.addClass(this.className)
			.attr("data-id", this.model.get("id"))
			.attr("data-timestamp", this.model.get("createTimestamp"))
			;
		this.updateView();
		this.renderForm();
		
		return this;
	},
	needRenderForm : function () {
//		return true;
		return this.model.get("renderForm") 
			&& this.model.collection.rootPost() == this.model 
			&& this.model.isActiveFrame();
	},
	renderForm : function () {
		
		if (!this.needRenderForm()) return false;
		
		var params = {
			siteUser: this.model.get("siteUser").toJSON(),
			user: this.model.get("user")
		};
		var postForm = this.templatePostForm.getTemplate() (params);
		postForm = $(postForm).appendTo($(this.el));
		this.postFormEvents(postForm);
		return this;
	},
	postFormEvents:  function ( postForm ) {
		var parentPost = this.model;
		var postID = parentPost.get("id");
		$(postForm).find("#postMessage")
				.autoResize();

		$(postForm).submit(function(){
			var postParams = {
				postID: postID,
				text: $(this).find("#postMessage").val()
			}
			parentPost.sendReply(postParams);
			$(this).resetForm();
			return false;
		})
	},
	isRendered:  function () {
		return $(this.el).length;
	},
	scrollToView:  function () {
		var rootPostOffset = 0,
			model = this.model,
			rootPost = model.collection.rootPost(),
			destScroll = 0;
			
		if (model.get('id') != rootPost.get('id')) {
			rootPostOffset = $(rootPost.get("view").el).outerHeight(true)
		}

		destScroll = $(this.el).offset().top 
//					- rootPostOffset
					- $(".navbar").outerHeight(true)
					- $(".subnav").outerHeight(true)
					;
					
		destScroll = Math.ceil(destScroll);
		destScroll = Math.max(destScroll, 0);
		
		$("body#application").animate({
			"scrollTop": destScroll
		});
		return true;
	},
	updateView: function( ) {
		var view = this,
			model = this.model,
			el = $(this.el);
			
		if (el.find(".childs_count, .text").length < 1) {
//			console.log('el Not found');
		}
		
		el.find(".childs_count, .text").unbind().click(function() {
			view.openChilds();
			// view.scrollToView( );
			
		});
		el.find(".childs_count_cont").toggleClass("nocontent", (model.get("childsCount") < 1));
		
		if ( model.get("pid") == null ) {
			el.find(".parent-icon").css({"visibility": "hidden"});
		}
		else {
			el.find(".parent-icon").unbind().click(function() {
				view.openParent();
			});
		}
	},	
	update: function () {
		var view = this,
			model = this.model,
			el = $(this.el);		
		el.find(".childs_count").html(model.get("childsCount"));
			
	},
	openChilds: function () {
		this.model.openChilds();
	},
	openParent: function () {
		this.model.openParent();
	}
});

/* 
 * @fileOverview Вид поста
 */

var PostView = Backbone.View.extend({
	tagName : 'div',
	className : 'postdiv row',
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
			.attr("data-timestamp", this.model.get("createTimestamp"));
		this.updateView();

		if (this.needRenderForm()) {
			this.renderForm();
		}
		return this;
	},
	needRenderForm : function () {
//		return true;
		return this.model.get("renderForm") 
			&& this.model.collection.rootPost() == this.model 
			&& this.model.isActiveFrame();
	},
	renderForm : function () {
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
			rootPost = model.collection.rootPost();
			
		if (model.get('id') != rootPost.get('id')) {
			rootPostOffset = $(rootPost.get("view").el).outerHeight(true)
		}
		$("body#application").animate({
			"scrollTop": $(this.el).offset().top 
					- rootPostOffset
					- $(".topbar").outerHeight(true)
					- $(".page-header").outerHeight(true)
		});
		return true;
	},
	updateView: function( ) {
		var view = this,
			model = this.model,
			el = $(this.el);
			
		el.find(".parent .icon").click(function() {
			view.openParent();
		});
		if (el.find(".childs, .text").length < 1) {
			console.log('el Not found');
		}
		el.find(".childs, .text").unbind().click(function() {
			view.openChilds();
			view.scrollToView( );
			
		});
		el.find(".childs").toggleClass("nocontent", (model.get("childsCount") < 1));
		
		if ( model.get("pid") == null ) {
			el.find(".parent").html("");
		} 
	},	
	update: function () {
		var view = this,
			model = this.model,
			el = $(this.el);		
		el.find(".childs span").html(model.get("childsCount"));
			
	},
	openChilds: function () {
		this.model.openChilds();
	},
	openParent: function () {
		this.model.openParent();
	}
});

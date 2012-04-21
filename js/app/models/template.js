/* 
 * @fileOverview Загружает модель шаблонов
 * Возвращает если загружен
 * Если не найден или не загружен то возвращает шаблон с сообщением что шаблон не найден
 */

var Template = Backbone.Model.extend({
    defaults: {
        fileName: "",
        templateName: "",
        cached: false
    },
    initialize : function () {
        var self = this,
			fileName = this.get("fileName");
		
        this.set({
            "templateName": "tpls-" + fileName.replace('/', '_')
        });
		
		if (this.loaded()) {
			this.set({ "cached": true });
		}
		else {
	        this.loadTemplate(fileName);
		}
    },
    loaded: function () {
		return ($("#"+ this.get("templateName")).length > 0);
	},
    loadTemplate: function ( fileName ) {
		var template = this,
			dfd = $.Deferred(),
			fileName = 'tpls/'+ fileName +".html";
		
		this.set({ "cached": false });
		
        $.ajax(fileName, {
            url : fileName,
            context: {
                templateName : this.get("templateName")
            },
            success : function ( templateBody, status, object ) {

                $("<script id='"
                    + this.templateName 
                    + "' type=\"text/template\">"
                    + templateBody + "</script>"
                    ).insertAfter('script:last');

				template.set({ "cached": true });
				
				dfd.resolve({});
            },
            data : {
                templateName: this.templateName,
                t: (new Date()).getTime()
            } 
        });
		
        return dfd.promise();

    },
    getTemplateName: function () {
        if ( this.get("cached") ) {
            return this.get("templateName");
        }
		return "tpls-app_notfound";

    },
    getTemplate: function () {
		return _.template($("#"+this.getTemplateName() ).html());
    }
});



/* 
 * @fileOverview Переопределение запросов к серверу
 */
// глобавльно  пока не нужно - закоментрировано
/*
Backbone.sync = function (method, model, options) {
	var xhr = $.ajax({
		url: model.url,
		success: options.success,
		error: options.error,
		dataType: 'jsonp',
		jsonp: 'jsonp_callback',
		data: _.extend(options.data, (model instanceof Backbone.Model) ? model.toJSON() : {}),
		timeout: 30000
	});
	
	model.loading = {
		method: method,
		xhr: xhr
	};
};

*/
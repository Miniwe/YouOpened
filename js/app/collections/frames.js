/*
 *	@fileOverview Коллекция моделей фреймов  
 */

var Frames = Backbone.Collection.extend({
	model: Frame,
	closeFrames : function ( except ) { 
		// @todo сомнителное место вызова и функция - проверить/перенести
		this.models.map( function ( frame ) {
			if ( frame.cid != except ) {
				frame.set({"state": FrameState.COLLAPSED});
				frame.get("view").closeFrame();
			}
		} );

	},
	getExpanded : function () {
		var res = this.find('state', FrameState.EXPANDED);
		return res ? res : false;
	},
	getFrameByPost: function( postId ) {
		var frame = false;
		_.each(this.models, function(model){
			if (model.get("posts").rootPost().get("id") == postId) {
				frame = model;
			}
		}, this);
		return frame;
	},
	setState : function (modelCid, state) {
		var model = this.getByCid(modelCid);
		if (model instanceof Frame) {
			if (state == FrameState.EXPANDED) {
				this.setToAll({"state": FrameState.COLLAPSED});
			}
			model.set({"state": state});
		} else {
			log('Error', 'set state to incorrect model (Frame)')
		}
	}
});

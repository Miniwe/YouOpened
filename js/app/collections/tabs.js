/*
 *	@fileOverview Коллекция моделей табов 
 */

var Tabs = Backbone.Collection.extend({
	model: Tab,
	getActive : function () {
		var res = this.find("state", TabState.ACTIVE);
		return res ? res : false;
	},
	setState : function (modelCid, state) {
		var model = this.getByCid(modelCid);
		var except = model;

		if (model instanceof Tab) {
			if (state == TabState.ACTIVE) {
				this.setToAll({"state": TabState.DEFAULT}, except);
			}
			model.set({"state": state});
		} else {
			log('Error', 'set state to incorrect model (Tab )')
		}
	}
});

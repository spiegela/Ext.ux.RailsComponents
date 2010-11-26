Ext.ux.RailsStore = Ext.extend(Ext.data.GroupingStore, {
	// Required attributes: controller(String), model(String)
	// controller: '',
	// model:      '',
	fields:     [],
	belongs_to: [],
	autoLoad:   true,
	writeRender: function(params, baseParams, data){
		for(var i in this.belongs_to){
			var assoc = this.belongs_to[i];
			if(typeof(assoc) == "string"){
				var label_attr = assoc + '.name';
				var id_attr    = assoc + '_id';
			} else if(typeof(assoc) == "object") {
				var label_attr = assoc.mapping;
				var id_attr    = assoc.valueField;
			}
			var newData = Ext.ux.util.clone(data);
			
			// Delete empty attrs in new records
			if(! newData.id){
				for(var i in newData){
					if(! newData[i])
						delete(newData[i]);
				}
			}
			
			// If we're setting a belongs_to from the form, do it here
			if(data[label_attr])
				newData[id_attr] = data[label_attr];

			// delete extraneous columns
			delete newData[label_attr];
			delete newData['hide_delete'];
			delete newData['hide_update'];

			baseParams[this.meta.root] = newData;
			params.jsonData = baseParams;
		}
	},
	exceptionHandler: function(proxy, type, action, options, response, arg) {
		if(action == 'update')
			this.rejectChanges();
		if(action == 'create' && this.getAt(0).dirty)
			this.removeAt(0);
			
		if(response.status > 200 || response.success == false)
			Ext.Msg.alert('Operation failed', response.raw.message);
	},
	constructor: function(cfg) {
		cfg = cfg || {};
		Ext.apply(this, cfg);
		
		// Convert belongs_to fields to mapped fields		
		for(var i in this.belongs_to) {
			if(i != 'remove'){
				var assoc = this.belongs_to[i];
				if(typeof(assoc) == "string"){
					var new_field = {name: assoc + '_name', mapping: assoc + '.name'};
				} else if(typeof(assoc) == "object") {
					var new_field = {name: assoc.name, mapping: assoc.mapping};
				}
			}
			this.fields.push(new_field)
		}
		// Add default permissions fields
		this.fields.push({ name: 'hide_delete', type: 'boolean' });
		this.fields.push({ name: 'hide_update', type: 'boolean' });
		
		// Apply the final config
		Ext.apply(this, {
			storeId: this.controller,
			proxy: new  Ext.data.HttpProxy({url: '/' + this.controller + '.json'}),			
			restful: true,
      writer: new Ext.data.JsonWriter(
				{	encode: false,
					belongs_to: this.belongs_to,
					render: this.writeRender
			}),
			reader: new Ext.data.JsonReader({
				totalProperty: 'total',
				successProperty: 'success',
				idProperty: 'id',
				root: this.model,
				fields: this.fields
			}, Ext.data.Record.create(this.fields))
		});
		
		// Add listeners after initial config
		Ext.apply(this, {
			listeners: { exception: this.exceptionHandler }
		});
		
		Application.Store.RailsStore.superclass.constructor.call(this);
	}
});

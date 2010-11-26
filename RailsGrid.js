Ext.ux.RailsGrid = Ext.extend(Ext.grid.GridPanel, {
	// Required attributes store(String), columns(Array)
	// Optional attributes disableSearch(Boolean)
	privileged: true,
	loadMask: true,
	viewConfig: { forceFit: true },
	initComponent: function(){
		// Create base config
		//
		Ext.apply(this, {
			defaults: { xtype: 'gridcolumn', sortable: true },
			editor: new Ext.ux.grid.RowEditor({
				clicksToEdit: 0, // We'll use RowActions to Edit
				listeners: {
					canceledit: function(editor){
						if(editor.grid.store.data.items[0].phantom)
							editor.grid.store.removeAt(0);
					}
				}
			}),
			action: new Ext.ux.grid.RowActions({
				header: 'Actions',
				keepSelection: true,
				actions: [
					{	iconCls: 'icon-minus',
						qtip: 'Delete',
						hideIndex: 'hide_delete'
					},
					{	iconCls: 'icon-edit-record',
						qtip: 'Edit',
						hideIndex: 'hide_update'
					},
					{	iconCls: 'icon-form-edit',
						qtip: 'Edit in Window',
						hideIndex: 'hide_update'
					}
				],
				callbacks: {
					'icon-minus': function(grid, record,  action, row, col){
						grid.onDelete(record);
					},
					'icon-edit-record': function(grid, record,  action, row, col){
						grid.onUpdate(row);
					}
				},
				getEditor: function(){ return null; }
			}),
			sm: new Ext.grid.CheckboxSelectionModel({getEditor: function(){ return null; }}),
			view: new Ext.grid.GroupingView({ markDirty: false }),
			tbar: new Ext.Toolbar({
				items: [
					{	xtype: 'button',
						text: 'Create New',
						iconCls: 'icon-plus',
						scope: this,
						handler: function(button, event){ this.onCreate() }
					},
					{	xtype: 'button',
						text: 'Create in Window',
						iconCls: 'icon-form-add',
						scope: this,
						handler: function(button, event){ this.onCreateWindow() }
					},// '-',

					/* Multiple-Delete Exceptions are handled incorrectly....
					 * 
					{	xtype: 'button',
						text: 'Delete Multiple',
						iconCls: 'icon-del-table',
						scope: this,
						handler: function(button, event){ this.onDeleteMultiple() }
					}
					*/
				]
			}),
			bbar: new Ext.Toolbar({
				items: [
					{	xtype: 'button',
						text: 'Refresh',
						iconCls: 'icon-refresh',
						scope: this,
						handler: function(button, event){ this.onRefresh() }
					}
				]
			})
		});
		
		// Add handler functions
		//
		Ext.apply(this, {
			onRefresh: function(){ this.store.reload(); },
			onUpdate: function(row) {
				this.editor.startEditing(row,false);
			},
			onCreate: function() {
				// Create hidden attr hash
				var attr_hash = {hide_delete: false, hide_update: false}
				
				if(this.store.isFiltered && this.store.filterData)
					attr_hash[this.store.filterData.property] = this.store.filterData.value;
				
				// Populate dummy record with hidden attrs
				var r = new this.store.recordType(attr_hash);
		    this.editor.stopEditing();
		    this.store.insert(0, r);
		    this.editor.startEditing(0);
			},
			onDelete: function(record){
				Ext.Msg.show({
					title: 'Delete record?',
					msg: 'Do you really want to delete <b>' + record.get('name') + '</b><br/>There is no undo.',
					icon: Ext.Msg.QUESTION,
					buttons: Ext.Msg.YESNO,
					scope: this,
					record: record,
					fn: function(response, text, opt){
						if('yes' == response)
							this.store.remove(opt.record);
					}
				})
			},
			onDeleteMultiple: function(){
				if(this.getSelectionModel().getCount() == 0){
					Ext.Msg.show({
						icon: Ext.Msg.ERROR,
						buttons: Ext.Msg.OK,
						msg: 'No records are currently selected'
					});
				} else {
					Ext.Msg.show({
						title: 'Delete multiple records?',
						msg: 'Do you really want to delete ' + this.getSelectionModel().getCount() + ' records?<br/>There is no undo.',
						icon: Ext.Msg.QUESTION,
						buttons: Ext.Msg.YESNO,
						scope: this,
						fn: function(response, text, opt){
							if('yes' == response){
								this.store.remove(this.getSelectionModel().getSelections());
							}
						}
					})			
				}
			}
		});
		
		// Add plugins
		//
		Ext.apply(this, {plugins: [this.action, this.editor]});
		
		// Allow users to enable/disable search box
		if(! this.disableSearch)
			this.plugins.push(new Ext.ux.grid.Search({
		  	iconCls: 'icon-zoom',
		  	minChars: 2,
				mode: 'local',
				align: 'right',
		  	autoFocus: true
			}));
			
		this.columns.unshift(this.sm);
		this.columns.push(this.action);
		Application.Ui.RailsGrid.superclass.initComponent.call(this);
		
	}
});

Ext.reg('railsgrid', Application.Ui.RailsGrid);

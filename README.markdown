#Ext.ux.RailsComponents


##Description

This is just a collection of Ext.JS components I've created to make life easier for me with rails.  I expect that these will continue to grow and become more robust as I use them.  I don't do any javascript generation with ERB or anything like that -- I've tried it and think it's evil.  Instead I'm trying to make Rails and Ext.JS meet in the middle:  JSON only controllers with some Ext friendly properties on return, Ext.JS Stores and Grids that understand "belongs\_to" and "has\_many".

##Components

###Ext.ux.RailsStore

  This restful store extends the GroupingStore, hooks up to a rails resource via JSON, and expects the controller to use the following controller format:

	{'success' => true, 'total => <some number>, '<resource>' => {...}}

  The store handles errors with the following format:

	{'success' => false, 'message' => <message>, '<resource>' => {...}}
		
  Here's an example:

	new Ext.ux.RailsStore({
		controller: 'accounts',
		model: 'user',
		fields: [
			{	name: 'id', type: 'integer' },
			{	name: 'name', allowBlank: false },
			{	name: 'login', allowBlank: false },
			{	name: 'role', allowBlank: false }
		]
	});
		
###Ext.ux.RailsGrid
  This grid uses RowEditor, RowActions and works seamlessly with the RailsStore above.

  Here's an example:

	Application.UserGrid = Ext.extend(Ext.ux.RailsGrid, {
		store: 'users',
		columns: [
			{ header: 'Name',
			  dataIndex: 'name',
		  	  editor: { xtype: 'textfield' }
			},
			{ header: 'Login',
			  dataIndex: 'login',
		  	  editor: { xtype: 'textfield' }
			},
			{ header: 'Role',
			  dataIndex: 'name',
		  	  editor: {
				xtype: 'combo',
				store: new Ext.data.SimpleStore({
					fields: ['value'],
					data: [['Admin'],['Staff'],['Other']]
				}),
				mode: 'local',
				valueField: 'value',
				displayField: 'value'
			  }
			}
		]
	});
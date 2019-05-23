({
	doInit : function(component, event, helper) {
		var fieldDescribe = component.get("v.fieldDescribe");        
		//if you don't have read access, we're done here.
		if ( !fieldDescribe.describe.userCanRead){ return;}

		var record = component.get("v.record");
		var output;
		var parts = fieldDescribe.original.split(".");
		var id;
		//console.log(parts);        
		try {
			if (fieldDescribe.related){
				output = record[parts[0]][parts[1]];
				id = record[parts[0]].Id;
				//if user
				if (record[parts[0]].attributes.type==='User'){
					//console.log("It is a User!: " + parts[0]);
					helper.getUserPhotoUrl(component, id);
				}
				
				$A.createComponent(
					"ui:outputURL", 
					{
						"value" : '#/sObject/'+id+'/view', 
						"class" : "slds-truncate",
						"label" : output//,
						//"target" : "blank"
					},
					function (created, status){
						helper.addComp(component, created);
					}
				);
				return;
			} else {
				output = record[fieldDescribe.describe.name];            
			} 
		} catch (err){
			console.log('There was an error getting a value for field ' + fieldDescribe.describe.name)
			console.log(err);
			console.log(parts);
			console.log(record);
			console.log(describe);
			output = null;
		}
		
		//this is some kind of html?
		if (/<[a-z][\s\S]*>/i.test(output)){
			$A.createComponent(
				"ui:outputRichText", 
				{
					"value" : output,
					"linkify" : true
				},
				function (created, status){	
					helper.addComp(component, created);            		            
				}
			);
		} else if (fieldDescribe.describe.type === 'datetime'){
			$A.createComponent(
				"ui:outputDateTime", 
				{"value" : output},
				function (created, status){
					helper.addComp(component, created);
				}
			);
		} else if (fieldDescribe.describe.type === 'date'){
			$A.createComponent(
				"ui:outputDate", 
				{"value" : output},
				function (created, status){
					helper.addComp(component, created);
				}
			);
		} else if (fieldDescribe.describe.type === 'url'){
			$A.createComponent(
				"ui:outputURL", 
				{
					"value" : output, 
					"class" : "slds-truncate",
					"label" : output
				},
				function (created, status){
					helper.addComp(component, created);
				}
			);
		} else if (fieldDescribe.describe.type === 'boolean'){
			$A.createComponent(
				"ui:outputCheckbox", 
				{"value" : output},
				function (created, status){
					helper.addComp(component, created);
				}
			);
		} else if (fieldDescribe.describe.type === 'currency'){
			$A.createComponent(
				"ui:outputCurrency", 
				{"value" : output},
				function (created, status){
					helper.addComp(component, created);
				}
			);
		} else if (fieldDescribe.describe.type === 'percent'){
			if (output == undefined)
			{

			}
			else
			{
			$A.createComponent(
				"ui:outputText", 
				{"value" : output + '%'},
				function (created, status){
					helper.addComp(component, created);
				}
			);
			}
		}else {
			$A.createComponent(
				"ui:outputText", 
				{"value" : output},
				function (created, status){
					helper.addComp(component, created);
				}
			);
		}
	}

})
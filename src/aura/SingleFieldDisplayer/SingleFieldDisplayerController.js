({
    doInit : function(component) {
        var record = component.get("v.record");
        var fieldDescribe = component.get("v.fieldDescribe");
        
        var output;
        var parts = fieldDescribe.original.split(".");
        //console.log(parts);
        
        try {
            if (fieldDescribe.related){
                output = record[parts[0]][parts[1]];
            } else {
                output = record[fieldDescribe.describe.name];            
            } 
        } catch (err){
            console.log(err);
            output = null;
        }
        
        //console.log(fieldDescribe.original + ":" + output);
        
        component.set("v.simpleOutput", output);
    },
    
    changePicklist: function(component, event, helper){
        var selected = component.find("picklist").get("v.value");
    	//console.log(selected);        
        helper.saveAnything(component, selected);
    },
    
    flipCheckbox: function(component, event, helper){
        //console.log("checkbox flipped");          
        var selected = component.find("checkbox").get("v.value")
        //flip value        
        helper.saveAnything(component, selected);
    },
    
    updateDate: function(component, event, helper){
        // console.log("in the update date function");
        // console.log(component.find("dateField"));                    
    	var newDate = component.find("dateField").get("v.value");        
		helper.saveAnything(component, newDate);        
    },
    
    updateDateTime: function(component, event, helper){
        // console.log("in the update date function");
        // console.log(component.find("dateField"));                    
    	var newDate = component.find("dateTimeField").get("v.value");        
        helper.saveAnything(component, newDate);        
    },
    
    updateRecord: function(component, event, helper){        
        console.log(event.target);
        
        helper.saveAnything(component, event.target.value)        
    }
})
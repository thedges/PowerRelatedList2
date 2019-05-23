({
    doInit : function(component, event, helper) {
    	component.set("v.showSpinner", true);
        //TODO: do a cleanup on displayFields parameter to make sure it's not invalid (commas, spaces, etc)                
        if(component.get("v.allEditable")){
            component.set("v.editableFields", component.get("v.displayFields"));
        }
        helper.describe(component, component.get("v.sObjectType"));  
    },

    popTitle : function(component, event, helper){    	
        var help = _.filter(event.srcElement.attributes, {'name' : 'data-help'})[0].value;
        console.log(help);
        console.log(event.srcElement.id);

        //great, now insert the tooltip!

    }
    
})
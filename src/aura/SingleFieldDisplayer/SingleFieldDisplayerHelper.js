({
    saveAnything : function(component, fieldValue) {
        //only save immediately if not overriden;     
        var fieldDescribe = component.get("v.fieldDescribe");
        
        if (component.get("v.instantSave")){
            var helper=this;
            
            var record=component.get("v.record");
            if (fieldDescribe.describe.type == 'double' || 
                fieldDescribe.describe.type == 'currency')
            {
              record[fieldDescribe.describe.name] = Number(fieldValue);
            }
            else if (fieldDescribe.describe.type == 'boolean')
            {
               record[fieldDescribe.describe.name] = Boolean(fieldValue);
            }
            else
            {    
              record[fieldDescribe.describe.name] = fieldValue;
            }
            component.set("v.record", record);
            
            console.log("record : " + JSON.stringify(record));
            console.log("recordId : " + record.Id);
            console.log("fieldName : " + fieldDescribe.describe.name);
            console.log(fieldValue);
            
            var params = {
                "recordId" : record.Id,
                "Field" : fieldDescribe.describe.name,
                "newValue" : fieldValue
            };
            
            var action = component.get("c.updateField");
            
            action.setParams(params);
            
            action.setCallback(this, function(a){
                var state = a.getState();
                if (state === "SUCCESS") {
                    //console.log(a);
                    component.set("v.simpleOutput", fieldValue);
                    
                    var fieldChangeEvent = $A.get("e.c:FieldChangeEvent");
                    fieldChangeEvent.fire();
                }  else if (state === "ERROR") {                    
                    var appEvent = $A.get("e.c:handleCallbackError");
                    appEvent.setParams({
                        "errors" : a.getError()
                    });
                    appEvent.fire();    
                } //end if errors            
            });
            $A.enqueueAction(action);
        } else {
            console.log("about to do an event emit");
            //emit the object, and let the parent deal with it
            var object = {};
            object[fieldDescribe.describe.name] = fieldValue;
            var fieldChangeEvent = $A.get("e.c:FieldChangeEvent");
            fieldChangeEvent.setParams({"object" : object});
            fieldChangeEvent.fire();
        }
        
    },

    toastThis : function(message, title) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            "title": title || "Error:",
            "message": message,
            "type": "error",
            "mode": "sticky"
        });
        toastEvent.fire();
    }
})
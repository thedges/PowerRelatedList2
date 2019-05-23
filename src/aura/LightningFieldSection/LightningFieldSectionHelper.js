({
    //shared by lots of functions.  You give it a comma-separated list of stuff, it returns a trimmed array
    CSL2Array: function (CSL){
        
        try{
            var outputArray = CSL.split(",");
            //console.log(outputArray);
            _.forEach(outputArray, function (value, key){
                outputArray[key] = _.trim(value);
            });
            return outputArray;
        } catch(err){
            //console.log(err);
            //intended to handle the "CSL is null scenario"
            return [];
        }
    },
    
    setNewRecord: function (component){
        if (component.get("v.allowAdd")){
            var record = {};
            record[component.get("v.lookupField")] = component.get("v.recordId");            
            component.set("v.newRecord", record);            
        }        
    },
    
    buildQuery: function (component){
        var soql = "select Id, " + component.get("v.displayFields") + " from " + component.get("v.sObjectName") + " where Id = '" + component.get("v.recordId") + "'";      
        //console.log(soql);
        return soql;
    },
    
    query: function (component, soql){
        var action = component.get("c.queryJSON");
        action.setParams({"soql" : soql});
        action.setCallback(self, function(a){
            console.log("query results");   
            var records = JSON.parse(a.getReturnValue());
            console.log(records);
            if (records){
                component.set("v.record", records[0]);                
            }
        });
        $A.enqueueAction(action);        
    }

})
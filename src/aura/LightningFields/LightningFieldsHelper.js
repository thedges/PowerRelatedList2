({
    CSL2Array: function (CSL){        
        try{
            var outputArray = CSL.split(",");
            _.forEach(outputArray, function (value, key){
                outputArray[key] = _.trim(value);
            });
            return outputArray;
        } catch(err){
            //console.log("failed at building CSL array");
            //console.log(err);
            //console.log("lodash is defined?: " + (false || _));
            //intended to handle the "CSL is null scenario"
            return [];
        }
    },
    
    //sort always occurs after filter
    sort : function (component){
        var sortState = component.get("v.sortState");
        if (!sortState) return; //if it's not sorted, just skip it
        var results = _.sortBy(component.get("v.results"), [sortState.field]);
        if (sortState.direction === 'Descending'){
            _.reverse(results);
        }
        component.set("v.results", results);
    },
    
    describe: function (component, objectName){
        var helper = this;
        
        //console.log("displayFields value is:");
        //console.log(component.get("v.displayFields"))
        var fieldsArray = this.CSL2Array(component.get("v.displayFields"));
        //console.log(fieldsArray);
        var editableFields = this.CSL2Array(component.get("v.editableFields"));
        //console.log("Editable");
        //console.log(editableFields);
        var helpFields = this.CSL2Array(component.get("v.helpFields"));
        
        //  public static String describe(String objtype) {
        var action = component.get("c.describe");
        action.setParams({"objtype" : objectName }); 
        action.setStorable();
        action.setCallback(this, function (a){
            var displayFieldsArray=[];
            
            //console.log("result in callback:");
            var output = JSON.parse(a.getReturnValue());
            component.set("v.pluralLabel", output.objectProperties.pluralLabel);
            //console.log(output.fields);
            //now, only get the ones that are in the displayfieldsList            
            //console.log(fieldsArray);
            
            _.forEach(fieldsArray, function(value){
                //console.log(value);
                //check for reference dot
                if (!value.includes(".")){ 
                    //just a normal, non-reference field
                    //console.log("includes editable : " + _.includes(editableFields, value));
                    var temp = {
                        "describe" : _.find(output.fields, {"name" : value}), 
                        "original": value,
                        "editable" : editableFields && _.includes(editableFields, value),
                        "related" : false,
                        "label" : helpFields && _.includes(helpFields, value) ? 'help' : 'label'
                    };                    
                    displayFieldsArray.push(temp);                    
                } else { //it's a relationship/reference field                    
                    displayFieldsArray.push({
                        "describe": value, //placeholder, will update late with related object describe
                        "editable":false, 
                        "original":value,
                        "related":true,
                        "label":"label"
                    });
                }
            });
            
            //first (and possibly only) setting. Will update if parent fields found
            component.set("v.displayFieldsArray", displayFieldsArray);   
            helper.chunk(component);
            component.set("v.showSpinner", false);
            //console.log("done with normal fields");
            //console.log(displayFieldsArray);
            
            //related objects (up one level only!)
            _.forEach(fieldsArray, function(value){                
                if (value.includes(".")){
                    //console.log("dependentField:" + value);
                    var getParentDescribe = component.get("c.describe");
                    
                    //NEW STUFF HERE
                    var relationshipFieldObject = value.split(".")[0].replace("__r", "__c"); //the first part of the field name
                    //console.log("object is" + relationshipFieldObject);
                    //what is the name of that thing, anyway?
                    var relationshipFieldObjectType = _.find(output.fields, {"name" : relationshipFieldObject}).referenceTo[0];
                    //console.log("found field:");
                    //console.log(_.find(output.fields, {"name" : relationshipFieldObject}));
                    //console.log("object type is" + relationshipFieldObjectType);
                        
                    getParentDescribe.setParams({"objtype" : relationshipFieldObjectType});
                    var temp = {};
                    getParentDescribe.setStorable();
                    getParentDescribe.setCallback(this, function (response){
                        displayFieldsArray = component.get("v.displayFieldsArray");
                        //console.log(response)                        
                        var relatedOutput = JSON.parse(response.getReturnValue());
                        //console.log(relatedOutput);
                        //get the describe for that field
                        //console.log("searched name is: " + value.split(".")[1])
                        temp = {"describe" : _.find(relatedOutput.fields, {"name" : value.split(".")[1]}) }
                        //set the proper label

                        temp.describe.label = _.find(output.fields, {"name" : relationshipFieldObject}).label;
                        // console.log("finding describe in original.  New is:")
                        // console.log(temp);
                        //now temp is the describe.  Let's find where to put it
                        var displayFieldIndex = _.findIndex(displayFieldsArray, { 'describe': value});
                        //console.log("found index: " + displayFieldIndex);
                        displayFieldsArray[displayFieldIndex].describe = temp.describe;
                        //console.log(displayFieldsArray);
                        component.set("v.displayFieldsArray", displayFieldsArray);
                        helper.chunk(component);                        
                    });
                    
                    $A.enqueueAction(getParentDescribe);
                }
            });                        
        });
        $A.enqueueAction(action);
        
    },
    
    chunk : function(component){
        component.set("v.chunks", _.chunk(component.get("v.displayFieldsArray"), component.get("v.columns")));
    }
})
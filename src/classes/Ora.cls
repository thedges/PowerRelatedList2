global class Ora {
    
    @AuraEnabled
    global static String sessionId() {
        return UserInfo.getSessionId();
    }

    @AuraEnabled
    global static list<SObject> query(String soql) {
        try
        {
          return Database.query(soql);
        }
        catch (exception e)
        {
            throw new  AuraHandledException(e.getTypeName() + ' - ' + e.getMessage() + ' [Line: ' + e.getLineNumber() + ']');
        }
    }
    
    @AuraEnabled
    global static string getFieldValue(String recordId, String fieldName) {
        System.debug('getFieldValue...');
        String sObjName = Id.valueOf(recordId).getSObjectType().getDescribe().getName();
        String soqlStr = 'SELECT ' + fieldName + ' FROM ' + sObjName + ' WHERE Id = \'' + recordId + '\'';
        List<SObject> objList = Database.query(soqlStr);
        if (objList != null || objList.size() > 0)
        {
            return (String)objList[0].get(fieldName);
        }
        
        return null;
    }
    
    @AuraEnabled
    global static string queryJSON(String soql) {
        return JSON.serialize(Database.query(soql));
    }
    
    @AuraEnabled
    global static String whatsMyPlural(string objtype){
        Schema.SObjectType targetType = Schema.getGlobalDescribe().get(objtype);
        Schema.DescribeSObjectResult sobjResult = targetType.getDescribe();
        return sobjResult.getLabelPlural();
    }
    
    //lovingly lifted from ngforce
    global static Schema.DisplayType getFieldType(string objectName, string fieldname){
        try
        {
        Schema.SObjectType targetType = Schema.getGlobalDescribe().get(objectName);
        Map<String, Schema.sObjectField> targetFields = targetType.getDescribe().fields.getMap();
        return targetFields.get(fieldname).getDescribe().getType();
        }
        catch (exception e)
        {
            throw new  AuraHandledException(e.getTypeName() + ' - ' + e.getMessage() + ' [Line: ' + e.getLineNumber() + ']');
        }
    }
    
    
    @AuraEnabled
    global static String describe(String objtype) {
        try
        {
        Schema.SObjectType targetType = Schema.getGlobalDescribe().get(objtype);
        if (targetType == null) {
            return '[{"message":"The requested resource does not exist","errorCode":"NOT_FOUND"}]';
        }
        
        Schema.DescribeSObjectResult sobjResult = targetType.getDescribe();
        
        Map<String, Schema.SObjectField> fieldMap = sobjResult.fields.getMap();
        
        List<Object> fields = new List<Object>();
        for (String key : fieldMap.keySet()) {
            Schema.DescribeFieldResult descField = fieldMap.get(key).getDescribe();
            Map<String, Object> field = new Map<String, Object>();
            
            field.put('type', descField.getType().name().toLowerCase());
            field.put('name', descField.getName());
            field.put('label', descField.getLabel());
            field.put('userCanRead', descField.isAccessible());
            field.put('userCanEdit', descField.isUpdateable());
            field.put('help', descField.getInlineHelpText());
            field.put('default', descField.getDefaultValue());
            field.put('isHTML', descField.isHtmlFormatted());

            if (field.get('type') == 'double')
            {
              field.put('digits', descField.getDigits());
              field.put('precision', descField.getPrecision());
              field.put('scale', descField.getScale());
            }
            
            //if a field is a picklist, I want the values
            if (field.get('type')=='picklist'){
                List<Schema.PicklistEntry> pickListValues = descField.getPickListValues();
                List<pickListValues> options = new List<picklistValues>();
                for (Schema.PicklistEntry plv : pickListValues) {
                    pickListValues pv = new pickListValues();
                    pv.label = plv.getLabel();
                    pv.value = plv.getValue();
                    options.add(pv);
                }
                field.put('picklistOptions', options);
            }
            
            List<String> references = new List<String>();
            for (Schema.sObjectType t : descField.getReferenceTo()) {
                references.add(t.getDescribe().getName());
            }
            if (!references.isEmpty()) {
                field.put('referenceTo', references);
            }
            
            fields.add(field);
        }
        
        Map<String, Object> result = new Map<String, Object>();
        result.put('fields', fields);
        
        map<string, string> objectProperties = new map<string, string>();
        objectProperties.put('pluralLabel', sobjResult.getLabelPlural());
        result.put('objectProperties', objectProperties);
        
        return JSON.serialize(result);
        }
        catch (Exception e)
        {
            throw new  AuraHandledException(e.getTypeName() + ' - ' + e.getMessage() + ' [Line: ' + e.getLineNumber() + ']');
        }
    }
    
    @AuraEnabled
    global static void updateField(id recordId, string Field, string newValue){

        try
        {
        system.debug(' in the update function');
        Schema.SObjectType sobjectType = recordId.getSObjectType();
        String sobjectName = sobjectType.getDescribe().getName();
        
        SObject obj = Database.query('Select Id, ' + Field + ' From ' + sobjectName + ' Where Id = \'' + recordId + '\'');
        
        //what type of field are we?
        Schema.DisplayType valueType = getFieldType(sobjectName, Field);
        
        if (valueType != Schema.DisplayType.String) {
            // Coerce an incoming String to the correct type
            String svalue = (String)newValue;
            
            if (valueType == Schema.DisplayType.Date) {
                obj.put(Field, Date.valueOf(svalue));
                system.debug('it is a date');
                system.debug(svalue);
                system.debug(Date.valueOf(svalue));
                
            } else if ( valueType == Schema.DisplayType.DateTime) {
                //some formatting hacks from what the LC ui:inputDateTime is providing
                //component provides zulu time ex: 2016-11-26T23:30:00.000Z
                //converting to apex format 2016-11-26 23:30:00
                svalue = svalue.replace('T', ' ');
                svalue = svalue.replace('.000Z', '');
                obj.put(Field, DateTime.valueOfGMT(svalue));

            } else if (valueType == Schema.DisplayType.Percent || valueType == Schema.DisplayType.Currency) {               
                obj.put(Field, svalue == '' ? null : Decimal.valueOf(svalue));
            } else if (valueType == Schema.DisplayType.Double) {
                obj.put(Field, svalue == '' ? null : Double.valueOf(svalue));
            } else if (valueType == Schema.DisplayType.Integer) {
                obj.put(Field, Integer.valueOf(svalue));
            } else if (valueType == Schema.DisplayType.Boolean) {
                obj.put(Field, Boolean.valueOf(svalue));
            } else if (valueType == Schema.DisplayType.Base64) {
                obj.put(Field, EncodingUtil.base64Decode(svalue.split(',')[1]));
            } else {
                obj.put(Field, svalue);
            }
        } else {
            // Just try putting the incoming value on the object
            obj.put(Field, newValue);
        }
        system.debug(obj);
        update obj;
        }
        catch (exception e)
        {
            throw new  AuraHandledException(e.getTypeName() + ' - ' + e.getMessage() + ' [Line: ' + e.getLineNumber() + ']');
        }
    }
    
    //returns the object itself with the correct fields
    @AuraEnabled
    global static string getCurrentValue(string recordId, string picklistField, string sObjectName){
        string soql = 'select Id, ' + picklistField + ' from ' + SobjectName + ' where id = \'' + recordId + '\'';
        list<sobject> records = Database.query(soql);
        return (string)records[0].get(picklistField);
    }
    
    //updates the record
    @AuraEnabled
    global static void setNewValue(string recordId, string picklistField, string newValue){
        sobject o1 = id.valueOf(recordId).getSobjectType().newSobject(id.valueOf(recordId));
        o1.put(picklistField, newValue);
        update o1;       
    }
    
    //returns the picklist options as a list of (value, label)
    @AuraEnabled
    global static map<String, string> getPicklistOptions(string recordId, string picklistField, string sObjectName){
        map<string, string> output = new map<string, string>();
        Schema.sobjectType objType;
        
        //what an ugly hack this is, in the name of reusability!
        if (recordId == null){
            string query = 'Select Id from ' + sObjectName + ' limit 1';
            system.debug(query);
            list<sobject> example = Database.query(query);
            recordId = string.valueOf(example[0].get('Id'));
        } 
        
        objType = Id.valueOf(recordId).getSobjectType();            
        Schema.DescribeSObjectResult dsr  = objType.getDescribe();
        map<string, Schema.SObjectField> fieldMap = dsr.fields.getMap();
        Schema.DescribeFieldResult dfr = fieldmap.get(picklistField).getDescribe();
        list<Schema.PicklistEntry> results = dfr.getPicklistValues();
        
        for (Schema.PicklistEntry pe:results){
            if (pe.isActive()) output.put(pe.getValue(), pe.getLabel());
        }
        return output;
    }
    
    
    //for using the streaming API
    //returns the topic name for this component, creating it if necessary
    @AuraEnabled
    global static String dynamicTopic(String WhichObject, String Field) {
        
        string DynamicQuery = 'Select Id, ' + Field + ' from ' + WhichObject;
        
        //does it exist?
        List<Pushtopic> topicList = [SELECT Id, ApiVersion, Name, Description, Query FROM Pushtopic WHERE Query = :DynamicQuery];
        
        if (topicList.isEmpty()) {
            PushTopic newTopic = new PushTopic();
            newTopic.ApiVersion = 36.0;
            newTopic.Name = (WhichObject+Field).left(25);
            newTopic.Description = 'Autogenerated by AnythingPath Component';
            newTopic.Query = DynamicQuery;
            try {
                insert newTopic;
                return newTopic.Name;
            } catch (DMLException e) {
                System.debug(e);
                return e.getMessage();
            }
        } else {
            return topicList[0].Name;            
        }
    }
    
    
    @AuraEnabled
    global static String create(String objtype, String fields) {
        Schema.SObjectType targetType = Schema.getGlobalDescribe().get(objtype);
        
        Map<String, Schema.sObjectField> targetFields = targetType.getDescribe().fields.getMap();
        
        SObject obj = targetType.newSObject();
        
        Map<String, Object> fieldMap = null;
        
        String error = writeFields(objType, obj, fields);
        if (error != null) {
            return error;
        }
        
        try {
            insert obj;
        } catch (DMLException dmle) {
            String fieldNames = '';
            for (String field : dmle.getDmlFieldNames(0)) {
                if (fieldNames.length() > 0) {
                    fieldNames += ',';
                }
                fieldNames += '"' + field + '"';
            }
            return '[{"fields":[' + fieldNames + '],"message":"' + dmle.getDmlMessage(0) + '","errorCode":"' + dmle.getDmlType(0).name() + '"}]';
        }
        
        Map<String, Object> result = new Map<String, Object>();
        result.put('id', obj.id);
        result.put('object', obj);
        result.put('errors', new List<String>());
        result.put('success', true);
        
        return JSON.serialize(result);
    }
    
    
    private static String writeFields(String objtype, SObject obj, String fields) {
        Map<String, Object> fieldMap = null;
        fieldMap = (Map<String, Object>)JSON.deserializeUntyped(fields);
        fieldMap.remove('attributes');
        
        
        Schema.SObjectType targetType = Schema.getGlobalDescribe().get(objtype);
        
        Map<String, Schema.sObjectField> targetFields = targetType.getDescribe().fields.getMap();
        
        try {
            for (String key : fieldMap.keySet()) {
                if (targetFields.get(key) == null) {
                    system.debug('[{"message":"Field ' + key + ' does not exist on object type ' + objtype + '","errorCode":"INVALID_FIELD"}]');
                    return '[{"message":"Field ' + key + ' does not exist on object type ' + objtype + '","errorCode":"INVALID_FIELD"}]';
                }
                
                Object value = fieldMap.get(key);
                Schema.DisplayType valueType = targetFields.get(key).getDescribe().getType();
                
                if (value instanceof String && valueType != Schema.DisplayType.String) {
                    // Coerce an incoming String to the correct type
                    String svalue = (String)value;
                    
                    if (valueType == Schema.DisplayType.Date) {
                        system.debug('doing ' + key + ' : ' + svalue);
                        obj.put(key, Date.valueOf(svalue));
                    } else if ( valueType == Schema.DisplayType.DateTime) {
                        obj.put(key, DateTime.valueOf(svalue));
                    } else if (valueType == Schema.DisplayType.Percent ||
                               valueType == Schema.DisplayType.Currency) {
                                   obj.put(key, svalue == '' ? null : Decimal.valueOf(svalue));
                               } else if (valueType == Schema.DisplayType.Double) {
                                   obj.put(key, svalue == '' ? null : Double.valueOf(svalue));
                               } else if (valueType == Schema.DisplayType.Integer) {
                                   obj.put(key, Integer.valueOf(svalue));
                               } else if (valueType == Schema.DisplayType.Base64) {
                                   obj.put(key, EncodingUtil.base64Decode(svalue.split(',')[1]));
                               } else {
                                   obj.put(key, svalue);
                               }
                } else {
                    // Just try putting the incoming value on the object
                    obj.put(key, value);
                }
            }
        } catch (SObjectException soe) {
            system.debug(soe.getMessage() + 'INVALID_FIELD');
            //return makeError(soe.getMessage(), 'INVALID_FIELD');
        }
        
        return null;
    }
    
    
    global class picklistValues {
        String label {get; set;}
        String value {get; set;}
    }
}
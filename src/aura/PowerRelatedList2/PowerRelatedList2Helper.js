({
  //shared by lots of functions.  You give it a comma-separated list of stuff, it returns a trimmed array
  CSL2Array: function(CSL) {
    try {
      var outputArray = CSL.split(",");
      _.forEach(outputArray, function(value, key) {
        outputArray[key] = _.trim(value);
      });
      return outputArray;
    } catch (err) {
      //intended to handle the "CSL is null scenario"
      return [];
    }
  },

  getPlural: function(component) {
    var action = component.get("c.whatsMyPlural");
    //public static String whatsMyPlural(string objtype){
    action.setParams({ objtype: component.get("v.objectName") });
    action.setCallback(self, function(a) {
      //console.log("plural returned!")
      //console.log(a)
      //console.log(a.getReturnValue);
      component.set("v.pluralLabel", a.getReturnValue());
    });
    action.setStorable();
    $A.enqueueAction(action);
  },

  getMatchValue: function(component) {
    var self = this;

    console.log("getMatchValue...");
    var matchField = component.get("v.matchField");
    if (matchField != null && matchField.length > 0) {
      console.log("111...");
      var action = component.get("c.getFieldValue");
      action.setParams({
        recordId: component.get("v.recordId"),
        fieldName: component.get("v.matchField")
      });
      action.setCallback(
        self,
        $A.getCallback(function(a) {
          console.log("matchValue=" + a.getReturnValue());
          component.set("v.matchValue", a.getReturnValue());
          self.query(component, self.buildQuery(component));
        })
      );
      $A.enqueueAction(action);
    } else {
      console.log("222...");
      component.set("v.matchValue", null);
      self.query(component, self.buildQuery(component));
    }
  },

  setNewRecord: function(component) {
    if (component.get("v.allowAdd")) {
      var record = {};
      record[component.get("v.lookupField")] = component.get("v.recordId");
      component.set("v.newRecord", record);
    }
  },

  buildQuery: function(component) {
    var soql =
      "select Id, " +
      component.get("v.displayFields") +
      " from " +
      component.get("v.objectName");

    var matchValue = component.get("v.matchValue");
    if (matchValue != null) {
        soql +=
    " where " +
      component.get("v.lookupField") +
      " = '" +
      matchValue +
      "'";
    } else {
      soql +=
    " where " +
      component.get("v.lookupField") +
      " = '" +
      component.get("v.recordId") +
      "'";
    }

    var recTypeId = component.get("v.recordTypeId");
    var filterRcTypeId = component.get("v.filterRecordTypeId");
    if (filterRcTypeId && recTypeId != null && recTypeId.length > 0) {
      soql += " AND RecordTypeId = '" + recTypeId + "'";
    }

    var whereClause = component.get("v.whereClause");
    if (whereClause != null && whereClause.length > 0) {
      soql += " AND " + whereClause;
    }
    console.log(soql);
    return soql;
  },

  query: function(component, soql) {
    var self = this;
    var action = component.get("c.queryJSON");
    action.setParams({ soql: soql });
    action.setCallback(self, function(a) {
      if (a.getState() === "SUCCESS") {
        //console.log("query results");
        var records = JSON.parse(a.getReturnValue());
        //console.log(records);
        component.set("v.results", records);
        component.set("v.filteredResults", records); //initial unfiltered list
        component.set("v.showSpinner", false);
      } else {
        self.handleErrors(component, a.getError());
      }
    });
    $A.enqueueAction(action);
  },

  filter: function(component) {
    var filter = component.get("v.filter");
    //console.log("in debounced function");
    //console.log(filter);
    if (!filter) {
      //console.log("no filter");
      component.set("v.filteredResults", component.get("v.results"));
    } else {
      //console.log("filter present: " + filter);
      var goodStuff = _.filter(component.get("v.results"), function(record) {
        var contains = false;
        _.forEach(record, function(value) {
          contains =
            contains ||
            _.includes(_.toString(value).toLowerCase(), filter.toLowerCase());
        });
        return contains;
      });
      component.set("v.filteredResults", goodStuff);
    }
    this.sort(component);
  },

  //sort always occurs after filter
  sort: function(component) {
    var sortState = component.get("v.sortState");
    if (!sortState) return; //if it's not sorted, just skip it
    var results = _.sortBy(component.get("v.filteredResults"), [
      sortState.field
    ]);
    if (sortState.direction === "Descending") {
      _.reverse(results);
    }
    component.set("v.filteredResults", results);
  },
  handleErrors: function(component, errors) {
    var self = this;

    let toastParams = {
      title: "Error!",
      message: "Unknown error", // Default error message
      type: "error",
      mode: "sticky"
    };
    // Pass the error message if any
    if (errors && Array.isArray(errors) && errors.length > 0) {
      toastParams.message = errors[0].message;
    } else {
      toastParams.message = errors;
    }
    // Fire error toast
    let toastEvent = $A.get("e.force:showToast");
    toastEvent.setParams(toastParams);
    toastEvent.fire();
  }
});
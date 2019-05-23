({
  doInit: function (component, event, helper) {
    component.set ('v.showSpinner', true);
    //TODO: do a cleanup on displayFields parameter to make sure it's not invalid (commas, spaces, etc)
    //build the query

    //get the describe
    helper.query (component, helper.buildQuery (component));
    helper.getPlural (component);
    //create placeholder record with only the lookup populated
    helper.setNewRecord (component);
  },

  filter: function (component, event, helper) {
    helper.filter (component);
  },

  createRecord: function (component) {
    var standardNewRecord = component.get ('v.standardNewRecord');
    if (standardNewRecord) {
      //set the add value object

      var recordId = component.get ('v.recordId');
      console.log ('createRecord recordId=' + recordId);

      var createRecordEvent = $A.get ('e.force:createRecord');

      var defaultVals = {};
      defaultVals[component.get ('v.lookupField')] = recordId;

      var eventParams = {};
      eventParams['entityApiName'] = component.get ('v.objectName');
      eventParams['defaultFieldValues'] = defaultVals;

      /*
      eventParams['panelOnDestroyCallback'] = function (event) {
        var navEvt = $A.get ('e.force:navigateToSObject');
        navEvt.setParams ({
          recordId: recordId,
        });
        navEvt.fire ();
      };
      */

      var recTypeId = component.get ('v.recordTypeId');
      if (recTypeId != null && recTypeId.length > 0) {
        eventParams['recordTypeId'] = recTypeId;
      }

      createRecordEvent.setParams (eventParams);

      /*
    createRecordEvent.setParams ({
      'entityApiName': component.get("v.objectName"),
      'defaultFieldValues': defaultVals,
      'panelOnDestroyCallback': function (event) {
        //window.location.href = "https://www.google.com";
        var navEvt = $A.get ('e.force:navigateToSObject');
        navEvt.setParams ({
          recordId: component.get ('v.recordId'),
          slideDevName: 'related',
        });
        navEvt.fire ();
      },
    });
    */
      createRecordEvent.fire ();
    } else {
      component.set ('v.adding', true);
    }
  },

  handleFieldChange: function (component, event) {
    console.log ('heard field change');
    var objectChange = event.getParam ('object');

    if (objectChange == null) {
      var filteredResults = component.get ('v.filteredResults');
      console.log ('filteredResults=' + JSON.stringify (filteredResults));
    } else {
      var localObject = component.get ('v.newRecord');
      var objectChange = event.getParam ('object');
      var newObject = _.merge (localObject, objectChange);
      //console.log(newObject);
      component.set ('v.newRecord', _.merge (localObject, objectChange));

      //no debug version
      //component.set("v.newRecord", _.merge(component.get("v.newRecord"), event.getParam("object")));
    }
  },

  saveNewRecord: function (component, event, helper) {
    var action = component.get ('c.create');
    console.log ('saveNewRecord...');
    console.log ('record=' + JSON.stringify (component.get ('v.newRecord')));

    action.setParams ({
      objtype: component.get ('v.objectName'),
      fields: JSON.stringify (component.get ('v.newRecord')),
    });
    action.setCallback (self, function (a) {
      if (a.getState () === 'SUCCESS') {
        console.log ('success=' + a.getReturnValue ());
        var response = JSON.parse (a.getReturnValue ());

        if (response.success) {
          var results = component.get ('v.results');
          results.push (response.object);

          component.set ('v.results', results); //set results
          helper.filter (component);
          component.set ('v.adding', false); //close the modal
          helper.setNewRecord (component); //ready for next one
          component.set ('v.errorMsg', '');
        }

        if (response[0].message != null && response[0].message.length > 0) {
          console.log ('errorMsg=' + response[0].message);
          component.set ('v.errorMsg', response[0].message);
        }
      } else if (a.getState () === 'ERROR') {
        //fires toasts with any issues
        console.log ('error=' + a.getError ());
        component.set ('v.errorMsg', a.getError ());
        /*
        var appEvent = $A.get ('e.c:handleCallbackError');
        appEvent.setParams ({
          errors: a.getError (),
          errorComponentName: 'PRL',
        });
        appEvent.fire ();
        */
      }
    });
    $A.enqueueAction (action);
  },

  cancelCreate: function (component) {
    component.set ('v.errorMsg', '');
    component.set ('v.adding', false);
  },

  handleSelect: function (component, event) {
    //Here, I want to navigate to the record
    //console.log("event");
    //console.log(event);
    var navEvt = $A.get ('e.force:navigateToSObject');
    navEvt.setParams ({
      recordId: event.getParam ('recordId'),
    });
    navEvt.fire ();
  },
  handleEditClick: function (component, event, helper) {
    var editMode = component.get ('v.editMode');
    component.set ('v.editMode', !editMode);
  },
  closeError: function (component, event, helper) {
    component.set ('v.errorMsg', '');
  },
});
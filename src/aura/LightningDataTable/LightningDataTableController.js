({
  doInit: function (component, event, helper) {
    //TODO: do a cleanup on displayFields parameter to make sure it's not invalid (commas, spaces, etc)
    helper.describe (component, component.get ('v.sObjectType'));
  },

  changeSort: function (component, event, helper) {
    console.log (event.target);
    if (component.get ('v.sortState.field') === event.target.id) {
      //same field, flip it!
      if (component.get ('v.sortState.direction') === 'Ascending') {
        component.set ('v.sortState.direction', 'Descending');
      } else {
        component.set ('v.sortState.direction', 'Ascending');
      }
    } else {
      //new field, set it to that, Ascending
      component.set ('v.sortState', {
        field: event.target.id,
        direction: 'Ascending',
      });
    }
    helper.sort (component);
  },

  //TODO: options for click behavior
  selectRecord: function (component, event) {
    console.log ('nav invoked, get id first');

    console.log (event.target);
    var recordId = event.target.id;
    console.log (recordId);

    var selectedEvent2 = $A.get ('e.ltng:selectSObject');
    selectedEvent2.setParams ({
      recordId: recordId,
    });
    selectedEvent2.fire ();
    //console.log(selectedEvent);
  },
  handleFieldChange: function (component, event, helper) {
    helper.sum (component);
  },
  resultsChange: function (component, event, helper) {
    helper.sum (component);
  },
});
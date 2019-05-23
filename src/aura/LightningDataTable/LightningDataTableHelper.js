({
  CSL2Array: function (CSL) {
    try {
      var outputArray = CSL.split (',');
      _.forEach (outputArray, function (value, key) {
        outputArray[key] = _.trim (value);
      });
      return outputArray;
    } catch (err) {
      console.log ('failed at building CSL array');
      //console.log("lodash is defined?: " + (false || _));
      //intended to handle the "CSL is null scenario"
      return [];
    }
  },

  //sort always occurs after filter
  sort: function (component) {
    var sortState = component.get ('v.sortState');
    if (!sortState) return; //if it's not sorted, just skip it
    var results = _.sortBy (component.get ('v.results'), [sortState.field]);
    if (sortState.direction === 'Descending') {
      _.reverse (results);
    }
    component.set ('v.results', results);
    console.log ('results=' + JSON.stringify (results));
  },

  sum: function (component) {
    var sumFieldVals = [];
    var sumFieldsArr = component.get ('v.sumFieldsArray');
    console.log ('sumFieldsArray=' + JSON.stringify (sumFieldsArr));

    var displayFieldsArray = component.get ('v.displayFieldsArray');
    console.log ('displayFieldsArray=' + JSON.stringify (displayFieldsArray));
    var results = component.get ('v.results');
    console.log ('results=' + JSON.stringify (results));

    _.forEach (displayFieldsArray, function (value) {
      if (sumFieldsArr.includes (value.describe.name)) {
        console.log ('field=' + JSON.stringify (value));
        var fieldName = value.describe.name;
        var total = 0;

        _.forEach (results, function (res) {
          if (res[fieldName] != null) {
            total += res[fieldName];
          }
        });
        console.log ('total.1=' + total);

        if (value.describe.type == 'currency') {
          sumFieldVals.push (
            '$' +
              total.toFixed (2).replace (/./g, function (c, i, a) {
                return i > 0 && c !== '.' && (a.length - i) % 3 === 0
                  ? ',' + c
                  : c;
              })
          );
        } else if (value.describe.scale != 0) {
          console.log ('2');
          sumFieldVals.push (
            total
              .toFixed (value.describe.scale)
              .replace (/./g, function (c, i, a) {
                return i > 0 && c !== '.' && (a.length - i) % 3 === 0
                  ? ',' + c
                  : c;
              })
          );
        } else if (value.describe.scale == 0) {
          console.log ('2');
          sumFieldVals.push (
            total
              .toFixed (value.describe.scale)
              .replace (/./g, function (c, i, a) {
                return i > 0 && c !== '.' && (a.length - i) % 3 === 0
                  ? ',' + c
                  : c;
              })
          );
        } else {
          console.log ('3');
          sumFieldVals.push (
            total.toString ().replace (/./g, function (c, i, a) {
              return i > 0 && c !== '.' && (a.length - i) % 3 === 0
                ? ',' + c
                : c;
            })
          );
        }
      } else {
        sumFieldVals.push ('');
      }
    });

    console.log ('sumFieldVals=' + JSON.stringify (sumFieldVals));
    component.set ('v.sumFieldVals', sumFieldVals);
  },

  describe: function (component, objectName) {
    var self = this;

    try {
      console.log ('displayFields value is:');
      //console.log(component.get("v.displayFields"))
      var fieldsArray = this.CSL2Array (component.get ('v.displayFields'));
      //var capColTitle = component.get("v.capColTitle");

      console.log (fieldsArray);
      var editableFields = this.CSL2Array (component.get ('v.editableFields'));

      if (
        component.get ('v.sumFields') != null &&
        component.get ('v.sumFields').length > 0
      ) {
        component.set (
          'v.sumFieldsArray',
          this.CSL2Array (component.get ('v.sumFields'))
        );
      }

      //	public static String describe(String objtype) {
      var action = component.get ('c.describe');
      action.setStorable ();
      action.setParams ({objtype: objectName});
      action.setCallback (this, function (a) {
        if (a.getState () === 'SUCCESS') {
          try {
            var displayFieldsArray = [];

            console.log ('result in callback:');
            var output = JSON.parse (a.getReturnValue ());
            console.log ('output=' + JSON.stringify (output));
            //component.set("v.pluralLabel", output.objectProperties.pluralLabel);
            //console.log(output.fields);
            //now, only get the ones that are in the displayfieldsList
            //console.log(fieldsArray);

            _.forEach (fieldsArray, function (value) {
              var tmpRec = output.fields.filter (obj => {
                return obj.name === value;
              });
              console.log ('tmpRec=' + JSON.stringify (tmpRec));
              if (tmpRec.length == 0) {
                throw 'Field [' +
                  value +
                  '] is not found in object [' +
                  objectName +
                  ']';
              }

              //check for reference dot
              if (!value.includes ('.')) {
                //just a normal, non-reference field
                var temp = {
                  describe: _.find (output.fields, {name: value}),
                  original: value,
                  editable: _.includes (editableFields, value),
                  related: false,
                };
                displayFieldsArray.push (temp);
              } else {
                //it's a relationship/reference field
                displayFieldsArray.push ({
                  describe: value, //placeholder, will update late with related object describe
                  editable: false,
                  original: value,
                  related: true,
                });
              }
            });

            //first (and possibly only) setting. Will update if parent fields found
            component.set ('v.displayFieldsArray', displayFieldsArray);
            //console.log("done with normal fields");
            console.log (
              'displayFieldsArray=' + JSON.stringify (displayFieldsArray)
            );

            //related objects (up one level only!)
            _.forEach (fieldsArray, function (value) {
              if (value.includes ('.')) {
                console.log ('dependentField:' + value);
                var parentDesribe = component.get ('c.describe');
                var parentObjectName = value
                  .split ('.')[0]
                  .replace ('__r', '__c'); //replaces if custom
                //do a describe for that object
                //
                parentDesribe.setParams ({objtype: parentObjectName});
                var temp = {};
                parentDesribe.setCallback (this, function (response) {
                  displayFieldsArray = component.get ('v.displayFieldsArray');
                  //console.log(response)
                  var relatedOutput = JSON.parse (response.getReturnValue ());
                  ////console.log(relatedOutput);
                  //get the describe for that field
                  //console.log("searched name is: " + value.split(".")[1])
                  temp = {
                    describe: _.find (relatedOutput.fields, {
                      name: value.split ('.')[1],
                    }),
                  };
                  //console.log(temp);
                  //now temp is the describe.  Let's find where to put it
                  var displayFieldIndex = _.findIndex (displayFieldsArray, {
                    describe: value,
                  });
                  //console.log("found index: " + displayFieldIndex);
                  displayFieldsArray[displayFieldIndex].describe =
                    temp.describe;
                  //console.log(displayFieldsArray);
                  component.set (
                    'v.displayFieldsArray',
                    JSON.stringify (displayFieldsArray)
                  );
                });

                $A.enqueueAction (parentDesribe);
              }
            });

            console.log ('converting to uppercase');
            if (component.get ('v.colUppercase')) {
              displayFieldsArray = component.get ('v.displayFieldsArray');
              _.forEach (displayFieldsArray, function (value) {
                if (value.describe != null && value.describe.label != null) {
                  value.describe.label = value.describe.label.toUpperCase ();
                }
              });
              component.set ('v.displayFieldsArray', displayFieldsArray);
            }

            self.sum (component);
          } catch (err) {
            self.handleErrors (component, err);
          }
        } else {
          console.log ('describe error');
          self.handleErrors (component, a.getError ());
        }
      });
      $A.enqueueAction (action);
    } catch (err) {
      this.handleErrors (component, err);
    }
  },
  handleErrors: function (component, errors) {
    console.log ('handleErrors()...');
    var self = this;

    let toastParams = {
      title: 'Error!',
      message: 'Unknown error', // Default error message
      type: 'error',
      mode: 'sticky',
    };
    // Pass the error message if any
    if (errors && Array.isArray (errors) && errors.length > 0) {
      toastParams.message = errors[0].message;
    } else {
      toastParams.message = errors;
    }
    // Fire error toast
    let toastEvent = $A.get ('e.force:showToast');
    toastEvent.setParams (toastParams);
    toastEvent.fire ();
  },
});
# PowerRelatedList2

This is an updated version of the very useful component that Shane McLauglin built [here](https://github.com/mshanemc/PowerRelatedList) so thanks to him for building out 99% of this. 

This version provides the following extra features:

* Ability to define a set of numerical fields to calculate a SUM at bottom of related list. The SUM will be adjusted dynamically as filter text is provided.
* Ability to cycle in and out of "edit mode".
* Ability to set a SOQL "where clause" definition so that multiple versions of the component can be used on page to show different slices of the related list data (ex: Status = 'New' ...or... Priority = 'High')
* Flag to set column titles to uppercase to match standard Salesforce list view 
* Ability to set a default Record Type Id for any new records created
* Ability to use 2 screen options for new records: 1) utilize the standard new record screen that comes with Lightning or 2) a custom screen that dynamically renders with the defined display fields used for the setting the columns.

## Configuration Parameters

Here are the configuration parameters for the component:

| Parameter | Type | Description |
|-----------|------|-------------|
| Title | String | The title to display at top of component |
| Icon | String | The SLDS icon string. Icons defined on [this page](https://lightningdesignsystem.com/icons/) and format is group:icon_name. So example for first icon on SLDS page is "action:add_contact" |
| Column Uppercase | Boolean | Turn on/off to capitalize column titles to all uppercase like standard related lists |
| Object Name | String | The API name of the child/related object to show in this related list|
| Lookup Field | String | The API field name on the child object that provides the lookup to the parent record |
| Fields to Show | Comma Separated String | CSV string of all the API field names to show in the related list |
| Fields to Edit | Comma Separated String | Optional CSV string of all the API field names to make editable (these fields must also be included in the "Fields to Show" setting |
| Fields to SUM | Comma Separated String | Optional CSV string of all the API field names to SUM totals (these fields must also be included in the "Fields to Show" setting |
| Record Type Id | String | The record type id to set for new records created |
| Start in Edit Mode | Boolean | Turn on/off ability to start in edit mode |
| Filter on Record Type | Boolean | Filter list of records based on record type id defined above |
| Show Filter | Boolean | Show/hide the filter option |
| Allow Add | Boolean | Show/hide the 'New' button to add new related objects |
| Where Clause | String | Specify a SOQL where clause to limit the child records returns (ex: <b>Status = 'New'</b> for all  new child records |
| Standard New Record | Boolean | Turn on/off flag to use standard new record modal window...else use custom new record window that only shows fields defined in the component |



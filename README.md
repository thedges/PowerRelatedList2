# PowerRelatedList2

This is an updated version of the very useful component that Shane McLauglin built [here](https://github.com/mshanemc/PowerRelatedList). This version provides the following extra features:

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
| Icon | String | The SLDS icon string. Icons defined on [this page](https://lightningdesignsystem.com/icons/) and format is group:icon_name. So example for first icon is "action:add_contact" |
| Column Uppercase | Boolean | |
| Object Name | String | |
| Lookup Field | String | |
| Fields to Show | Comma Separated String | |
| Fields to Edit | Comma Separated String | |
| Fields to SUM | Comma Separated String | |
| Record Type Id | String | |
| Start in Edit Mode | Boolean | |
| Filter on Record Type | Boolean | |
| Show Filter | Boolean | |
| Allow Add | Boolean | |
| Where Clause | String | |



# PowerRelatedList2

This is an updated version of the very useful component that Shane McLauglin built [here](https://github.com/mshanemc/PowerRelatedList). This version provides the following extra features:

* Ability to define a set of numerical fields to calculate a SUM at bottom of related list. The SUM will be adjusted dynamically as filter text is provided.
* Ability to cycle in and out of "edit mode".
* Ability to set a SOQL "where clause" definition so that multiple versions of the component can be used on page to show different slices of the related list data (ex: Status = 'New' ...or... Priority = 'High')
* Flag to set column titles to uppercase to match standard Salesforce list view 
* Ability to set a default Record Type Id for any new records created
* Ability to use 2 screen options for new records: 1) utilize the standard new record screen that comes with Lightning or 2) a custom screen that dynamically renders with the defined display fields used for the setting the columns.

Here are the configuration parameters for the component:

| Parameter | Type | Description |
|-----------|------|-------------|
| Title | | |
| Icon | | |
| Column Uppercase | | |
| Object Name | | |
| Lookup Field | | |
| Fields to Show | | |
| Fields to Edit | | |
| Fields to SUM | | |
| Record Type Id | | |
| Start in Edit Mode | | |
| Filter on Record Type | | |
| Show Filter | | |
| Allow Add | | |
| Where Clause | | |



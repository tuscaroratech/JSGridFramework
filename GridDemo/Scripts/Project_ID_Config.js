function ConfigureDemoGrid() {
    
    var config = {
        Fields: [
            {
                Edit: false, //Can this column be edited?
                Add: false, //Can this column be added by the user?
                Visible: false, //Is this column visible?
                HeaderName: 'Unique ID', //What text should be displayed in the column header?
                FieldType: '', //select, textbox, datepicker, autocompete, checkbox
                Required: false, //Is this field required or can it be blank?
                DataSource: '', //For use if DataSource is select or autocomplete
                Name: 'ID', //DB column name
                width: '200px', //Column width (easy enough)
                RowId: true //Is this column the unique id?
            },
            {
                Edit: true,
                Add: true,
                Visible: true,
                HeaderName: 'Project Type',
                FieldType: 'select',
                Required: true,
                DataSource: 'RetrieveDropDownValues',
                Name: 'Project_Type',
                width: '200px',
                RowId: false
            },
            {
                Edit: true,
                Add: true,
                Visible: true,
                HeaderName: 'Project ID',
                FieldType: 'textbox',
                Required: true,
                DataSource: '',
                Name: 'Project_ID',
                width: '200px',
                RowId: false
            },
            {
                Edit: true,
                Add: true,
                Visible: true,
                HeaderName: 'Start Date',
                FieldType: 'datepicker',
                Required: false,
                DataSource: '',
                Name: 'Start Date',
                width: '200px',
                RowId: false
            }
            ],
                SelectMethod: 'RetrieveProjectIds', //Method to use to retrieve the grid comments.
                SelectParameters: Parameters, //Initial parameters used during the record retrieval
                DeleteMethod: 'DeleteProjectId', //Method to be used during delete
                InsertMethod: 'CreateNewProjectId', //Method to be used during creating.
                EditMethod: 'UpdateProjectId', //Method to be used during updates
                Container: 'MyDemoGridContainer', //the HTML container that will hold the generated grid.
                Table: 'ProjectIdTable', //the ID to be added to the HTML table.
                ID: 'ProjectId', // corresponds with the JavaScript object.
                ProjectType: 'MyType',
                ProjectId: 1234,
                AddParameters: Parameters
            }

    var DemoGrid = new Grid(config);

    //If you're using hooks:
    $(DemoGrid).bind('OnAutocompleteCallback', function (event, id, value) {
        //execute custom logic here
    });

    //This array is defined in GridFramework.js.
    GridObjectArray.push(DemoGrid);

    ProjectIdGrid.RenderTable();
}
   
 
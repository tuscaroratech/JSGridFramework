using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data;
using System.Data.SqlClient;

/// <summary>
/// Summary description for ProjectId
/// </summary>
public class ProjectId
{
    /// <summary>
    /// Retreive the records to be displayed by the grid.
    /// </summary>
    /// <param name="gridConfig">Grid Configuration Parameters (as defined in the js file)</param>
    /// <returns></returns>
    public string RetrieveProjectIds(GridConfigParameters gridConfig)
    {
        DataTable myTable = new DataTable();
        GridGenerator generator = new GridGenerator(gridConfig, myTable);
        return generator.BuildHtmlGrid();
    }

    /// <summary>
    /// Retreive the list of values for the dropdown list via the Data Access Layer.
    /// </summary>
    /// <param name="gridConfig">Grid Configuration Parameters (as defined in the js file)</param>
    /// <param name="CurrentFieldIndex">Index value of the field to retrieve the options list for.</param>
    /// <returns></returns>
    public List<MyListItem> RetrieveDropDownValues(GridConfigParameters gridConfig, int CurrentFieldIndex)
    {
        return null;
    }

    /// <summary>
    /// Create a new record.
    /// </summary>
    /// <param name="parametersToAdd">List of parameters (names and values)</param>
    public void CreateNewProjectId(List<GridQueryParameter> parametersToAdd)
    {
        //Call Data Access Layer to create a new record.
    }

    /// <summary>
    /// Save the result of a value update.
    /// </summary>
    /// <param name="id">Underscore delimited, unique row id and field name</param>
    /// <param name="value">New value to be stored</param>
    public void UpdateProjectId(string id, string value)
    {
        //TODO: Alter jEditable to pass three values instead of two.
        //Call the Data Access Layer to store the new value.
    }

    /// <summary>
    /// Delete a row.
    /// </summary>
    /// <param name="ID">Unique Row ID.</param>
    public void DeleteProjectId(string ID)
    {
        //Call the Data Access Layer to perform the delete action.
    }
}
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

/// <summary>
/// Simple class for containing a grid's configuration 
/// parameters.
/// </summary>
public class GridConfigParameters
{
    public List<GridConfigField> Fields { get; set; }
    public string SelectMethod { get; set; }
    public List<GridQueryParameter> SelectParameters { get; set; }
    public List<GridQueryParameter> AddParameters { get; set; }
    public string DeleteMethod { get; set; }
    public string InsertMethod { get; set; }
    public string EditMethod { get; set; }
    public string Container { get; set; }
    public string Table { get; set; }
    public string ID { get; set; }
    public string ProjectType { get; set; }
    public string ProjectID { get; set; }
}

public class GridConfigField
{
    public GridConfigField() { }
    public bool Edit { get; set; }
    public bool Add { get; set; }
    public bool Visible { get; set; }
    public string HeaderName { get; set; }
    public string FieldType { get; set; }
    public bool Required { get; set; }
    public string DataSource { get; set; }
    public string Name { get; set; }
    public string width { get; set; }
    public bool RowId { get; set; }
}

public class GridQueryParameter
{
    public GridQueryParameter() { }
    public string Name { get; set; }
    public object Value { get; set; }
}
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Reflection;
using System.Web.Services;
using Newtonsoft.Json;

/// <summary>
/// This class acts as a 'traffic cop' for the ajax requests
/// coming from the client. This was implemented because
/// I wanted to keep things as generic as possible. All grids
/// can call this page via jQuery ajax can the page will determine
/// which class to call by looking at the grid configuration parameters.
/// 
/// It does rely on the convention that names are the same in the config 
/// data and the classes that call the data access layer.
/// </summary>
public partial class GridFrameworkHandler : System.Web.UI.Page
{
    [WebMethod]
    public static object BuildHtmlGrid(string Config)
    {
        GridConfigParameters gridConfig = JsonConvert.DeserializeObject<GridConfigParameters>(Config);
        
        Assembly assembly = Assembly.Load("App_Code");
        Object obj = assembly.CreateInstance(gridConfig.ID);
        MethodInfo method = obj.GetType().GetMethod(gridConfig.SelectMethod);
        return method.Invoke(obj, new object[] { gridConfig });
    }

    [WebMethod]
    public static void EditGridRowValue(string Config, string id, string value)
    {
        GridConfigParameters gridConfig = JsonConvert.DeserializeObject<GridConfigParameters>(Config);

        Assembly assembly = Assembly.Load("App_Code");
        Object obj = assembly.CreateInstance(gridConfig.ID);
        MethodInfo method = obj.GetType().GetMethod(gridConfig.EditMethod);
        method.Invoke(obj, new object[] { id, value });
    }

    [WebMethod]
    public static object AddGridRow(string Config)
    {
        GridConfigParameters gridConfig = JsonConvert.DeserializeObject<GridConfigParameters>(Config);

        Assembly assembly = Assembly.Load("App_Code");
        Object obj = assembly.CreateInstance(gridConfig.ID);
        MethodInfo method = obj.GetType().GetMethod(gridConfig.InsertMethod);
        method.Invoke(obj, new object[] { gridConfig.AddParameters });

        return BuildHtmlGrid(JsonConvert.SerializeObject(gridConfig));
    }

    [WebMethod]
    public static object DeleteGridRow(string Config, string ID)
    {
        GridConfigParameters gridConfig = JsonConvert.DeserializeObject<GridConfigParameters>(Config);

        Assembly assembly = Assembly.Load("App_Code");
        Object obj = assembly.CreateInstance(gridConfig.ID);
        MethodInfo method = obj.GetType().GetMethod(gridConfig.DeleteMethod);
        method.Invoke(obj, new object[] { ID });

        return BuildHtmlGrid(JsonConvert.SerializeObject(gridConfig));
    }

    [WebMethod]
    public static List<MyListItem> RetrieveSelectListOptions(string Config, string FieldIndex)
    {
        GridConfigParameters gridConfig = JsonConvert.DeserializeObject<GridConfigParameters>(Config);
        int index = Convert.ToInt32(FieldIndex);

        Assembly assembly = Assembly.Load("App_Code");
        Object obj = assembly.CreateInstance(gridConfig.ID);
        MethodInfo method = obj.GetType().GetMethod(gridConfig.Fields[index].DataSource);
        return (List<MyListItem>)method.Invoke(obj, new object[] { gridConfig, index });
    }

    [WebMethod]
    public static List<MyListItem> RetrieveAutoComleteOptions(string Config, string FieldIndex)
    {
        GridConfigParameters gridConfig = JsonConvert.DeserializeObject<GridConfigParameters>(Config);
        int index = Convert.ToInt32(FieldIndex);

        Assembly assembly = Assembly.Load("App_Code");
        Object obj = assembly.CreateInstance(gridConfig.ID);
        MethodInfo method = obj.GetType().GetMethod(gridConfig.Fields[index].DataSource);
        return (List<MyListItem>)method.Invoke(obj, new object[] { gridConfig});
    }
}
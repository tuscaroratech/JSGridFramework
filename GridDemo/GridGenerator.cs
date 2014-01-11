using System;
using System.Collections.Generic;
using System.Data;
using System.Reflection;
using System.Text;

/// <summary>
/// Given a populated DataTable and a GridConfigParameters instance,
/// generate the HTML table to be returned to the client.
/// </summary>
public class GridGenerator
{
	protected GridConfigParameters gridConfig { get; set; }
    protected DataTable gridData { get; set; }

    public GridGenerator(GridConfigParameters gridConfig, DataTable gridData)
    {
        this.gridConfig = gridConfig;
        this.gridData = gridData;
    }

    public virtual string BuildHtmlGrid()
    {
        StringBuilder GridHTML = new StringBuilder();

        GridHTML.Append("<table id=\"" + gridConfig.ID + "\" class=\"subsectionGrid\">");
        GridHTML.Append(BuildHtmlGridHeaders());
        GridHTML.Append(BuildHtmlGridRows());

        if (gridConfig.InsertMethod != "")
            GridHTML.Append(BuildHtmlGridFooters());

        GridHTML.Append("</table>");

        return GridHTML.ToString();
    }

    public virtual StringBuilder BuildHtmlGridHeaders()
    {
        StringBuilder HeaderHTML = new StringBuilder();

        HeaderHTML.Append("<tr id=\"gridheader\"><th class=\"td-imageHeader\" />");

        foreach (GridConfigField field in gridConfig.Fields)
        {
            if (field.Visible == false)
                HeaderHTML.Append("<th style=\"width: " + field.width + "\" class=\"hide td-header\"><b>" + field.HeaderName + "</b></th>");
            else
                HeaderHTML.Append("<th style=\"width: " + field.width + "\" class=\"td-header leftAlign\"><b>" + field.HeaderName + "</b></th>");
        }

        HeaderHTML.Append("</tr>");

        return HeaderHTML;
    }

    public virtual StringBuilder BuildHtmlGridRows()
    {
        StringBuilder RowHTML = new StringBuilder();

        foreach (DataRow row in gridData.Rows)
        {
            //Find the field that represents the Row ID.
            GridConfigField RowIdField = gridConfig.Fields.Find(
                delegate(GridConfigField field)
                {
                    return field.RowId == true;
                });
                
            string RowId = row.Field<int>(RowIdField.Name).ToString();
            RowHTML.Append("<tr id=\"row" + RowId + "\" ><td class=\"td-imageRow\">");

            if (gridConfig.DeleteMethod != "")
                RowHTML.Append("<img id=\"" + RowId + "\" src=\"Images/delete_sm.png\" class=\"GridButton\" title=\"Delete Row\" alt=\"Delete this record\" onclick=\"ConfirmDelete(this, '" + gridConfig.ID + "')\" />");

            RowHTML.Append("</td>");

            //Assumes that the fields in the config object and the fields in the DataTable are in the same order.
            foreach (GridConfigField field in gridConfig.Fields)
            {
                if (field.Visible == false)
                    RowHTML.Append("<td id=\"" + RowId + "_" + field.Name + "\" class=\"hide td-row\">");
                else if (field.Edit == false)
                    RowHTML.Append("<td id=\"" + RowId + "_" + field.Name + "\"  class=\"td-row leftAlign\"\">");
                else
                    RowHTML.Append("<td id=\"" + RowId + "_" + field.Name + "\" class=\"Editable_" + gridConfig.ID + "_" + field.FieldType + "_" + field.Name + " td-row leftAlign GridValueDisplay\"\">");
                
                RowHTML.Append(row[field.Name].ToString());
                RowHTML.Append("</td>");
            }

            RowHTML.Append("</tr>");
        }

        return RowHTML;
    }

    public virtual StringBuilder BuildHtmlGridFooters()
    {
        StringBuilder FooterHTML = new StringBuilder();

        FooterHTML.Append("<tr id=\"" + gridConfig.ID + "NEW\"><td class=\"td-imageHeader\">");

        if (gridConfig.InsertMethod != "")
            FooterHTML.Append("<img id=\"saveImageNEW\" src=\"Images/add_sm_orange.png\" title=\"Add Row\" alt=\"Save this new record\" onclick=\"AddRecord('" + gridConfig.ID + "',this)\" class=\"GridButton\" />");

        FooterHTML.Append("</td>");

        int FieldCounter = 0;
        foreach (GridConfigField field in gridConfig.Fields)
        {
            FieldCounter++;
            string style = "style=\"width: " + field.width + "\"";

            if (field.Visible == false)
            {
                FooterHTML.Append("<td class=\"hide td-header\" />");
            }
            else if (field.Add == false)
            {
                FooterHTML.Append("<td class=\"td-header\" />");
            }
            else
            {
                FooterHTML.Append("<td " + style + " class=\"td-header leftAlign\">");

                if (field.FieldType == "textbox")
                    FooterHTML.Append("<input type=\'text\' " + style + " id=\'" + gridConfig.ID + "_insertTextBox_" + field.Name + "\' />");
                else if (field.FieldType == "autocomplete")
                {
                    FooterHTML.Append("<input type=\'text\' " + style + " id=\'" + gridConfig.ID + "_insertAutocompleteBox_" + field.Name + "\' />");
                    FooterHTML.Append("<input type=\'hidden\' " + style + " id=\'" + gridConfig.ID + "_insertAutocompleteBox_" + field.Name + "_hidden\' />");
                }
                else if (field.FieldType == "select")
                    FooterHTML.Append(BuildHtmlSelect(style, field, FieldCounter));
                else if (field.FieldType == "datepicker")
                    FooterHTML.Append("<input type=\'text\' " + style + " id=\'" + gridConfig.ID + "_insertDatePicker_" + field.Name + "\' />");
                else if (field.FieldType == "multiline_textbox")
                    FooterHTML.Append("<textarea " + style + " id=\'" + gridConfig.ID + "_insertMultiLineTextBox_" + field.Name + "\' rows=\'4\' />");
                else if (field.FieldType == "checkbox")
                    FooterHTML.Append("<input type=\'checkbox\' " + style + " id=\'" + gridConfig.ID + "_insertCheckbox_" + field.Name + "\' />");

                FooterHTML.Append("</td>");
            }
        }

        return FooterHTML;

    }

    private StringBuilder BuildHtmlSelect(string style, GridConfigField Field, int FieldIndex)
    {
        StringBuilder SelectHTML = new StringBuilder();

        SelectHTML.Append("<select " + style + " id=\"" + gridConfig.ID + "_insertSelectBox_" + Field.Name + "\">");
        SelectHTML.Append("<option value=\"\">--Select--</option>");

        foreach (MyListItem item in RetrieveSelectData(Field, FieldIndex))
            SelectHTML.Append("<option value=\"" + item.value + "\">" + item.label + "</option>");

        SelectHTML.Append("</select>");

        return SelectHTML;
    }

    private List<MyListItem> RetrieveSelectData(GridConfigField Field, int FieldIndex)
    {
        Assembly assembly = Assembly.Load("App_Code");
        Object obj = assembly.CreateInstance(gridConfig.ID);
        MethodInfo method = obj.GetType().GetMethod(Field.DataSource);
        return (List<MyListItem>)method.Invoke(obj, new object[] { gridConfig, FieldIndex });
    }
}
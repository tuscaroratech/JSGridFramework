/*
 * Requires jQuery; Must be included in the parent page.
 * Requires jEditable (http://www.appelsiini.net/projects/jeditable)
 * Requires jQuery UI (for autocomplete and datepicker).
 * 
 *
 * Conventions:
 *    1. fieldConfig field order must match the query (for all operations) exactly.
 *
 *
 *  Hooks:
 *    1. OnTextBoxSubmit ()
 *    2. OnRowAutoCompleteSelect (userId, control)
 *    3. OnAutoCompleteSelect (userId, control)
 *    4. OnDataPickerSubmit (CurrentField)
 *    5. OnRecordAdd (AddParameters)
 *    6. OnEditSave (control, value)
 *    7. OnRowDelete (rowID)
 *    8. OnError (exception)
 *    9. OnMultiLineTextBoxSubmit()
 *    10. OnPostRender (gridConfigParameters)
 */
var GridObjectArray = [];

//Constructor
function Grid(Parameters) {
    this.Parameters = Parameters;
}

 /*
  * A function with the Grid object. Calls the HTML table to built,
  * appended to the appropriate <div>, invokes the jEditable plugin.
  */
Grid.prototype.RenderTable = function () {
    //Re-scope to make available to RenderHtmlTable call.
    var Grid = this;
    
    var jsonConfigData = JSON.stringify(Grid.Parameters);

    $.ajax({
        type: "POST",
        url: 'GridFrameworkHandler.aspx/BuildHtmlGrid',
        data: "{\'Config\':\'" + jsonConfigData + "\'}",
        async: true,
        contentType: "application/json; charset=utf-8",
        success: function (data) {
            //Make sure the <div> container is empty.
            $('#' + Grid.Parameters.Container).empty();

            //Append the HTML table to the <div> container.
            $(data.d).appendTo($('#' + Grid.Parameters.Container));
            InvokejEditable(Grid);

            $(Grid).trigger('OnPostRender', [Grid.Parameters]);
        },
        failure: function (response) {
            alert(response);
        }
    });
}

//Invokes jEditable column by column based on the column type.
function InvokejEditable(Grid) {
    for (var i = 0; i < Grid.Parameters.Fields.length; i++) {
        switch (Grid.Parameters.Fields[i].FieldType) {
            case 'textbox':
                SetupTextbox(Grid, i);
                break;
            case 'select':
                SetupSelect(Grid, i);
                break;
            case 'autocomplete':
                SetupAutocomplete(Grid, i);
                break;
            case 'datepicker':
                SetupDatePicker(Grid, i);
                break;
            case 'multiline_textbox':
                SetupMultiLineTextbox(Grid, i);
                break;
            case 'checkbox':
                SetupCheckbox(Grid, i);
                break;
        }
    }
}

function SetupTextbox(Grid, CurrentField) {
    $('.Editable_' + Grid.Parameters.ID + "_textbox_" + Grid.Parameters.Fields[CurrentField].Name).editable(function (value, settings) {
        EditRecord(value, this, Grid);
        return (value);
    },
    {
        indicator: 'Saving...',
        placeholder: '<div class="GridPlaceHolder">Edit...</div>',
        tooltip: 'Click to edit...',
        onblur: 'submit',
        width: 200,
        onsubmit: function (settings, td) {
            $(Grid).trigger('OnTextBoxSubmit');

            return DoesRequiredFiledCheckPass(td, Grid);
        }
    })
}

function SetupSelect(Grid, CurrentField) {
    var SelectOptions = RetrieveOptions(Grid, CurrentField);
    var OptionArrays = new Array();

    for (var i = 0; i < SelectOptions.length; i++) {
        OptionArrays[SelectOptions[i].value] = SelectOptions[i].label;
    }

    $('.Editable_' + Grid.Parameters.ID + "_select_" + Grid.Parameters.Fields[CurrentField].Name).editable(function (value, settings) {
        EditRecord(value, this, Grid);
        return (value);
    },
    {
        indicator: 'Saving...',
        placeholder: '<div class="GridPlaceHolder">Edit...</div>',
        tooltip: 'Click to edit...',
        data: OptionArrays,
        width: 100,
        type: 'select',
        onblur: 'submit',
        callback: function (value, settings) {
            $(this).html(settings.data[value]);
        }
	});
}

function SetupAutocomplete(Grid, CurrentField) {

    var SelectOptions = RetrieveAutocompleteOptions(Grid, CurrentField);

    $.editable.addInputType('autocomplete', { //Define the custom jEditable plugin type.
        element: function (settings, original) {
            var Visible_Name = $('<input type=\'text\' id=\'Visible_Name\' >');
            var Hidden_ID = $('<input type=\'hidden\' id=\'Hidden_Name\' >');

            $(this).append(Visible_Name);
            $(this).append(Hidden_ID);

            return (Hidden_ID);
        },
        plugin: function (settings, original) {
            $('input', this).autocomplete({
                dataType: 'json',
                source: SelectOptions,
                select: function (event, ui) { //When a name is selected, handle the slash.
                    event.preventDefault();
                    $(this).val(ui.item.label);
                    var sanitizedValue = ui.item.value.replace("1DC\\", "1DC\\\\");
                    $('#Hidden_Name').val(sanitizedValue);

                    $(Grid).trigger('OnRowAutoCompleteSelect', [sanitizedValue, this]);
                }
            });
        }
    });

    $('.Editable_' + Grid.Parameters.ID + "_autocomplete_" + Grid.Parameters.Fields[CurrentField].Name).editable(function (value, settings) {
        EditRecord(value, this, Grid);
        return (value);
    },
    {
        indicator: 'Saving...',
        placeholder: '<div class="GridPlaceHolder">Edit...</div>',
        tooltip: 'Click to edit...',
        submit: 'OK',
        type: 'autocomplete',
        width: 100,
        onsubmit: function (settings, td) {  //Check for required field rule and validate.
            var hiddenVal = $('#Hidden_Name').val();

            if (hiddenVal === '')
                $('#Hidden_Name').val($(td).find('input').val());

            return DoesRequiredFiledCheckPass(td, Grid);
        },
        callback: function (value, settings) { //Callback used for translating LAN ID into the name.
            var id = this.id;

            $(Grid).trigger('OnAutocompleteCallback', [id, value]);
        },
        onedit: function (value, settings) {
            var IsAnotherInEditMode = $('#Hidden_Name').length;

            if (IsAnotherInEditMode > 0) {
                alert('Can not edit this value until the previous change has been submitted.');
                return false;
            }   
        }
    });

    //Add Autocomplete for footer fields
    $('#' + Grid.Parameters.ID + '_insertAutocompleteBox_' + Grid.Parameters.Fields[CurrentField].Name).autocomplete({
        dataType: 'json',
        source: SelectOptions,
        select: function (event, ui) { //When a name is selected, handle the slash.
            event.preventDefault();
            $(this).val(ui.item.label);
            $('#' + Grid.Parameters.ID + '_insertAutocompleteBox_' + Grid.Parameters.Fields[CurrentField].Name + '_hidden').val(ui.item.value.replace("1DC\\", "1DC\\\\"));

            $(Grid).trigger('OnAutoCompleteSelect', [ui.item.value.replace("1DC\\", "1DC\\\\"), this, Grid]);
        }
    });
}

function SetupDatePicker(Grid, CurrentField) {

    //Date Picker jEditable plugin: see jquery.jeditable.datepicker.js

    $('.Editable_' + Grid.Parameters.ID + "_datepicker_" + Grid.Parameters.Fields[CurrentField].Name).editable(function (value, settings) {
        EditRecord(value, this, Grid);
        return (value);
    },
    {
        indicator: 'Saving...',
        placeholder: '<div class="GridPlaceHolder">Edit...</div>',
        tooltip: 'Click to edit...',
        submit: 'OK',
        type: 'datepicker',
        width: 100,
        onsubmit: function (settings, td) {
            $(Grid).trigger('OnDatePickerSubmit', [CurrentField]);
            
            return DoesRequiredFiledCheckPass(td, Grid);
        }
    });

    var selector = '#' + Grid.Parameters.ID + '_insertDatePicker_' + Grid.Parameters.Fields[CurrentField].Name;
    $(selector).datepicker({ dateFormat: 'mm/dd/yy' });
}

function SetupMultiLineTextbox(Grid, CurrentField) {
    $('.Editable_' + Grid.Parameters.ID + "_multiline_textbox_" + Grid.Parameters.Fields[CurrentField].Name).editable(function (value, settings) {
        EditRecord(value, this, Grid);
        return (value);
    },
    {
        indicator: 'Saving...',
        placeholder: '<div class="GridPlaceHolder">Edit...</div>',
        tooltip: 'Click to edit...',
        onblur: 'submit',
        type: 'textarea',
        width: 200,
        onsubmit: function (settings, td) {
            $(Grid).trigger('OnMultiLineTextBoxSubmit');

            return DoesRequiredFiledCheckPass(td, Grid);
        }
    })
}

function SetupCheckbox(Grid, CurrentField) {
    $.editable.addInputType('checkbox', {
        element: function (settings, original) {
            $(this).append('<input ID="gridCheckbox" type="checkbox"/>');
            var hidden = $('<input ID="gridHiddenCheckBox" type="hidden"/>');
            $(this).append(hidden);
            return (hidden);
        },

        submit: function (settings, original) {
            settings = $.extend({ checkbox: {
                trueValue: 'true',
                falseValue: 'false'
            }
            }, settings);

            if ($(':checkbox', this).is(':checked')) {
                $(':hidden', this).val(settings.checkbox.trueValue);
            } else {
                $(':hidden', this).val(settings.checkbox.falseValue);
            }
        },

        content: function (data, settings, original) {
            settings = $.extend({ checkbox: {
                trueValue: 'true',
                falseValue: 'false'
            }
            }, settings);

            if (data == settings.checkbox.trueValue) {
                $(':checkbox', this).attr('checked', 'checked');
            } else {
                $(':checkbox', this).removeAttr('checked');
            }
        }
    });

    $('.Editable_' + Grid.Parameters.ID + "_checkbox_" + Grid.Parameters.Fields[CurrentField].Name).editable(function (value, settings) {
        EditRecord(value, this, Grid);
        return (value);
    }, {
        type: 'checkbox',
        cancel: 'Cancel',
        submit: 'OK',
        tooltip: 'Click to edit...',
        checkbox: { trueValue: 'true', falseValue: 'false' },
        onedit: function (value, settings) {
            var IsAnotherInEditMode = $('#gridHiddenCheckBox').length;

            if (IsAnotherInEditMode > 0) {
                alert('Can not edit this value until the previous change has been submitted.');
                return false;
            }
        }
    });
}

function DoesRequiredFiledCheckPass(td, Grid) {
    var text = $(td).find('input').val()    ;
    var ColumnName = td.id.substring(td.id.indexOf('_') + 1);

    var field = $.grep(Grid.Parameters.Fields, function (e) { return e.Name === ColumnName; })[0];

    //We don't care about a field if it's hidden.
    if (field.Visible === true && text === '' && field.Required === true) {
        alert('The column ' + field.HeaderName + ' is required. Please supply a value.');
        return false;
    }
    else {
        return true;
    }
}

function RetrieveOptions(Grid, GridIndexNumber) {
     var jsonConfigData = JSON.stringify(Grid.Parameters);
     var jsonString = { Config: jsonConfigData, FieldIndex: GridIndexNumber };
     var jsonStringFinal = JSON.stringify(jsonString);

    var data = $.ajax({
        type: "POST",
        url: 'GridFrameworkHandler.aspx/RetrieveSelectListOptions',
        data: jsonStringFinal,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        error: onFailure,
        async: false
    }).done(
        function (ajaxResponse) {
            return ajaxResponse;
        }
    );

    var JsonData = jQuery.parseJSON(data.responseText);
    return JsonData.d;
}

function RetrieveAutocompleteOptions(Grid, GridIndexNumber) {
    var jsonConfigData = JSON.stringify(Grid.Parameters);
    var jsonString = { Config: jsonConfigData, FieldIndex: GridIndexNumber };
    var jsonStringFinal = JSON.stringify(jsonString);

    var data = $.ajax({
        type: "POST",
        url: 'GridFrameworkHandler.aspx/RetrieveAutoComleteOptions',
        data: jsonStringFinal,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        error: onFailure,
        async: false
    }).done(
        function (ajaxResponse) {
            return ajaxResponse;
        }
    );
    var JsonData = jQuery.parseJSON(data.responseText);

    return JsonData.d;
}

function AddRecord(GridObjName) {
    var GridObjName;

    try {

        //Get Grid object that is being interacted with.
        var GridObj = $.grep(GridObjectArray, function (e) { return e.Parameters.ID === GridObjName; });

        //Reset Add Parameters to make sure there are no lingering parameters from other Add actions.
        GridObj[0].Parameters.AddParameters = [];
        GridObj[0].Parameters.AddParameters.push({
            Name: GridObj[0].Parameters.SelectParameters[0].Name,
            Value: GridObj[0].Parameters.SelectParameters[0].Value
        });

        for (var i = 0; i < GridObj[0].Parameters.Fields.length; i++) {
            var field = GridObj[0].Parameters.Fields[i];

            if (field.Add === true) {
                var fieldValue = null;
                switch (field.FieldType) {
                    case 'textbox':
                        fieldValue = $('#' + GridObj[0].Parameters.ID + '_insertTextBox_' + field.Name).val();
                        break;
                    case 'select':
                        fieldValue = $('#' + GridObj[0].Parameters.ID + '_insertSelectBox_' + field.Name).val();
                        break;
                    case 'autocomplete':
                        fieldValue = $('#' + GridObj[0].Parameters.ID + '_insertAutocompleteBox_' + field.Name + '_hidden').val();

                        if (fieldValue === '')
                            fieldValue = $('#' + GridObj[0].Parameters.ID + '_insertAutocompleteBox_' + field.Name).val();
                        break;
                    case 'datepicker':
                        fieldValue = $('#' + GridObj[0].Parameters.ID + '_insertDatePicker_' + field.Name).val();
                        break;
                    case 'multiline_textbox':
                        fieldValue = $('#' + GridObj[0].Parameters.ID + '_insertMultiLineTextBox_' + field.Name).val();
                        break;
                    case 'checkbox':
                        fieldValue = $('#' + GridObj[0].Parameters.ID + '_insertCheckbox_' + field.Name).is(':checked');
                        break;
                }

                GridObj[0].Parameters.AddParameters.push({ 
                    Name: field.Name,
                    Value: fieldValue
                });

                if (field.Required == true && fieldValue == '') {
                    alert(field.HeaderName + ' is a required field.');
                    return;
                }
            }
        }

        var ValidationResult = { canInsertProceed: true };
        $(GridObj).trigger('OnRecordAdd', [GridObj[0].Parameters.AddParameters, ValidationResult]);

        if (ValidationResult.canInsertProceed === true) {
            var jsonConfigData = JSON.stringify(GridObj[0].Parameters);
            var jsonString = { Config: jsonConfigData };
            var jsonStringFinal = JSON.stringify(jsonString);

            $.ajax({
                type: "POST",
                url: 'GridFrameworkHandler.aspx/AddGridRow',
                data: jsonStringFinal,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                async: true,
                error: onFailure,
                success: function (data) {
                    //Make sure the <div> container is empty.
                    $('#' + GridObj[0].Parameters.Container).empty();

                    //Append the HTML table to the <div> container.
                    $(data.d).appendTo($('#' + GridObj[0].Parameters.Container));
                    InvokejEditable(GridObj[0]);

                    $(GridObj[0]).trigger('OnPostRender', [GridObj[0].Parameters]);
                }
            });
        }
    }
    catch (e) {
        alert('Error Adding Grid Record');
    }
 }

 function EditRecord(value, control, GridObj) {
     $(GridObj).trigger('OnEditSave', [control, value]);

     var jsonConfigData = JSON.stringify(GridObj.Parameters);
     var jsonString = { Config: jsonConfigData, id: control.id, value: value };
     var jsonStringFinal = JSON.stringify(jsonString);

     $.ajax({
         type: "POST",
         url: 'GridFrameworkHandler.aspx/EditGridRowValue',
         async: true,
         data: jsonStringFinal,
         contentType: "application/json; charset=utf-8",
         dataType: "json",
         error: onFailure
     });

     return (value);
 }

 function DeleteRecord(IdControl, GridObjName) {

     var GridObj = $.grep(GridObjectArray, function (e) { return e.Parameters.ID === GridObjName; });
     var rowID = IdControl.id;

     //Trigger Hook
     $(GridObj).trigger('OnRowDelete', [rowID]);
     var jsonConfigData = JSON.stringify(GridObj[0].Parameters);
     var jsonString = { Config: jsonConfigData, ID: rowID };
     var jsonStringFinal = JSON.stringify(jsonString);

     $.ajax({
         type: "POST",
         url: 'GridFrameworkHandler.aspx/DeleteGridRow',
         async: true,
         data: jsonStringFinal,
         contentType: "application/json; charset=utf-8",
         dataType: "json",
         error: onFailure,
         success: function (data) {
             ////Make sure the <div> container is empty.
             $('#' + GridObj[0].Parameters.Container).empty();

             //Append the HTML table to the <div> container.
             $(data.d).appendTo($('#' + GridObj[0].Parameters.Container));
             InvokejEditable(GridObj[0]); GridObj[0].RenderTable();

             $(GridObj[0]).trigger('OnPostRender', [GridObj[0].Parameters]);
         }
     });
}

 function ConfirmDelete(control, GridObjName) {
    if (confirm('Are you sure you want to delete the record?')) {
         DeleteRecord(control, GridObjName);
     }
 }

//Method to handle an error in the AJAX call.
function onFailure(response) {
    alert(response.responseText);
}
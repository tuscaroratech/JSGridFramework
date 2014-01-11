JSGridFramework
===============

JavaScript Grid Framework

This framework was intended to replace the stock ASP.NET GridView controls. It has worked well in 
restrictive environments where the now standard JS libraries could not be used (except for jQuery).
It has been used extensively in IE 8+ and even with the limited capabilities of the older IE browsers,
this framework has proven faster then the GridView controls when manipulating data.

The grid rendering is kicked off on page load. A configuration array is built and passed to the server
via a jQuery AJAX call. The server then calles the correct class to retrieve data from the database.
Once the data is retrieved, an HTML table is built on the server and returned to the client. There 
jEditable is invoked on the HTML table and the table is placed on the page.

New records can be added by the footer and existing records can be edited inline via the jEditable plugin.

Check the documentation in GridFramework.js for the available hooks. These hooks allow you to add your
custom code/logic on a specific grid without changing the framework.

Requirements
  - Client
    - jQuery
    - jQuery UI
    - jEditable
    - jEditable.Datepicker
    - json2 
    
  - Server
    - JSON.Net
  

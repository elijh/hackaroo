// the codemirror editor instance
var editor = null;

// how long to wait, in milliseconds, before rendering
var render_delay = 1000;

// we clear the current timer when there is a new change.
var render_timer = null;

//
// these offsets are used to report correct line number errors.
// different browsers count differently. chrome counts from the
// start of the script tag, firefox from the start of the file.
//
// these magic number must be updated when you add or remove
// lines from the inline css or html template.
//
var offset_from_start_of_script = 5;
var offset_from_start_of_file = 13 + offset_from_start_of_script; 

var render_css = [
  "<style>",
  "html  {overflow: auto;}",
  "body  {padding:0; margin:0;}",
  "table {height: 100%; width: 100%; padding:0; margin:0; border-collapse: collapse;}",
  "#output {width: 100%; height: 100%;}",
  "#output span {display: none;}",
  "</style>"
];

var render_template = [
  "<!DOCTYPE html>",
  "<html>",
  "  <head>",
  "    <script src='/lib/prototype.js'></script>",
  "    <script src='/lib/processing.js'></script>",
  "    <script src='/hackaroo/render.js'></script>",
  render_css.join("\n"),
  "    {{script-here}}",
  "  </head>",
  "  <body>",
  "    <table>",
  "      <tr>",
  "        <td class='output'>",
  "          <div id='output'></div>",
  "          <canvas id='canvas'></canvas>",
  "        </td>",
  "      </tr>",
//  "      <tr>",
//  "        <td class='input' id='input_list'></td>",
//  "      </tr>",
  "    </table>",
  "  </body>",
  "</html>"
].join("\n");

var error_template = [
  "<!DOCTYPE html>",
  "<html>",
  "  <head>",
  "  </head>",
  "  <body>",
  "    <h3>Syntax Error:</h3>",
  "    {{body-here}}",
  "  </body>",
  "</html>"
].join("\n");

function renderResultFrame() {
  var frame = $('result');
  var result_doc = frame.contentDocument || frame.contentWindow.document;
  var doc_string = "";

  var editor_code = editor.getValue();

  if (JSHINT(editor_code) == false) {
    // some fatal parsing errors
    var html = [];
    var errors = JSHINT.errors;
    html.push("<ol>");
    for (var i=0; i<errors.length; i++) {
       html.push("<li>");
       if (errors[i] == null) {
         html.push('unknown');
       } else if (typeof errors[i] == 'string') {
         html.push(errors[i]);
       } else {
         html.push('Line ' + errors[i].line + ', character ' + errors[i].character + '<br/><code>' + errors[i].evidence + '</code><br/>' + errors[i].reason);
       }
       html.push("</li>");
     }
     html.push("</ol>");
    doc_string = error_template.replace("{{body-here}}", html.join("\n"));
  } else {
    // no fatal parsing errors, but maybe execution errors. we handle run time
    // errors with the catch.
    var report_error = "reportError(error, " + offset_from_start_of_file + "," + offset_from_start_of_script + ");";
    var stript_string = [
      "<script>",
      "var run=null, setup=null, draw=null, mouseMoved=null;",
      "document.observe('dom:loaded', function() {",
        "if (window.g) {window.g.exit();}",
        "try {",
          editor_code,
          "reload({'run':run, 'draw':draw, 'setup':setup, 'mouseMoved':mouseMoved});",
        "} catch (error) {",
          report_error,
        "}",
      "});",
      "</script>"
    ].join("\n");
    doc_string = render_template.replace("{{script-here}}", stript_string);
  }
  result_doc.open();
  result_doc.write(doc_string);
  result_doc.close();
}

document.observe("dom:loaded", function() {
  editor = CodeMirror.fromTextArea($('code'), {
    enterMode: 'keep',
    lineNumbers: true,
    onChange: function() {
      clearTimeout(render_timer);
      render_timer = setTimeout(renderResultFrame, render_delay);
      Exercise.save_icon_dirty();
    }
  });
  render_timer = setTimeout(renderResultFrame, render_delay);
  Exercise.init();
  User.init();
});


Event.observe(window, 'unload', function() {
  Exercise.save_code();
});


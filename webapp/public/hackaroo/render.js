var inputs = [];
var line_number = 0;

canvas = null;
run = null;
//draw = null;

//
// OUTPUT AND INPUT
//

function write() {
  line_number += 1;
  var output = $('output');
  if (output) {
    var html = "<div><span>" + line_number + "</span>";
    for (var i = 0, length = arguments.length; i < length; i++) {
      html += (arguments[i]+"").replace(/\n/g,"<br/>").replace(/\t/g,"&nbsp;&nbsp;&nbsp;&nbsp;") + " ";
    }
    html += "</div>";
    output.update(output.innerHTML + html);
  }
}

function clear() {
  line_number = 0;
  $('output').innerHTML = "";
}

function read(input_name, default_value) {
  var input_id = "input_" + input_name;
  default_value = default_value || inputs[input_id] || "";
  if (!$(input_id)) {
    var input_list = $("input_list");
    var input_element = new Element("input",
       {"type":"text", "id":input_id,"placeholder":input_name,
       "class":"input","onkeypress":"inputKeyPress(event)"}
    );
    input_element.value = default_value;
    //var label_element = new Element("label",{value:"x"});
    //label_element.value = "hi";
    input_list.insert("<b>" + input_name + "</b>");
    input_list.insert(input_element);
    inputs[input_id] = input_element.value;
  }
  return inputs[input_id];
}

function inputKeyPress(event) {
  var target = eventTarget(event);
  print(target.value);
  inputs[target.id] = target.value + charPressed(event);
  clear();
  main();
}

//
// HELPERS
//

// returns true if the enter key was pressed
function enterPressed(event) {
  event = event || window.event;
  if(event.which) { return(event.which == 13); }
  else { return(event.keyCode == 13); }
}

// returns the character that was pressed
function charPressed(event) {
  chrCode = event.which;
  if (chrCode > 41) {
    return(String.fromCharCode(chrCode));
  } else {
    return("");
  }

}

// cross browser access to event target
function eventTarget(event) {
  event = event || window.event;            // IE doesn't pass event as argument.
  return(event.target || event.srcElement); // IE doesn't use .target
}

function reportError(exception, offset_from_start_of_file, offset_from_start_of_script) {
  var stackItem = exception.stack.split("\n").grep(window.location.href)[0].replace(window.location.href,'');
  var lineNumber = 0;
  if (Prototype.Browser.WebKit) {
    var matches = stackItem.match(/:([0-9]+):([0-9]+)/);
    lineNumber = matches[1] - offset_from_start_of_script;
  } else if (Prototype.Browser.Gecko) {
    var matches = stackItem.match(/:([0-9]+)/);
    lineNumber = matches[1] - offset_from_start_of_file;
  }
  write("Runtime error on <b>line " + lineNumber + "</b>\n");
  write(exception);
}


//
// called every time the DOM is loaded
//
function reload(options) {
  if (typeof options.run == 'function') {
    run();
  }
  if (options.setup || options.draw) {
    // set up processing using the methods defined in source code
    new Processing($('canvas'), function(processing) {
      window.g = processing;
      processing.setup = options.setup;
      if (typeof options.draw == 'function') {processing.draw = options.draw}
      if (typeof options.mouseMoved == 'function') {processing.mouseMoved = options.mouseMoved}
    });
  }
}

document.observe("dom:loaded", function() {
  // canvas = $('canvas');
});


Event.observe(window, 'unload', function() {
  // window.g.exit();
});

//
// override console.error, in order to display these errors.
//

//(function() {
//  var proxy_error = console.error;
//  console.error = function() {
//    write('ERROR ' + inspect(arguments));
//    return proxy_error.apply(this, arguments);
//  };
//})();


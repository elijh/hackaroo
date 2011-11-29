var inputs = [];
var line_number = 0;
var special_functions = ['run', 'setup', 'draw', 'mouseClicked', 'mouseDragged', 'mouseMoved',  'mouseOut', 'mouseOver', 'mousePressed', 'mouseReleased', 'keyPressed', 'keyReleased', 'keyTyped']
var auto_resizing = false;

//
// OUTPUT AND INPUT
//

function write() {
  line_number += 1;
  var output = $('output');
  if (output) {
    var html = "<div><span>" + line_number + "</span>";
    for (var i = 0, length = arguments.length; i < length; i++) {
      var value = arguments[i];
      if (typeof(value) == 'object' && typeof(value.inspect) == 'function') {
        value = value.inspect();
      }
      if (typeof(value) != 'string') {
        value = new String(value);
      }
      html += value.replace(/\n/g,"<br/>").replace(/\t/g,"&nbsp;&nbsp;&nbsp;&nbsp;") + " ";
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
// NUMBERS
//

// The built-in modulo operator in javascript doesn't
// correctly handle negative numbers. This one does.
//Number.prototype.mod = function(n) {
//  return ((this%n)+n)%n;
//};

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
    options.run();
  }
  if (options.setup || options.draw) {
    // set up processing using the methods defined in source code
    new Processing($('canvas'), function(processing) {
      window.g = processing;
      for (var i = 0; i < special_functions.length; i++) {
        var function_name = special_functions[i];
        if (typeof options[function_name] == 'function') {
          processing[function_name] = options[function_name];
        }
      }
      
      // custom methods we are adding to processing:
      
      processing.autoResize = function() {
        auto_resizing = true;
        // I am not sure where these magic numbers come from. 
        // there is a weird gap under the canvas that I can't get rid of.
        this.size(window.innerWidth-2, window.innerHeight-7);
      }
      
      processing.grid = function(step) {
        var color = g.get(0,0);
        g.stroke(g.abs(g.brightness(color)-255), 50);
        for (var x = step; x < g.width; x += step) {
           g.line(x, 0, x, g.height);
        }
        for (var y = step; y < g.height; y += step) {
           g.line(0, y, g.width, y);
        }
      }
    });
  }
}

//
// 
//
//var windowHeight = 0;
//var windowWidth = 0;
//function updateWindowSize() {

//}

Event.observe(window, 'resize', function() {
  if (auto_resizing) {
    window.g.setup();
  }
});

//document.observe("dom:loaded", function() {
//  // canvas = $('canvas');
//});

//Event.observe(window, 'unload', function() {
//  // window.g.exit();
//});

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


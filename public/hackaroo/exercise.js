//
// handles the loading of the exercises and the corresponding code workspace.
//
// exercise object:
//
//   string  name
//   string  title
//   text    body (html)
//   array   sections
//
// each section has the same format as the exercise.
// 


var markdown_converter = new Showdown.converter();

var Exercise = {
  current_exercise_index: null, // index of currently active exercise
  current_section_index: 0,     // index of currently active section
  list: [],

  exercise: function() {
    return(this.list[this.current_exercise_index]);
  },
  
  section: function() {
    try {
      return(this.exercise().sections[this.current_section_index]);
    } catch(error) {
      return(this.exercise());
    }
  },
  
  init: function() {
    this.load_exercises_from_server();
  },
  
  next: function() {
    var ex = this.current_exercise_index + 1;
    if (ex >= this.list.length) { ex = 0 }
    this.set(ex);
  },

  previous: function() {
    var ex = this.current_exercise_index - 1;
    if (ex < 0) { ex = this.list.length-1 }
    this.set(ex);
  },

  choose: function() {
    var html = "<ol>";
    for (var i=0; i< this.list.length; i++) {
      html += "<li>" + this.link(i) + "</li>";
    }
    html += "</ol>";
    Modalbox.show(html, {title:'Choose Exercise', transitions:false});
  },

  set: function(exercise,section) {
    this.local_save_code();
    this.current_exercise_index = exercise;
    this.current_section_index = section || 0;
    
    var header = "<h1 class='first'>" + this.current_title() + "</h1>\n";
    if (this.exercise().sections) {
       header += "<div class='section_links'>" + this.section_links() + "</div>\n";
    }
    $('instructions').update(header + this.current_body());
    $('exercise_number').update(this.current_exercise_index);
    
    this.local_load_code();
  },

  link: function(ex) {
    return('<a href="javascript:Exercise.set(#{ex_num});Modalbox.hide();">#{label}</a>'.interpolate({"ex_num":ex, label:this.list[ex].title}));
  },

  section_links: function() {
    var length = this.exercise().sections.length;
    var html = [];
    for (var i=0; i<length; i++) {
      html.push('<a href="javascript:Exercise.set(#{exercise_num}, #{section_num});">#{i}</a>'.interpolate({"exercise_num":this.current_exercise_index, "section_num":i, "i":i}));
    }
    return(html.join(' '));
  },

  current_body: function() {
    //var body = "";
    //var ex = this.current_exercise;
    //var sect = this.current_section;
    //if (this.current_section == 0 && this.list[ex].body) {
    //  body = this.list[ex].body;
    //} else
    //  body = this.list[ex].exercises[sect].body;
    // }
    return(this.section().body);
  },

  current_title: function() {
    return(this.exercise().title);
  },

  storage_id: function() {
    if (this.exercise().sections) {
      return(this.exercise().name + ' ' + this.section().name);
    } else {
      return(this.exercise().name);
    }
  },

  local_save_code: function(code) {
    if (this.exercise()) {
      var id = this.storage_id();
      localStorage.setItem('code-'+id, code || editor.getValue());
      localStorage.setItem('code-modified-at-'+id, new Date().getTime());
    }
  },

  local_load_code: function() {
    var id = this.storage_id();
    editor.setValue(localStorage.getItem('code-'+id) || "\n\n\n\n\n\n");
  },

  get_code_timestamp: function() {
    var id = this.storage_id();
    return localStorage.getItem('code-modified-at-'+id);
  },
  
  remote_save_code: function() {
    var path = '/files'
    new Ajax.Request(path, {
      method:'post',
      parameters: {
        exercise_name: this.exercise().name,
        section_name: this.section().name,
        user_id: User.current,
        body: editor.getValue()
      },
      onSuccess: function(transport) {
        console.log('saved ' + path);
        $('save_button').setAttribute('class', 'icon tick');
      },
      onFailure: function() {
        alert('Something went wrong, could not save code.');
        $('save_button').setAttribute('class', 'icon disk');
      },
      onLoading: function () {
        $('save_button').setAttribute('class', 'icon spinner');
      }
    });
  },
  
  remote_load_code: function() {
    var path = '/files'
    new Ajax.Request(path, {
      method:'get',
      parameters: {
        exercise_name: this.exercise().name,
        section_name: this.section().name,
        user_id: User.current,
        timestamp: this.get_code_timestamp()
      },
      onSuccess: function(transport) {
        //console.log('success');
        //console.log(transport.responseText);
        //console.log(Exercise.current);
        //console.log(exercise_id);
        var data = transport.responseText.evalJSON();
        if (Exercise.exercise().name == data.exercise_name && Exercise.section().name == data.section_name) {
          Exercise.local_save_code(data.body);
        }
      },
      onComplete: function(transport) {
        var data = transport.responseText.evalJSON();
        if (Exercise.exercise().name == data.exercise_name && Exercise.section().name == data.section_name) {
          Exercise.local_load_code();
        }
        $('load_button').setAttribute('class', 'icon rotate');
      },
      onLoading: function () {
        $('load_button').setAttribute('class', 'icon spinner');
      }
    });
  },
  
//  define: function(arry) {
//    var j = this.list.length+1;  // we start indexing at 1
//    for (var i=0; i<arry.length; i++) {
//      this.load_via_ajax(j++, arry[i][0], arry[i][1]);
//    }
//  },
//  load_via_ajax: function(id, title, filename) {
//    var path = '/exercises/'+filename+'.txt';
//    new Ajax.Request(path, {
//      method:'get',
//      onSuccess: function(transport) {
//        console.log('loaded ' + path);
//        Exercise.add(id, title, transport.responseText);
//      },
//      onFailure: function(){ alert('Something went wrong, could not load exercise.') }
//    });
//  },

  load_exercises_from_server: function() {
    var path = '/exercises';
    new Ajax.Request(path, {
      method:'get',
      onSuccess: function(transport) {
        Exercise.list = transport.responseText.evalJSON();
        console.log('loaded exercise data');
        Exercise.set(0);
        //for (var i = 0; i<Exercise.list.length; i++) {
        //  console.log('  ' + Exercise.list[i].name);
        //}
      },
      onFailure: function() { alert('Could not load exercise data'); }
    });
  },

  //add: function(id, title, text) {
  //  // convert text to html
  //  var html = markdown_converter.makeHtml(text);
  //  this.list[id] = {'title':title, 'body':html};
  //},

  clear_storage: function() {
    localStorage.clear();
  },

//  icon_progress: function() {
//    $('save_button').removeClassName('disk').removeClassName('tick').addClassName('spinner');
//  },
//  
//  icon_saved: function() {
//    $('save_button').removeClassName('spinner').removeClassName('disk').addClassName('tick');
//  },
//  
  save_icon_dirty: function() {
    $('save_button').setAttribute('class', 'icon disk');
  }
}


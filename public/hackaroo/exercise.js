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
  current_exercise_index: 0,  // index of currently active exercise
  current_section_index: 0,   // index of currently active section
  list: [],

  exercise: function(index) {
    index = index || this.current_exercise_index
    return this.list[index];
  },
  
  section: function(index, exercise_index) {
    index = index || this.current_section_index;
    try {
      return this.exercise(exercise_index).sections[index];
    } catch(error) {
      return this.exercise(exercise_index);
    }
  },
  
  init: function() {
    this.load_exercises_from_server();
  },

  // called after load_exercises_from_server () is finished
  init_finished: function() {
    this.local_load_state();
    this.local_load_code();
    this.update_exercise_text();
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
    var html = "<ol start='0'>";
    for (var i=0; i< this.list.length; i++) {
      html += "<li>" + this.link(i) + "</li>";
    }
    html += "</ol>";
    Modalbox.show(html, {title:'Choose Exercise', transitions:false});
  },

  set: function(exercise,section) {
    this.local_save_code();
    this.current_exercise_index = exercise || 0;
    this.current_section_index = section || 0;
    this.update_exercise_text();
    this.local_load_code();
  },

  update_exercise_text: function() {
    var header = "<h1 class='first'>" + this.current_title() + "</h1>\n";
    if (this.exercise().sections) {
       header += "<div class='section_links'>" + this.section_links() + "</div>\n";
    }
    $('instructions').update(header + this.current_body());
    $('exercise_number').update(this.current_exercise_index);
  },
  
  link: function(ex) {
    return('<a href="javascript:Exercise.set(#{ex_num});Modalbox.hide();">#{label}</a>'.interpolate({"ex_num":ex, label:this.list[ex].title}));
  },

  section_links: function() {
    var length = this.exercise().sections.length;
    var html = [];
    for (var i=0; i<length; i++) {
      var a_class = (this.exercise().sections && i == this.current_section_index) ? 'active' : '';
      html.push('<a class="#{class}" href="javascript:Exercise.set(#{exercise_num}, #{section_num});">#{i}</a>'.interpolate({"class":a_class, "exercise_num":this.current_exercise_index, "section_num":i, "i":i}));
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

  storage_id: function(exercise, section) {
    if (this.exercise(exercise).sections) {
      return(this.exercise(exercise).name + ' ' + this.section(section, exercise).name);
    } else {
      return(this.exercise(exercise).name);
    }
  },

  local_save_state: function() {
    localStorage.setItem('current-exercise', this.current_exercise_index);
    localStorage.setItem('current-section', this.current_section_index);
  },
  
  local_load_state: function() {
    this.current_exercise_index = parseInt(localStorage.getItem('current-exercise')) || 0;
    this.current_section_index = parseInt(localStorage.getItem('current-section')) || 0;
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
    var code = localStorage.getItem('code-'+id) || "";
    if (code.trim() == "") {
      if (this.section().copy) {
        // copy from prior section
        id = this.storage_id(this.current_exercise_index, this.current_section_index-1);
        code = localStorage.getItem('code-'+id);
      } else {
        code = "\n\n\n\n\n\n";
      }
    }
    editor.setValue(code);
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
        Exercise.init_finished();
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


//
// handles the loading of the exercises and the corresponding code workspace.
//
//

var markdown_converter = new Showdown.converter();

var Exercise = {
  current: null,
  list: [],
  
  init: function() {
    this.current = 0;
    this.load_code(this.current);
  },
  
  next: function() {
    var ex = this.current + 1;
    if (ex >= this.list.length) { ex = 1 }
    this.set(ex);
  },

  previous: function() {
    var ex = this.current - 1;
    if (ex < 1) { ex = this.list.length-1 }
    this.set(ex);
  },

  choose: function() {
    var html = "<ol>";
    for (var i=1; i< this.list.length; i++) {
      html += "<li>" + this.link(i) + "</li>";
    }
    html += "</ol>";
    Modalbox.show(html, {title:'Choose Exercise', transitions:false});
  },

  set: function(ex) {
    this.save_code(this.current);
    this.current = ex;
    var title = "<h1 class='first'><span>Exercise " + this.current + " </span> " + this.title(this.current) + "</h1>\n\n";
    $('instructions').update(title + this.body(this.current));
    this.load_code(this.current);
  },

  link: function(ex) {
    return('<a href="javascript:Exercise.set(#{ex_num});Modalbox.hide();">#{label}</a>'.interpolate({"ex_num":ex, label:this.title(ex)}));
  },

  body: function(ex) {
    return(this.list[ex].body);
  },

  title: function(ex) {
    return(this.list[ex].title);
  },

  save_code: function(exercise_id, code) {
    localStorage.setItem('code-'+exercise_id, code || editor.getValue());
    localStorage.setItem('code-modified-at-'+exercise_id, new Date().getTime());
  },

  load_code: function(exercise_id) {
    editor.setValue(localStorage.getItem('code-'+exercise_id) || "\n\n\n\n\n\n");
  },

  get_code_timestamp: function(exercise_id) {
    return localStorage.getItem('code-modified-at-'+exercise_id);
  },
  
  remote_save_code: function() {
    var exercise_id = this.current;
    var path = '/files'
    new Ajax.Request(path, {
      method:'post',
      parameters: {
        exercise_id: exercise_id,
        user_id: User.current,
        content: editor.getValue()
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
    var exercise_id = this.current;
    new Ajax.Request(path, {
      method:'get',
      parameters: {
        exercise_id: exercise_id,
        user_id: User.current,
        timestamp: this.get_code_timestamp(exercise_id)
      },
      onSuccess: function(transport) {
        console.log('success');
        console.log(transport.responseText);
        console.log(Exercise.current);
        console.log(exercise_id);
        if (Exercise.current == exercise_id) {
          Exercise.save_code(exercise_id, transport.responseText);
        }
      },
      onComplete: function() {
        if (Exercise.current == exercise_id) {
          Exercise.load_code(exercise_id);
        }
        $('load_button').setAttribute('class', 'icon rotate');
      },
      onLoading: function () {
        $('load_button').setAttribute('class', 'icon spinner');
      }
    });
  },
  
  define: function(arry) {
    var j = this.list.length+1;  // we start indexing at 1
    for (var i=0; i<arry.length; i++) {
      this.load_via_ajax(j++, arry[i][0], arry[i][1]);
    }
  },

  load_via_ajax: function(id, title, filename) {
    var path = '/exercises/'+filename+'.txt';
    new Ajax.Request(path, {
      method:'get',
      onSuccess: function(transport) {
        console.log('loaded ' + path);
        Exercise.add(id, title, transport.responseText);
      },
      onFailure: function(){ alert('Something went wrong, could not load exercise.') }
    });
  },

  add: function(id, title, text) {
    // convert text to html
    var html = markdown_converter.makeHtml(text);
    this.list[id] = {'title':title, 'body':html};
  },

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


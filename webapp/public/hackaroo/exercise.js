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
    this.load_code();
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
    this.save_code();
    this.current = ex;
    $('instructions').update(this.body(this.current));
    $('exercise_number').update( "Exercise " + this.current + " &mdash; " + this.title(this.current)); 
    this.load_code();
  },

  link: function(ex) {
    return('<a href="javascript:Exercise.set(#{ex_num});Modalbox.hide();">#{label}</a>'.interpolate({"ex_num":ex, label:this.title(ex)}));
  },

  body: function(ex) {
    // convert the function into a string.
    //var code_str = new String(this.list[ex].body);
    // clean up
    //code_str = code_str.replace('function () {','').replace(/\}$/,'').replace(/    /g,'').replace(/(^\n|\n  $)/g, "");
    //return(code_str);
    return(this.list[ex].body);
  },

  title: function(ex) {
    return(this.list[ex].title);
  },

  save_code: function() {
    localStorage.setItem('code-'+this.current, editor.getValue());
  },

  load_code: function() {
    editor.setValue(localStorage.getItem('code-'+this.current) || "\n\n\n\n\n\n");
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
  }
  
}


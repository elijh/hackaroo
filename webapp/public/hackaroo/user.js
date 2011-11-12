//
// handles client-side code for managing the user account
//
//

var User = {
  current: null,
  
  init: function() {
    this.current = this.load();
    if (this.current == null) {
      this.choose();
    } else {
      this.set(this.current);
    }
  },
  
  choose: function() {
    var html = [
      "Login or create a new username:<br/>",
      "<form action='' method='post' onsubmit='return User.login()'>",        
      "<input id='username_login_input' onkeyup='User.allowed_username_char(this)'></input><br/><br/>",
      "<input type='submit' value='Login'></input>"
    ]
    Modalbox.show(html.join(''), {title:'Login', transitions:false,
      overlayClose:false, closeValue:""});
  },

  // what happens when login form is submitted
  login: function() {
    this.set($('username_login_input').value);
    Modalbox.hide();
    return false; // stop events
  },

  logout: function() {
    localStorage.removeItem('username');
    window.location.href = '/';
  },

  set: function(user) {
    this.current = user;
    localStorage.setItem('username', user);
    var path = '/user/' + user;
    if (window.location.pathname != path) {
      window.location.href = path;
    } 
  },
  
  load: function() {
    return localStorage.getItem('username');
  },

  allowed_username_char: function(element) {
    element.value = element.value.toLowerCase().replace( /[^a-z0-9]/g , '_');
  },
}


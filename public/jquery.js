

  var url = window.location;

  // Will only work if string in href matches with location
  $('ul.nav a[href="'+ url +'"]').parent().addClass('active');

  // Will also work for relative and absolute hrefs
  $('ul.nav a').filter(function() {
      return this.href == url;
  }).parent().addClass('active');
  $("#hide-show-button").click(function(){
    $(".nav").toggle();
  });

  !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],
  p=/^http:/.test(d.location)?'http':'https';
  if(!d.getElementById(id)){js=d.createElement(s);js.id=id;
  js.src=p+"://platform.twitter.com/widgets.js";
  fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");

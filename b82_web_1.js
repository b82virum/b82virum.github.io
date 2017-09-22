// See README file.
// b82uid() will return a uniq id
var b82uid = (function(){var id=0;return function(){if(arguments[0]===0)id=0;return id++;}})();
function check_slideshow() {
$('.picasafeed').replaceWith(function() {
  var args = $(this).html().split(' ');
  var feed = args[0];
  var html = '';
  var id = 'slideshow' + b82uid();
  
  html += '<div class="slideshow" id="' + id + '">Slideshow loading ...</div>';
  html += '<div class="picasafetch">' + id + ' ' + feed + '</div>';
  return html;
});
$('.picasafetch').replaceWith(function() {
  var args = $(this).html().split(' ');
  var id = args[0];
  var feed = args[1].split('?')[0];
  
  $.ajax({
    url: feed + '?kind=photo&&alt=json-in-script&&callback=?',
    type: 'get',
    dataType: 'jsonp'})
    .done(function(data) {
      
      var showid = id+b82uid();
      var showbgn = '<div id="' + showid + '" class="fotorama" data-width="100%" data-ratio="4/3" data-allowfullscreen="native" data-transition="crossfade" data-loop="true" data-autoplay="3000" data-arrows="true" data-click="true" data-swipe="true" data-nav="thumbs">';
      var showend = '</div>';
      var photobgn = '<a href="';
      var photoend = '"></a>';
      var html = '';
      var i;
      html += showbgn;
      for (var i = 0; i < data.feed.entry.length; i++) {
        html += photobgn;
        html += data.feed.entry[i].media$group.media$content[0].url;
        html += photoend;
      }
      html += showend;
      $('#'+id).html(html);
      $('#'+showid).fotorama();
    })
  ;
  return '';
});
}
$(document).ready(function () {
  check_slideshow();
});
function show_html(div,html) {
  var n = b82uid();
  $('#'+div).append('<div id="' + div+n + '"></div>');
  div += n;
  $.ajax()
    // .done(function()   { alert("success");  })
    // .fail(function()   { alert("error");    })
    // .always(function() { alert("complete"); })
    .always(function() { $('#'+div).append(html); })
  ;
  
}
function blog_feed(labels,max) {
  var dmax = 255;
  var r = '';
  r = r + 'http://blog.b82.dk/feeds/posts/default';
  if (labels != '') {
    r = r + '/-/' + labels;
  }
  if (max != '') {
    dmax = max;
  }
  r = r + '?alt=json-in-script&max-results=' + dmax + '&callback=?';
  return r;
  // http://blog.b82.dk/feeds/posts/default?alt=json-in-script&max-results=255&callback=?
  // http://blog.b82.dk/feeds/posts/default/-/label1?alt=json-in-script&max-results=255&callback=?
  // http://blog.b82.dk/feeds/posts/default/-/label1/label2?alt=json-in-script&max-results=255&callback=?
}
function show_blog_feed(div,labels,max,random,header,show_title,show_content,show_vcard) {
  var n = b82uid();
  $('#'+div).append('<div id="' + div+n + '"></div>');
  div += n;
  $.ajax({
    url: blog_feed(labels,max),
    type: 'get',
    dataType: 'jsonp'})
    .done(function(data) {
      
      // First/last post
      var fi = 0;
      var li = data.feed.entry.length;
      
      // If random
      if (random) {
        if (fi < li) {
          fi = Math.floor((Math.random()*1000)) % li;
          li = fi+1;
        }
      }
      
      // If any, show header, if any
      if (fi < li) {
        if (header != '') {
          $('#'+div).append('<h2>' + header + '</h2>');
        }  
      }
      
      for (var i = fi; i < li; i++) {
        
        var html;
        
        // href
        var href = '';
        for (var j=0; j < data.feed.entry[i].link.length; j++) {
          if (data.feed.entry[i].link[j].rel == 'alternate') {
            href = data.feed.entry[i].link[j].href;
            break;
          }
        }
        
        // title
        var title = data.feed.entry[i].title.$t;
        // content
        var content = '';
        if ('content' in data.feed.entry[i]) {
          content = data.feed.entry[i].content.$t;
        } else if ('summary' in data.feed.entry[i]) {
          content = data.feed.entry[i].summary.$t;
        }
        
        html = '<div style="page-break-inside:avoid;">';
        
        // title+link
        if (show_title == 1) {
          html += '<a href="' + href + '">' + '<h3>' + title + '</h3>' + '</a>';
        }
        // content
        if (show_content == 1) {
        
          // vcard +++ bruges dette?
          if (show_vcard == 1) {
          
            var vcard;
            var name;
            var tel;
            var email;
            var n;
            
            name = title;
            n = name.lastIndexOf(' ');
            if (n != -1) {
              name = name.slice(n+1) + ';' + name.slice(0,n);
            }
            
            tel = '';
            n = content.indexOf('tel:');
            if (n != -1) {
              tel = content.slice(n+4,content.indexOf('"',n));
            }
            
            email = '';
            n = content.indexOf('mailto:');
            if (n != -1) {
              email = content.slice(n+7,content.indexOf('"',n));
            }
            
            vcard = '';
            
            vcard += '<img src="http://api.qrserver.com/v1/create-qr-code/?data=BEGIN%3AVCARD%0A';
            
            vcard += 'N%3A' + name + '%0A';
            
            vcard += 'ORG%3AB82%0A';
            
            if (tel != '') {
              vcard += 'TEL%3A' + tel + '%0A';
            }
            
            if (email != '') {
              vcard += 'EMAIL%3A' + email + '%0A';
            }
            
            vcard += 'END%3AVCARD%0A&size=200x200&qzone=1"/>';
            
            n = content.indexOf('<img ');
            if (n != -1) {
              n = content.indexOf('>',n);
              if (n != -1) {
                n++;
                content = content.slice(0,n) + vcard + content.slice(n);
              }
            }
            
          }
          
          html += '<p>' + content + '</p>';
        }  
        html += '</div>';
        $('#'+div).append(html);
        // Change <p class="mobile-photo" with <div class="mobile-photo"
        // This is to center mobile photos (the style seems not to work with <p
        $('p.mobile-photo').replaceWith(function() {
          return '<div class="mobile-photo">' + $(this).html() + '</div>';
        });
        
        check_slideshow();
        
      }
    })
  ;
}
function show_contact(div,labels,header) {
  
  show_blog_feed(div,labels,'','',header,1,1,1);
}
function show_post(div,labels,header) {
  
  show_blog_feed(div,labels,'','',header,1,1,'');
}
function show_latest_post(div,labels,header) {
  
  show_blog_feed(div,labels,1,'',header,1,1,'');
}
function show_some_post(div,labels,header) {
  
  show_blog_feed(div,labels,5,'',header,1,1,'');
}
function show_body(div,labels) {
  
  show_blog_feed(div,labels,'','','',0,1,'');
}
function show_random(div,labels) {
  
  show_blog_feed(div,labels,'',1,'',0,1,'');
}
function show_contacts(div,team,header) {
  var n = b82uid();
  $('#'+div).append('<div id="' + div+n + '"></div>');
  div += n;
  $('#'+div).html('<p><mark>Hvis du ser denne tekst, så log ind og/eller ud på <a href="http://www.google.com">Google</a>! (fejl hos Google)</mark></p>');
  $.ajax({
    url: 'https://spreadsheets.google.com/feeds/list/0Akm30OX8lPv2dEdfOTFvbnZpdDlJb1VrLTdPMW1QZ0E/4/public/values?alt=json-in-script&callback=?',
    type: 'get',
    dataType: 'jsonp'})
    .done(function(data) {
      $('#'+div).html('<h2>' + header + '</h2>');
      var html;
      var len = data.feed.entry.length;
      var imgdiv;
      var a;
      var fmail='';
      var ftel='';
      var brsep;
      for (var i=0; i<len; i++) {
      
        if (data.feed.entry[i].gsx$team.$t != team) {
          continue;
        }
        html = '<div style="page-break-inside:avoid;"><p><div style="text-align: center;">';
        html += '<br/><span style="font-size: large;">' +
                data.feed.entry[i].gsx$name.$t +
                ' - ' +
                data.feed.entry[i].gsx$title.$t +
          '</span><br/>';
        brsep='';
        if (data.feed.entry[i].gsx$mails.$t != '') {
          brsep='<br/>';
          html += 'mail: ';
          sep = '';
          a=data.feed.entry[i].gsx$mails.$t.split(',');
          fmail = a[0];
          for (var j=0;j<a.length;j++) {
            html += sep +
              '<a href="mailto:' + a[j] + '">' + a[j] + '</a>' +
                    '';
            sep = ' / ';
          }
          html += '. ';
        }        
        if (data.feed.entry[i].gsx$phones.$t != '') {
          brsep='<br/>';
          html += 'tlf: ';
          sep = '';
          a=data.feed.entry[i].gsx$phones.$t.split(',');
          ftel = a[0];
          for (var j=0;j<a.length;j++) {
            html += sep +
                    '<a href="tel:' + a[j] + '">' + a[j] + '</a>' +
                    '';
            sep = ' / ';
          }
          html += '. ';
        } 
        if (data.feed.entry[i].gsx$note.$t != '') {
          html += brsep;      
          html += data.feed.entry[i].gsx$note.$t;
        }        
        html += '<br/><img style="width: 200px; height:200;" src="' + data.feed.entry[i].gsx$photo.$t + 'media/?size=l"/>';
        var vcard = '';
            
        vcard += '<img src="http://api.qrserver.com/v1/create-qr-code/?data=BEGIN%3AVCARD%0A';
            
        vcard += 'N%3A' + data.feed.entry[i].gsx$name.$t + '%0A';
            
        vcard += 'ORG%3AB82%0A';
            
        if (ftel != '') {
          vcard += 'TEL%3A' + ftel + '%0A';
        }
            
        if (fmail != '') {
          vcard += 'EMAIL%3A' + fmail + '%0A';
        }
            
        vcard += 'END%3AVCARD%0A&size=200x200&qzone=1"/>';
        html += vcard;
        html += '</div></p></div>';
        
        $('#'+div).append(html);
      }
    })
  ;
}
function page_start(div) {
  var ndiv;
  $('#'+div).append(''
    + '<style type="text/css">'
    + '.blogger-post-footer {'
    + '  visibility: hidden;'
    + '}'
    + '#searchform {display:none !important;}'
    + 'h1, h2, h3 {'
    + '  text-align: center;'
    + '}'
    + 'h1, h2, a {'
    + '  color: red;'
    + '}'
    + 'h3, h4, h5, h6 {'
    + '  color: black;'
    + '}'
    + '.mobile-photo {'
    + '  text-align: center;'
    + '}'
    + '#header {display:none !important;}'
    + '@media print'
    + '{'
    + '.noprint, #slideshow-wrapper, #menu-wrapper, #copyright {display:none !important;}'
    + '#main {border-style:none !important;}'
    + '}'
    + '@media screen'
    + '{'
    + '.noweb {display:none !important;}'
    + '}'
    + 'img {height: auto; max-height: auto; width: auto; max-width: 100%; padding: 0 !important; border-style: none !important;}'
    + '</style>'
  );
  ndiv=div+'header';
  $('#'+div).append('<div id="' + ndiv + '" class="noprint"></div>');
  show_body(ndiv,'B82 Header');
  
}
function page_end(div) {
  var ndiv;
  $('#'+div).append('<div class="noprint"><p><div style="text-align: center;"><a href="http://www.sportyfied.com/to/vm59e9" target="_blank"><img alt="Sportyfied" border="0" height="160" src="http://www.sportyfied.com/simg/vm59e9.jpg" style="border-style:none; padding:0;" title="B82 webshop" width="920" /></a></div></p></div>');
  ndiv=div+'footer';
  $('#'+div).append('<div id="' + ndiv + '" class="noprint"></div>');
  show_body(ndiv,'B82 Footer');
}
function show_payments(div,label) {
  var n = b82uid();
  $('#'+div).append('<div id="' + div+n + '"></div>');
  div += n;
  $('#'+div).html('<p><mark>Hvis du ser denne tekst, så log ind og/eller ud på <a href="http://www.google.com">Google</a>! (fejl hos Google)</mark></p>');
  
  $.ajax({
    url: 'https://spreadsheets.google.com/feeds/list/0Akm30OX8lPv2dEdfOTFvbnZpdDlJb1VrLTdPMW1QZ0E/2/public/values?alt=json-in-script&callback=?',
    type: 'get',
    dataType: 'jsonp'})
    .done(function(data) {
      
      var html = '';
      var len = data.feed.entry.length;
      html += '<p><table align="center" border="0"><tbody><tr><td><table border="1" bordercolor="red"><tbody>';
      html += '<tr>';
      html += '<th>' +
              'Sæson' +
              '</th>';
      html += '<th>' +
              'Forfald' +
              '</th>';
      html += '<th>' +
              'Beløb' +
              '</th>';
      if (label == '') {
        html += '<th>' +
                'Hold' +
                '</th>';
      }
      html += '</tr>';
      for (var i=0; i<len; i++) {
        if (label != '') {
          if (data.feed.entry[i].gsx$team.$t != label) {
            continue;
          }
        }
        html += '<tr>';
        html += '<td>' +
                data.feed.entry[i].gsx$season.$t +
                '</td>';
        html += '<td>' +
                data.feed.entry[i].gsx$due.$t +
                '</td>';
        html += '<td><div style="text-align: right;">' +
                data.feed.entry[i].gsx$price.$t +
                '</div></td>';
        if (label == '') {
          html += '<td>' +
                  data.feed.entry[i].gsx$team.$t +
                  '</td>';
        }
        html += '</tr>';
      }
      html += '</tbody></table></td></tr></tbody></table></p>';
      $('#'+div).html(html);
    })
  ;
}
function show_times(div,label) {
  var n = b82uid();
  $('#'+div).append('<div id="' + div+n + '"></div>');
  div += n;
  $('#'+div).html('<p><mark>Hvis du ser denne tekst, så log ind og/eller ud på <a href="http://www.google.com">Google</a>! (fejl hos Google)</mark></p>');
      
  $.ajax({
    url: 'https://spreadsheets.google.com/feeds/list/0Akm30OX8lPv2dEdfOTFvbnZpdDlJb1VrLTdPMW1QZ0E/3/public/values?alt=json-in-script&callback=?',
    type: 'get',
    dataType: 'jsonp'})
    .done(function(data) {
      
      var html = '';
      var len = data.feed.entry.length;
      var last_season='';
      var last_day='';
      html += '<p><table align="center" border="0"><tbody><tr><td><table border="1" bordercolor="red"><tbody>';
      for (var i=0; i<len; i++) {
        if (label != '') {
          if (data.feed.entry[i].gsx$team.$t != label) {
            continue;
          }
        }
        if (data.feed.entry[i].gsx$season.$t != last_season) {
          if (label == '') {
            html +=
              '<tr><th colspan="4">' +
              '<div style="text-align: center;">' +
              data.feed.entry[i].gsx$season.$t +
              '</div>' +
              '</th></tr>'
            ;
          }
          else {
            html +=
              '<tr><th colspan="3">' +
              '<div style="text-align: center;">' +
              data.feed.entry[i].gsx$season.$t +
              '</div>' +
              '</th></tr>'
            ;
          }
          last_season=data.feed.entry[i].gsx$season.$t;
          last_day='';
          html += '<tr>';
          html +=
            '<th>' +
            'Dag' +
            '</th>'
          ;
          html +=
            '<th>' +
            'Tid' +
            '</th>'
          ;
          html +=
            '<th>' +
            'Sted' +
            '</th>'
          ;
          if (label == '') {
            html +=
              '<th>' +
              'Hold' +
              '</th>'
            ;
          }
          html += '</tr>';
        }
        html += '<tr>';
        if (data.feed.entry[i].gsx$day.$t != last_day) {
          html +=
            '<th>' +
            data.feed.entry[i].gsx$day.$t +
            '</th>'
          ;
          last_day=data.feed.entry[i].gsx$day.$t;
        }
        else {
          html +=
            '<td>' +
            '</td>'
          ;
        }
        html +=
          '<td>' +
          data.feed.entry[i].gsx$time.$t +
          '</td>'
        ;
        html +=
          '<td>' +
          data.feed.entry[i].gsx$place.$t +
          '</td>'
        ;
        if (label == '') {
          html +=
            '<td>' +
            data.feed.entry[i].gsx$team.$t +
            '</td>'
          ;
        }
        html += '</tr>';
      }
      html += '</tbody></table></td></tr></tbody></table></p>';
      $('#'+div).html(html);
      
    })
    
  ;
}
function show_faq(div) {
  var n = b82uid();
  $('#'+div).append('<div id="' + div+n + '"></div>');
  div += n;
  $('#'+div).html('<p><mark>Hvis du ser denne tekst, så log ind og/eller ud på <a href="http://www.google.com">Google</a>! (fejl hos Google)</mark></p>');
      
  $.ajax({
    url: 'https://spreadsheets.google.com/feeds/list/0Akm30OX8lPv2dEdfOTFvbnZpdDlJb1VrLTdPMW1QZ0E/6/public/values?alt=json-in-script&callback=?',
    type: 'get',
    dataType: 'jsonp'})
    .done(function(data) {
      
      var html = '';
      var len = data.feed.entry.length;
      for (var i=0; i<len; i++) {
            html +=
              '<h2>' +
              data.feed.entry[i].gsx$question.$t +
              '</h2>'
            ;
            html +=
              '<p style="text-align:center;">' +
              data.feed.entry[i].gsx$answer.$t +
              '</p>'
            ;
      }
      $('#'+div).html(html);
      
    })
    
  ;
}
function show_flyer(div) {
  var n = b82uid();
  $('#'+div).append('<div id="' + div+n + '"></div>');
  div += n;
  $('#'+div).html('<p><mark>Hvis du ser denne tekst, så log ind og/eller ud på <a href="http://www.google.com">Google</a>! (fejl hos Google)</mark></p>');
      
  $.ajax({
    url: 'https://spreadsheets.google.com/feeds/list/0Akm30OX8lPv2dEdfOTFvbnZpdDlJb1VrLTdPMW1QZ0E/7/public/values?alt=json-in-script&callback=?',
    type: 'get',
    dataType: 'jsonp'})
    .done(function(data) {
      
      var addr = 'http://www.b82.dk/?id=656&c=Flyer';
      var hash = window.location.hash.substr(1);
      var html = '';
      var len = data.feed.entry.length;
      /*
      html +=
        '38<br/>'
      ;
      */
      if (hash == '') {
        html+='<div style="text-align:center;">';
        for (var i=0; i<len; i++) {
            if (data.feed.entry[i].gsx$active.$t != '1') {
              continue;
            }
            if (data.feed.entry[i].gsx$type.$t == 'title') {   
              html +=
                '<a href="' +
                addr + '&flyer=' + data.feed.entry[i].gsx$flyer.$t +
                '#' +
                data.feed.entry[i].gsx$flyer.$t +
                '"><h1>'+data.feed.entry[i].gsx$value.$t+'</h1></a><br/>'
              ;
            }
        }
        html+='</div>';
      }
      else {
        
        html+='<div style="width:100%;">';
        for (var area=1; area<5; area++) {
          
        if (area == 1) {
          html+='<div style="width:100%; float:left;">';
        }
        if (area == 2) {
          html+='<div style="width:75%; float:left;">';
        }
        if (area == 3) {
          html+='<div style="width:25%; float:left;">';
        }
        if (area == 4) {
          html+='<div style="width:100%; float:left;">';
        }
      
        for (var i=0; i<len; i++) {
              if (data.feed.entry[i].gsx$active.$t != '1') {
                continue;
              }
              if (data.feed.entry[i].gsx$flyer.$t != hash) {
                continue;
              }
                  
              if (data.feed.entry[i].gsx$area.$t != area) {
                continue;
              }
                  
              html +=
                '<div class="' + data.feed.entry[i].gsx$class.$t + '" style="float:left; ' +
                'width:' + data.feed.entry[i].gsx$width.$t + '; ' +
                'text-align:' + data.feed.entry[i].gsx$align.$t + '; ' +
                '">'
              ;
              html +=
                '<div style="padding-left:1%; padding-right:1%;">'
              ;
          
              if (data.feed.entry[i].gsx$type.$t == 'title') {
              }
              else
              if (data.feed.entry[i].gsx$type.$t == 'qr') {
                if (data.feed.entry[i].gsx$value.$t == '') {
                  html +=
                    '<p><img border="0" style="background-color:white; border-width:0; border-style:none; width:100%;" src="http://api.qrserver.com/v1/create-qr-code/?data='+
                      escape(addr +
                             '&flyer=' + data.feed.entry[i].gsx$flyer.$t +
                             '#' +
                             data.feed.entry[i].gsx$flyer.$t
                            )+'&size=250x250"/></p>'
                  ;
                }
                else {
                  html +=
                    '<p><img border="0" style="background-color:white; border-width:0; border-style:none; width:100%;" src="http://api.qrserver.com/v1/create-qr-code/?data='+
                      escape(data.feed.entry[i].gsx$value.$t)+'&size=250x250"/></p>'
                  ;
                }
              }
              else
              if (data.feed.entry[i].gsx$type.$t == 'instagram') {
                html +=
                  '<p><img border="0" style="background-color:white; border-width:0; border-style:none; width:100%;" src="'+data.feed.entry[i].gsx$value.$t+'media?size=l"/></p>' 
                ;
              }
              else
              if (data.feed.entry[i].gsx$type.$t == 'img') {
                html +=
                  '<p><img border="0" style="background-color:white; border-width:0; border-style:none; width:100%;" src="'+data.feed.entry[i].gsx$value.$t+'"/></p>' 
                ;
              }
              else {
                html +=
                  '<'+data.feed.entry[i].gsx$type.$t+'>' +
                  data.feed.entry[i].gsx$value.$t +
                  '</'+data.feed.entry[i].gsx$type.$t+'>' 
                ;
              }
              html +=
                '</div>'
              ;
              html +=
                '</div>'
              ;
        }
        html+='</div>';
          
        }
        html+='</div>';
        
      }
      $('#'+div).html(html);
      
    })
    
  ;
}
function show_join(div,label) {
  var html = '';
  html += '<h2>Indmeld</h2>';
  html += '<p><div style="text-align:center;"><b>Aftal med din træner/holdleder hvornår du skal melde dig ind.</b></div></p>';
  html += '<p><div style="text-align:center;">';
  html += 'Se <a href="http://www.b82.dk/?id=259&c=Indmeld">Indmeld siden</a> for hjælp og vejledning.';
  html += '</div></p>';
  $('#'+div).append(html);
  var n = b82uid();
  $('#'+div).append('<div id="' + div+n + '"></div>');
  div += n;
  $('#'+div).html('<p><mark>Hvis du ser denne tekst, så log ind og/eller ud på <a href="http://www.google.com">Google</a>! (fejl hos Google)</mark></p>');
      
  $.ajax({
    url: 'https://spreadsheets.google.com/feeds/list/0Akm30OX8lPv2dEdfOTFvbnZpdDlJb1VrLTdPMW1QZ0E/5/public/values?alt=json-in-script&callback=?',
    type: 'get',
    dataType: 'jsonp'})
    .done(function(data) {
      
      var html = '';
      var len = data.feed.entry.length;
      for (var i=0; i<len; i++) {
        if (data.feed.entry[i].gsx$team.$t != label) {
          continue;
        }
        if (data.feed.entry[i].gsx$admin.$t == 'dbu') {
          var deptid=data.feed.entry[i].gsx$deptid.$t;
          html += '<p><div style="text-align:center;">';
          html += 'På dette hold bruger vi <b>kluboffice</b> til medlemsregistrering og kontingentopkrævning. ';
          html += '</div></p>';
          html += '<h3><a href="http://kluboffice2.dbu.dk/Public/SubscribeToClub/SubscribeInClub.aspx?clubid=1312&id='+deptid+'">Klik her for at tilmelde dig</a></h3><p></p>';
          //html += '<h3>VENT MED AT TILMELDE DIG, VI ER IKKE HELT KLAR MED KLUBOFFICE</h3><p></p>';
        }
        else {
          html += '<p><div style="text-align:center;">';
          html += 'På dette hold bruger vi <b>holdsport</b> til medlemsregistrering og kontingentopkrævning. ';
          html += '</div></p>';
          html += '<h3><a href="http://www.holdsport.dk/klub/b82virum">Klik her for at tilmelde dig</a></h3><p></p>';
        }
        break;
        
      }
      $('#'+div).html(html);
      
    })
    
  ;
}
function show_team(div,label,alias) {
  var ndiv;
  
  $('#'+div).append('<h1>' + alias + '</h1>');
  show_body(div,label+' Intro');
  ndiv=div+'sponsor';
  $('#'+div).append('<div id="' + ndiv + '" class="noprint"></div>');
  show_random(ndiv,label+' Sponsor');
  $('#'+div).append('<h2>Træningstider</h2>');
  show_times(div,label);
  
  ndiv=div+'payment';
  $('#'+div).append('<div id="' + ndiv + '" class="noprint"></div>');
  $('#'+ndiv).append('<h2>Kontingent</h2>');
  show_payments(ndiv,label);
  ndiv=div+'join';
  $('#'+div).append('<div id="' + ndiv + '" class="noprint" style="background-color:lightgrey;"></div>');
  show_join(ndiv,label);
  show_contacts(div,label,'Kontakt');
  ndiv=div+'hilite';
  $('#'+div).append('<div id="' + ndiv + '" class="noprint"></div>');
  show_post(ndiv,label+' Glimt','Glimt');
  ndiv=div+'extra';
  $('#'+div).append('<div id="' + ndiv + '" class="noprint"></div>');
  show_body(ndiv,label+' Extra');
}


'use strict';

var $ = require('jquery');

var worker;

function initWorker() {
  alert()
	var blob = new Blob(
    [mrz_worker.toString().replace(/^function .+\{?|\}$/g, '')],
    { type:'text/javascript' }
  );
	var objectURL = URL.createObjectURL(blob);
	var worker = new Worker(objectURL);

  worker.addEventListener('error',function(e){
    console.log(e);
    $('html').html(['<pre>',e.message,' (',e.filename,':',e.lineno,':',e.colno,')</pre>'].join(''));
  },false);

  worker.addEventListener('message', function (e) {
    alert()
    var data = e.data;

    switch (data.type) {
      case 'progress':
        $('.progress-text').text(data.msg.substr(0, 1).toUpperCase() + data.msg.substr(1));
        break;

      case 'error':
        $('.progress').removeClass('visible');
        console.log(data);
        setTimeout(function () {
          window.alert(data.error);
        }, 100);
        break;

      case 'result':
        $('.progress').removeClass('visible');
        showResult(data.result);
        break;

      default:
        console.log(data);
        break;
    }
  }, false);

  var pathname=document.location.pathname.split('/');
  pathname.pop();
  pathname=pathname.join('/');

  worker.postMessage({
    cmd: 'config',
    config: {
      fsRootUrl: document.location.origin+pathname
    }
  });

  return worker;
}

$(document).ready(function () {
  alert()
  try {
    worker = initWorker();
  } catch (err) {
    $('html').text(err.message);
  }
  $('#photo').on('change', function (e) {
    $('#detected, #parsed').empty();
//    $('#image').attr('src', '');
    var reader = new FileReader();
    reader.onload = function (e) {
//      $('#image').attr('src', e.target.result);
      $('.progress').addClass('visible');
      $('.progress-text').text('Processing...');
      worker.postMessage({
        cmd: 'process',
        image: e.target.result
      });
    };
    if (e.target.files.length) {
      reader.readAsDataURL(e.target.files[0]);
    }
  });
});


function showResult(result) {
  var html;
  var info;

  function escape(t) {
    return t.replace(/</g, '&lt;');
  }

  if (result.parsed && result.parsed.modified) {
    info = result.parsed.modified;
  } else if (result.ocrized) {
    info = result.ocrized;
  } else {
    info = [];
  }
  info = info.join('\n');

  if (result.error) {
    html = [
      '<div class="error">',
      escape(result.error),
      '</div>',
      '<pre>',
      escape(info),
      '</pre>'
    ];
  } else {
    if (result.parsed.valid) {
      
      html = [
        '<pre>',
        escape(JSON.stringify(result.parsed.fields, false, 4)),
        '</pre>',
        '<pre>',
        escape(info),
        '</pre>'
      ];
    } else {
      if (result.parsed.details) {
        alert()
        var details = [];
        result.parsed.details.forEach(function (d) {
          if (!d.valid) {
            details.push(d);
          }
        });
        info = [
          info,
          '',
          JSON.parse(details, false, 4),
        ].join('\n');
      }
      html = [
        '<pre>',
        'Could not parse ocrized text:',
        '<pre>',
        '</pre>',
        escape(info),
        '</pre>'
      ];
    }
  }
  console.log(html)
  alert()
  $('#parsed').html(html.join('\n'));
  showImages(['painted']/*result.images*/);
}

function showImages(images, callback, index) {
  if (!index) index = 0;

  if (index >= images.length) {
    if (callback) callback()
    return;
  }

  var random = Math.random();
  worker.addEventListener('message', function showImage(e) {
    var data = e.data;
    if (data.type == 'image' && data.random == random) {
      worker.removeEventListener('message', showImage);
      var imageData = new ImageData(data.rgba, data.width, data.height);
      var canvas = document.createElement('canvas');
      canvas.width = data.width;
      canvas.height = data.height;
      var ctx = canvas.getContext('2d');
      ctx.putImageData(imageData, 0, 0);
      $(canvas).attr('title', data.name);
      $('#detected').append(canvas);
      setTimeout(function () {
        showImages(images, callback, index + 1);
      });
    }
  }, false);

  worker.postMessage({
    cmd: 'get-image',
    image: images[index],
    random: random
  });
}

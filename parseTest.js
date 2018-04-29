var cheerio = require('cheerio');
var request = require('request');

var url = 'https://github.com/jongkk7/HtmlTest/commit/0599c121eda5e94e64c1b8120f934c6e312bdb0c';
request(url, function(error, response, html){
    if (error) {throw error};

    var $ = cheerio.load(html);
    var codelist = new Array();

    var list = $('tbody').children('tr');
    for(var i = 0; i < list.length ; i++){
      var additionText = $(list[i]).find('td.blob-code-addition').find('span.blob-code-inner').text();
      var deletionText = $(list[i]).find('td.blob-code-deletion').find('span.blob-code-inner').text();

      if(additionText.length > 2){
        codelist.push(additionText);
      }
      if(deletionText.length > 2){
        codelist.push(deletionText);
      }
    }

    var message = "";
    for(var i=0 ; i<codelist.length ; i++){
      var text = codelist[i] + "\n";
      message += text;
    }
    console.log(message);



});

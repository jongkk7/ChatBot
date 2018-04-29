// 페이지 파싱을 위한 준비
var cheerio = require('cheerio');
var request = require('request');

// 슬랙 연결을 위한 준비
var RtmClient = require('@slack/client').RtmClient;
var token = 'xoxb-248690342179-F2fcP8ytYZkYqWqclpTWR9x4';

// 슬랙에 보낼 메세지 형식을 위해 추가
var Slack = require('node-slack');
var hook_url = "https://hooks.slack.com/services/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";
var slack = new Slack(hook_url,"http_proxy");

// Real Time Message를 위한 준비 ( log level : error | debug ... )
var rtm = new RtmClient(token, {logLevel: 'error'});

//클라이언트 이벤트 모듈
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

//RTM.AUTHENTICATED 이벤트 받기
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
  console.log(`#### Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);

  slack.send({
    mrkdwn: true,
    text: '# gd',
    channel: 'C6YTMQXE0'
    });

});


var RTM_EVENTS = require('@slack/client').RTM_EVENTS;


/**
* 1. 메세지를 보낸 user가 bot일 경우
* 2. 메세지에 commit이 있을 경우
* 3. url을 가져와서 변경된 부분 저장
*/
rtm.on(RTM_EVENTS.MESSAGE, function (message) {
  console.log('message : ' + JSON.stringify(message));
  var data = "*bold* `code` `<https://github.com/jongkk7/HtmlTest/commit/aaf6f0a3e59b15d80c003fb16b8caee195504e59|aaf6f0a>`";
  var data = JSON.stringify(message);

  // 메세지에서 bot_id가 없으면 사용자가 보낸 메세지이다.
  var bot_index = data.indexOf('bot_id');
  if (bot_index == -1 ){
    console.log('사용자가 메세지를 보냈습니다. ');
    return;
  }

  // 메세지에 commit 유무
  var commit_index = data.indexOf('commit');
  if(commit_index == -1 ){
    console.log('not commit');
  }


  // message로부터 url 가져오기
  //url = getUrl(message);

  // url로 부터 바뀐부분의 소스코드 가져오기
  //var code = getCode(url, message);

});


function getUrl(message){
  var attachments = message.attachments;
  var url = attachments[0].text;

  var start = 2;
  var end = url.indexOf("|");
  url = url.substring(start, end);
  //console.log('url : ' + url);

  return url;
}


function getCode(url, message){
  request(url, function(error, response, html){
      if (error) {throw error};

      //console.log (html);

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

      console.log("code list : " + codelist);

      // slack으로 변경된 메세지를 보낸다.
      sendMessage(codelist, message);
  });
}


function sendMessage(code, message){
  var list = "";
  for(var i=0 ; i<code.length ; i++){
    var text = code[i] + "\n";
    list += text;
  }

  //rtm.sendMessage(list , message.channel);
  slack.send({
  	text: list,
  	channel: message.channel,
    mrkdwn: true,
  	username: 'Bot'
  });
}


rtm.start();

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){

  function sendFailed(){
    sendResponse({
      valid: false,
      count: false,
      reason: "exit"
    });
  }
  var text = "";
  if (window.getSelection) {
      text = window.getSelection().toString();
  } else if (document.selection && document.selection.type != "Control") {
      text = document.selection.createRange().text;
  }
  //text = text.trim();
  //text = "";
  //console.log(text);
  if (text.length === 0){
    sendResponse({valid: false, reason: "Noselection"});
  }else{

    //sendResponse({valid: "true"});
    //perform API call to TM dataservices
    var call = new XMLHttpRequest();
    var url = "https://www.trismegistos.org/dataservices/API/suggest/?searchterm="+text;
    call.open("GET", url, true);
    call.setRequestHeader("Content-type", "application/json");
    call.send();
    call.onload = function(e){
      if (call.readyState ===4){
        if (call.status === 200){
          var serverResponse = JSON.parse(call.responseText);
          var count = serverResponse["count"];
          var source = serverResponse["source"];
          var matches = serverResponse["matches"];
          if (count != 0){sendResponse({
            valid:true,
            history: text,
            count:count,
            source:source,
            matches:matches
          })}else{
            sendResponse({
              valid: false,
              history:text,
              count:0,
              reason: "NoMatch"
            })
          }
        }else{
          sendFailed();
        }
      }else{
        sendFailed();
      }
    }
  }
  return true;
})

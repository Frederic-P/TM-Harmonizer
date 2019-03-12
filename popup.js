document.addEventListener('DOMContentLoaded', function (){

  function InternalFunction(url){
  //  var url = "https://www.trismegistos.org/dataservices/API/suggest/?searchterm_narrowest_publ="++"&searchterm_narrowest_vol=";
    document.getElementById('searchedFor').innerHTML = "";
    document.getElementById('matchedAgainst').innerHTML = "";
    document.getElementById('searchedFor').innerHTML = "<p>Searching in TM publications</p>"
    var call = new XMLHttpRequest();
    call.open("GET", url, true);
    call.setRequestHeader("Content-type", "application/json");
    call.send();
    call.onload = function(e){
      if (call.readyState ===4){
        if (call.status === 200){
          var serverResponse = JSON.parse(call.responseText);
          var count = serverResponse['count'];
          document.getElementById('searchedFor').innerHTML +="<p>We have found"+count+" text(s) related to your search</p>";
          var source = serverResponse["source"];
          var matches = serverResponse["matches"];
          if (count != 0){
            var second_match_results = "<ul>";
            for (var x = 0; x < matches.length; x++){
              var uri = matches[x]["TM_ID"];
              var publisher = matches[x]["publisher"];
              second_match_results = second_match_results + "<li><a href ='https://www.trismegistos.org/text/"+uri+"' target='_blank'>TM "+uri+" - "+publisher+"</a></li>";
            }
            second_match_results = second_match_results+"</ul>";
            document.getElementById('matchedAgainst').innerHTML +=second_match_results;
          }else{
            document.getElementById('matchedAgainst').innerHTML +="<p>No publications found that match your query</p>"
          }
        }
      }
    }
  };

  function search(){
    chrome.tabs.query({currentWindow:true, active:true},
    function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, '', getTMname)  //callback to gettmname functie
    })
  };

  function getTMname(res) {
    if(res.valid){
      var count = res.count;
      var source = res.source;
      var matches = res.matches;
      var history = res.history;
      var matchdata = "<ul>";
      setHeader = true;
      for(var x = 0; x < matches.length; x++){
        if (source !="Publications"){
          var uri = matches[x]["TM_ID"];
          var publisher = matches[x]["publisher"];
          if (publisher){
            publisher = " - "+publisher ;
          }else{
            publisher = "";
          }
          matchdata = matchdata + "<li><a href ='https://www.trismegistos.org/text/"+uri+"' target='_blank'> &#128279; TM "+uri+publisher+"</a></li>";
        } else{
          if(matches[x]["TM_ID"]!=0){
            var uri = matches[x]["publisher"];
            matchdata = matchdata + "<li><a href='https://www.trismegistos.org/dataservices/API/suggest/index.php?searchterm_narrowest_publ="+uri+"&searchterm_narrowest_vol=' class='internal_processing'>"+uri+"</a></li>"
          }
        }
      }
      matchdata = matchdata + "</ul>";
    }else{
      if (res.reason ==="Noselection"){
        setHeader = false;
        matchdata = "To use the TM Harmonizer tool, select a reference to a papyrus text and come back to this extension.";
      } else if (res.reason === "NoMatch") {
        var history = res.history;
        matchdata = "Sorry, we couldn't find a TM URI that matches your selection.";
        setHeader = true;
        var count = "no";
      }else{
        setHeader = false;
        matchdata = "Oops, something went wrong.";
      }
    }
    const div = document.createElement("div");
    div.id = "UI";
    document.body.appendChild(div);
    if (setHeader){
      var header = document.getElementById('searchedFor');
      header.innerHTML = 'Your search for <b>'+history+'</b> returned <b>'+count+ '</b> matches'
    }
    var matchcontent = document.getElementById("matchedAgainst");
    matchcontent.innerHTML = matchdata;

    //add event listener to searchresults if the results come from publications
    //these results need to be re-searched based on wide match
    //new XMLHTTPRequest for these!
    if (source=="Publications"){
      var parseable = document.getElementsByClassName("internal_processing")
      for (var i = 0; i<parseable.length;i++){
        parseable[i].addEventListener('click',function(){ InternalFunction(this.href);}, false);
      }
    }
  };
  search();
},false)

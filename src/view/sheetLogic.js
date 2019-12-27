
sheetProj.view.sheetLogic = {
  setupUserInterface: function () {

    searchSystem.loadDropdowns();

    urlSystem.getURLVars();
    videoControl.resizePlayers();
    window.addEventListener('resize', videoControl.resizePlayers);
    // window.addEventListener('resize', iosRes.widthFix);
    $("#displaySelect").change(uiSystem.displayChange);
    $("#languageSelector").click(uiSystem.displayLanguages);
    $("#infoIcon").click(uiSystem.displayInfo);
    $("#logo").click(uiSystem.homeScreen);
    $("#searchButton").click(searchSystem.searchByButton);
    $("#videoMax").change(searchSystem.setMaxPlayers);




    }
};



let videoControl={
  getActivePlayers:()=>{
    videoPlayers.length=0;

    FB.Event.subscribe('xfbml.ready', function(msg) {
      if (msg.type === 'video') {
        let start= document.getElementById(msg.id).dataset.start;
        videoPlayers.push({player:msg.instance,
                          start:start,
                          solrID:`${msg.id.substr(6)}`});

      }
    });

  },
  playAll:()=>{
    if (searchSettings.firstPlay){
      searchSettings.firstPlay=false;
      videoControl.setPlayerStart();
    }
    videoPlayers.forEach((video)=>{
      video.player.play();

    });
    $("#startStopButtons").html(`<button id="pauseButton"  Title="Pause All" onclick="videoControl.pauseAll()"></button>`);

  },
  pauseAll:()=>{
    videoPlayers.forEach((video)=>{
      video.player.pause();

    });
    $("#startStopButtons").html(`<button id="playButton"  Title="Play All" onclick="videoControl.playAll()"></button>`);
  },
  fastForwardAll:()=>{

  },
  rewindAll:()=>{

  },
  resizePlayers:()=>{
    let newWidth=Math.round((document.getElementById('displayBox').offsetWidth*.9)/userPrefs.gridWidth);
    let newHeight=Math.round(newWidth*0.56260898551);

    $( ".fb-video" ).css( "width", newWidth);
    $( ".fb-video" ).css( "height", newHeight);
    $( ".fb-video span" ).css( "height", newHeight);
    $("iframe").css("height", newHeight);
    $("iframe").data("height", newHeight);
    $("iframe").data("width", newWidth);

    console.log(newHeight);



  },
  createPlayers:(videoDocs)=>{
    let displayHTML=``;
    let newWidth=Math.round((document.getElementById('displayBox').offsetWidth*.9)*10);
    let newHeight=Math.round(newWidth*0.56260898551);
    $("#displayBox").html(``);

    videoPlayers.length=0;

    videoDocs.docs.forEach((video)=>{
      let startDate=new Date(video.videoDate);

      displayHTML+=`
      <div class="videoResult" id="video${video.id}">
        <div class="fb-video"
          data-href="${video.videoLink}"
          data-show-text="false"
          id="player${video.id}"
          data-start="${startDate.getTime()+(startDate.getTimezoneOffset()*60*1000)}"
          data-height="${newHeight}"
          data-width="${newWidth}"
          >
        </div>
        <div class="videoOverlay"><div class="arrangementBar"><button class="removalButton" onclick="videoControl.removePlayer('video${video.id}', ${video.id})"></button></div></div>
      </div>`
    });

    // data-height="${newHeight}"
    // data-width="${newWidth}"

    $("#displayBox").html(displayHTML);
    FB.XFBML.parse()
    videoControl.getActivePlayers();
    videoControl.resizePlayers();


    if (videoDocs.docs.length<1){
      alert("Sorry, no videos found.  Try fewer filters or a wider time range!");
    }

  },
  removePlayer:(htmlID, serverID)=>{
    let player=$(`#${htmlID}`)[0];
    player.parentNode.removeChild(player);
    searchSettings.ignoreList.push(parseInt(serverID));

  },
  setPlayerStart:()=>{
    let offsetFrom=searchSettings.offsetFrom;


    videoPlayers.forEach((video)=>{
      let totalOffset;
      let start=parseInt(video.start);
      if (offsetFrom){
        totalOffset=parseInt(offsetFrom)-parseInt(start);
        totalOffset=totalOffset/1000;
        // console.log(new Date(start));
        // console.log(new Date(offsetFrom));
        // console.log(totalOffset);

        if (totalOffset>0){
          video.player.seek(totalOffset);
        }


      }else{
        console.log("Set player start encountered an error, failing gracefully.");
      }


    });




  }
}

let uiSystem={
  displayChange:(event)=>{
    userPrefs.gridWidth=parseInt(event.target.value);
    videoControl.resizePlayers();
  },
  displayInfo:()=>{
    window.location.href = "http://info.melonyeah.com/";
  },
  homeScreen:()=>{
    window.location.href = "http://melonyeah.com/";
  },
  displayLanguages:()=>{
    let elem = document.createElement('div');
    let languageSelect=`
      <div style="position:absolute; max-width:80vw; height: 15vh; top:40vh; left:25vw;">
        <button class="closeButton" onclick="uiSystem.closeLanguageMenu()"></button>
        <div style="display:flex; overflow-x:auto">
          <button class="languageButton" >English</button>
          <button class="languageButton">Chinese</button>
        </div>
      </div>
    `;
    elem.className+=" overlay";
    elem.className+=" closableDiv";
    elem.className+=" closableDiv";
    elem.id="languageDisplay";
    elem.innerHTML=languageSelect;
    document.body.appendChild(elem);
  },
  closeLanguageMenu:()=>{
    let menu=$("#languageDisplay")[0];
    menu.parentNode.removeChild(menu);
  }

}

let searchSystem={
  setMaxPlayers:(event)=>{
    let newMax=Math.round(event.target.value);

    if (newMax<1){
      newMax=1;
    }else if(newMax>30){
      newMax=30;
    }

    event.target.value=newMax;
    userPrefs.maxPlayers=newMax;
  },
  sampleLoad:()=>{
    $.getJSON( "dataSample.json", function( data ) {
    sampleData=data;
  });
  },
  searchDatabase:(query, ignoreList)=>{
    let url="http://172.105.123.252/"+query;
    let proxyUrl = 'https://cors-anywhere.herokuapp.com/';
    console.log(url);
  //  targetUrl = 'http://catfacts-api.appspot.com/api/facts?number=99'
    fetch(proxyUrl + url)
    .then(blob => blob.json())
    .then(data => {
      console.table(data);
      console.log("querySent");
      console.log(query);
      console.log(url);

      //document.querySelector("pre").innerHTML = JSON.stringify(data, null, 2);
      if (ignoreList){
        data.response.docs=data.response.docs.filter((video)=>{  return !ignoreList.includes(video.id)});}
      videoControl.createPlayers(data.response);
      videoControl.pauseAll();
      searchSettings.firstPlay=true;
      return data;
    })
    .catch(e => {
      console.log(e);
      return e;
    });

  },
  searchByButton:()=>{
    let timeStart=$("#startDateInput").val(),
      timeEnd=$("#endDateInput").val(),
      solrDate="(videoDate:",
      parsedStart,
      parsedEnd;
    let pageSearch=$("#sourceSelector").val(),
      solrPage="videoPage:(";
    let locationSearch=$("#locationSelector").val(),
      solrLocation="videoLocation:(";
    let query="";

    searchSettings.reset();
    if (timeStart){

      timeStart=new Date(timeStart);
      timeStart.setHours(timeStart.getHours()-8);
      searchSettings.offsetFrom=timeStart.getTime();
      parsedStart=`${timeStart.getFullYear()}-${timeStart.getMonth()+1}-${timeStart.getDate()}T${("0"+timeStart.getHours()).slice(-2)}:${timeStart.getMinutes()}:00Z`;


      if (timeEnd){
        timeEnd=new Date(timeEnd);
        timeEnd.setHours(timeEnd.getHours()-8);
        parsedEnd=`${timeEnd.getFullYear()}-${timeEnd.getMonth()+1}-${timeEnd.getDate()}T${("0"+timeEnd.getHours()).slice(-2)}:${timeEnd.getMinutes()}:00Z`;
        solrDate+=`[* TO ${parsedStart}] AND videoEndDate:[${parsedEnd} TO NOW])OR(videoDate:[${parsedStart} TO ${parsedEnd}])OR(videoEndDate:[${parsedStart} TO ${parsedEnd}])`;

        if (timeEnd.getTime()<timeStart.getTime() ){
          alert("Start time must be before the selected end time!");
          return;
        }
      }else{
        solrDate+=`[* TO ${parsedStart}] AND videoEndDate:[${parsedStart} TO *])`;
      }
      searchSettings.time=solrDate;
      query+=solrDate;
    }else{
      alert("Start time is Mandatory, please select a start time and search again!");
      return
    }
    if (pageSearch.length){
      pageSearch.forEach((page, index)=>{
        if (index>0){
          solrPage+=` OR `;
        }
        solrPage+=page;
      });
      solrPage+=")";

      if (query){
        query+=" AND ";
      }
      searchSettings.source=solrPage;
      query+=solrPage;

    }
    else{
      $("#sourceSelector").selectpicker('selectAll');
    }
    if (locationSearch.length){
      locationSearch.forEach((location, index)=>{
        if (index>0){
          solrLocation+=` OR `;
        }
        solrLocation+=location;
      });

      if (query){
        query+=" AND ";
      }
      solrLocation+=")";
      searchSettings.location=solrLocation;
      query+=solrLocation;
    }else{
      $("#locationSelector").selectpicker('selectAll');
    }



    query+=`&rows=${userPrefs.maxPlayers}`;



    //let descSearch="";


    searchSystem.searchDatabase(query);

  },
  searchByURL:(searchObj)=>{
    let query=``;
    let ignoreList=false;
    let searchList;
    if (query){
      query+=" AND ";
    }

    //Uses old URL format
    // if (searchObj.time){
    //   query+=searchObj.time;
    // }
    // if (searchObj.location){
    //   if (query){
    //     query+=" AND ";
    //   }
    //   query+=searchObj.location;
    // }
    // if (searchObj.source){
    //   if (query){
    //     query+=" AND ";
    //   }
    //   query+=searchObj.source;
    // }
    searchSettings.offsetFrom=parseInt(searchObj.offset);
    if(searchObj.ignored){
      ignoreList=searchObj.ignored.split(",");

      ignoreList=ignoreList.filter((item)=>{return Boolean(item.length>0)});
    }
    if(searchObj.videos){
      searchList=searchObj.videos.split(",");

      searchList=searchList.filter((item)=>{return Boolean(item.length>0)});
      searchList.forEach((id, index)=>{
        if (index!=0){
          query+=' OR ';

        }
        query+=`id:${id}`;
      });
    }
    if(searchObj.rows){
      query+=`&rows=${searchObj.rows}`;
    }


    searchSystem.searchDatabase(query, ignoreList);
  },
  getVideoDuration:(videoURL)=>{

  },
  loadDropdowns:(resolve, reject)=>{
    let url="http://172.105.123.252/videoPage:*&rows="+databaseUpperBound;
    let proxyUrl = 'https://cors-anywhere.herokuapp.com/';

    fetch(proxyUrl + url)
    .then(blob => blob.json())
    .then(data => {
      fillDropdowns(data.response.docs);

    })
    .catch(e => {
      console.log(e);
      return e;
    });

    function fillDropdowns(docs){
      let sources=[],
        sourceOptions='<option data-divider="true"></option>';
      let locations=[],
        locationOptions='<option data-divider="true"></option>';
//<option value="NOFILTER">SELECT ALL</option>

      //
      docs.forEach((video)=>{
        refData[video.id]=video;
        if (!sources.includes(video.videoPage)){
          sources.push(video.videoPage);
          sourceOptions+=`<option selected value="${video.videoPage}">${video.videoPage}</option>`;

        }
        video.videoLocation.forEach((location)=>{
          if (!locations.includes(location)){
            locations.push(location);
            locationOptions+=`<option selected value="${location}">${location}</option>`;
          }
        });

      });




      $("#locationSelector").html(locationOptions);
      $("#sourceSelector").html(sourceOptions);
     // $('select').select2();
     $('select').selectpicker();


    }
  }
}

let urlSystem={
  getURLVars:()=>{
    //https://html-online.com/articles/get-url-parameters-javascript/
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    if (vars.search){
      searchSystem.searchByURL(vars);
    }
    console.log(vars);
  },
  getSeededURL:()=>{
    let finalURL=siteURL;
    let idList=[];
    finalURL+="?search=true";

    // if (searchSettings.time){
    //   finalURL+=`&?time=${searchSettings.time}`;
    // }
    // if (searchSettings.location){
    //   finalURL+=`&?location=${searchSettings.location}`;
    // }
    // if (searchSettings.source){
    //   finalURL+=`&?source=${searchSettings.source}`;
    // }
    if(searchSettings.ignoreList.length>0){
      finalURL+=`&?ignored=`;
      searchSettings.ignoreList.forEach((ignored)=>{
        finalURL+=`${ignored},`;

      });
    }
    if (videoPlayers.length>0){
      finalURL+=`&?videos=`;

      videoPlayers.forEach((player)=>{
        if (!idList.includes(parseInt(player.solrID))){
          idList.push(parseInt(player.solrID));
        }
      });
      idList.forEach((playerID)=>{
        finalURL+=`${playerID},`;

      });
    }
    finalURL+=`&?offset=${searchSettings.offsetFrom}`;


    finalURL+=`&?rows=${userPrefs.maxPlayers}`;

    return finalURL;
  },
  copySearchResult:()=>{
    ci.copyToClipboard(urlSystem.getSeededURL());
  }


}

let iosRes={
  widthFix:()=>{
    // $(".fullWidth").width($(window).width());
  }


}

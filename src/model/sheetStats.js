




const siteURL="melonyeah.com/";  //Change this to whatever the base url of your site is
const databaseUpperBound=2500; //Make sure this number is always bigger than the total number of rows in your database.


let videoPlayers=[];
let userPrefs={
  gridWidth:3,
  language:"english",
  maxPlayers:10

};
let searchSettings={
  time:false, //time or time range that must be accounted for in videos (videos will start at this time when playback is selected)
  location:false, //dropdown multiple select, refers to physical locations
  source:false, //dropdown multiple select, refers to page that video is sourced from
  ignoreList:[],
  searchedList:[],
  reset:()=>{

    searchSettings.time=false;
    searchSettings.location=false;
    searchSettings.source=false;
    searchSettings.ignoreList=[];
    searchSettings.searchedList=[];
    searchSettings.offsetFrom=false;

  },
  firstPlay:true,
}
let refData={};

let languageOptions={
  english:{

  },
}

let ci={

  copyToClipboard:(copyText)=>{



   /* Select the text field */
   let copyContainer;
   //create a holder input for our text
   let elem = document.createElement('input');
    elem.id="tempInput";
    elem.style.cssText = 'position:absolute;opacity:0;';
    document.body.appendChild(elem);
    elem.value=copyText;


   //select text, then copy to clipboard
   copyContainer = document.querySelector("#tempInput");
    copyContainer.select();

   document.execCommand("copy");
    copyContainer.parentNode.removeChild(copyContainer);


   /* Alert the user of the copied text */
   ci.fyiUser("Link copied to clipboard!");
 },
 fyiUser:(text)=>{
   $("#alertBanner").removeClass("activeAlert");
   $("#alertBanner").html(text);
   $("#alertBanner").addClass("activeAlert");
   setTimeout(removeBanner, 5000)

   function removeBanner(){
     $("#alertBanner").removeClass("activeAlert");
   }
 }
}

function resetStorage(){
  if (window.confirm("Do you really want to delete all your saved info?")) {
  localStorage.clear();
  location.reload();
}
}

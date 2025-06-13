import { Scoreboard, MatchType } from "./class/scoreboard";

export let scoreboards:Scoreboard[] = [];
export let currentSB:Scoreboard = new Scoreboard("", MatchType.Team, 6, 1);
export let communicationCount = 0;
export let isCommunicating    = false;
export let isDirectTeamChoice = true;

const categoryRadioButtons = document.getElementsByClassName('category-input');
const teamSelectElems = document.getElementsByClassName('team-select');
const groupSelectElem  = document.getElementById('group-select' ) as HTMLSelectElement;
const shajoSelectElem  = document.getElementById('shajo-select' ) as HTMLSelectElement;

export function setCurrentScoreboard(arg:Scoreboard){
  currentSB = arg;
}

export function changeCommunicationState(arg:number){
  const registerButton      = document.getElementById('register') as HTMLButtonElement;
  communicationCount = communicationCount + arg;
  if(communicationCount > 0){
    isCommunicating = true;
    disableSidebar();
    registerButton.textContent = "通信中...";
  }else{
    isCommunicating = false;
    enableSidebar();
    if(registerButton.textContent == "通信中...")registerButton.textContent = "登録";
  }
}

export function setSelectionMode(arg:boolean){
  isDirectTeamChoice = arg;
}

function enableSidebar(){
  for(let i=0; i<categoryRadioButtons.length; i++){
    categoryRadioButtons[i].removeAttribute('disabled');
  }
  let matchSelectElems = document.getElementsByClassName('match-select');
  for(let i=0; i<matchSelectElems.length; i++){
    matchSelectElems[i].removeAttribute('disabled');
  }
  let commonButtons = document.getElementsByClassName('sidebar-common-button');
  for(let i=0; i<commonButtons.length; i++){
    commonButtons[i].removeAttribute('disabled');
  }
  if(currentSB.method == "distance"){
    groupSelectElem.setAttribute('disabled', 'true');
    shajoSelectElem.setAttribute('disabled', 'true');
    for(let i=0; i<teamSelectElems.length; i++){
      teamSelectElems[i].setAttribute('disabled', 'true');
    }
  }else if(isDirectTeamChoice){
    groupSelectElem.setAttribute('disabled', 'true');
    shajoSelectElem.setAttribute('disabled', 'true');
  }else{
    for(let i=0; i<teamSelectElems.length; i++){
      teamSelectElems[i].setAttribute('disabled', 'true');
    }
  }
}

function disableSidebar(){
  for(let i=0; i<categoryRadioButtons.length; i++){
    categoryRadioButtons[i].setAttribute('disabled', 'true');
  }
  let matchSelectElems = document.getElementsByClassName('match-select');
  for(let i=0; i<matchSelectElems.length; i++){
    matchSelectElems[i].setAttribute('disabled', 'true');
  }
  let commonButtons = document.getElementsByClassName('sidebar-common-button');
  for(let i=0; i<commonButtons.length; i++){
    commonButtons[i].setAttribute('disabled', 'true');
  }
}
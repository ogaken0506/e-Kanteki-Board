import { Scoreboard, MatchType } from "./class/scoreboard";

let scoreboards:Scoreboard[] = [];
let savedScoreboards:Scoreboard[] = [];
let currentIndex = 0;
export let communicationCount = 0;
export let isCommunicating    = false;
export let isDirectTeamChoice = true;

const categoryRadioButtons = document.getElementsByClassName('category-input');
const teamSelectElems = document.getElementsByClassName('team-select');
const groupSelectElem  = document.getElementById('group-select' ) as HTMLSelectElement;
const shajoSelectElem  = document.getElementById('shajo-select' ) as HTMLSelectElement;

export function setCurrentIndex(arg:number){
  currentIndex = arg;
}

export function addScoreboard(sheet_id:string, matchType:MatchType, team_size:number, team_count:number){
  scoreboards.push(new Scoreboard(sheet_id, matchType, team_size, team_count));
  savedScoreboards.push(new Scoreboard(sheet_id, matchType, team_size, team_count))
}

export function clearScoreboards(){
  scoreboards.length = 0;
  savedScoreboards.length = 0;
}

export function getCurrentScoreboard(){
  return scoreboards[currentIndex];
}
export function getCurrentSavedScoreboard(){
  return savedScoreboards[currentIndex];
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
  if(scoreboards[currentIndex].method == "distance"){
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
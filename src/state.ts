import { Scoreboard, MatchType } from "./class/scoreboard";
import { expires_at, expires_in } from "./network/api"

let scoreboards:Scoreboard[] = [];
let savedScoreboards:Scoreboard[] = [];
let sampleScoreboard:Scoreboard = new Scoreboard("", MatchType.Team, 5, 1);
let sampleSavedScoreboard:Scoreboard = new Scoreboard("", MatchType.Team, 5, 1);
let currentIndex = -1;
export let communicationCount = 0;
export let isCommunicating    = false;
export let isDirectTeamChoice = true;

const categoryRadioButtons = document.getElementsByClassName('category-input');
const teamSelectElems = document.getElementsByClassName('team-select');
const groupSelectElem  = document.getElementById('group-select' ) as HTMLSelectElement;
const shajoSelectElem  = document.getElementById('shajo-select' ) as HTMLSelectElement;
const nextButton  = document.getElementById('next' ) as HTMLButtonElement;
const prevButton  = document.getElementById('prev' ) as HTMLButtonElement;

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

export function getCurrentScoreboard():Scoreboard{
  if(currentIndex == -1)return sampleScoreboard;
  return scoreboards[currentIndex];
}
export function getCurrentSavedScoreboard():Scoreboard{
  if(currentIndex == -1)return sampleSavedScoreboard;
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
  if(getCurrentScoreboard().method == "distance"){
    groupSelectElem.setAttribute('disabled', 'true');
    shajoSelectElem.setAttribute('disabled', 'true');
    for(let i=0; i<teamSelectElems.length; i++){
      teamSelectElems[i].setAttribute('disabled', 'true');
    }
    nextButton.disabled = true;
    prevButton.disabled = true;
  }else if(isDirectTeamChoice){
    groupSelectElem.setAttribute('disabled', 'true');
    shajoSelectElem.setAttribute('disabled', 'true');
  }else{
    for(let i=0; i<teamSelectElems.length; i++){
      teamSelectElems[i].setAttribute('disabled', 'true');
    }
  }
  checkHistoryButtonState();
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

export function checkHistoryButtonState(){
  const undoButton = document.getElementById('undo') as HTMLButtonElement;
  const redoButton = document.getElementById('redo') as HTMLButtonElement;
  if(undoButton && redoButton){
    if(getCurrentScoreboard().history.length > 0){
      undoButton.disabled = false;
    }else{
      undoButton.disabled = true;
    }
    if(getCurrentScoreboard().undone.length > 0){
      redoButton.disabled = false;
    }else{
      redoButton.disabled = true;
    }
  }
}

export function updateTimerState(){
  if(expires_at < Math.floor(Date.now() / 1000))return;

  const elapsed = document.getElementById("elapsed");
  const remainingTime = expires_at - Math.floor(Date.now() / 1000)
  const elapsedTime = expires_in - remainingTime
  const centralAngle = ( elapsedTime / expires_in) * 360;
  elapsed?.setAttribute("d", describeSector(20, 20, 18, centralAngle));
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = (angleDeg) * Math.PI / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad)
  };
}

function describeSector(cx, cy, r, angle) {
  const timeOut = document.getElementById("timeout");
  if (angle <= 0){
    return ""
  }else if(360 <= angle){
    timeOut?.setAttribute("fill", "rgba(255, 255, 255, 0.6)")
    return ""
  }else{
    timeOut?.setAttribute("fill", "rgba(255, 255, 255, 0)")
  }
  const start = polarToCartesian(cx, cy, r, -90);
  const end = polarToCartesian(cx, cy, r, -90+angle);
  const largeArc = angle > 180 ? 1 : 0;
  return [
    `M ${cx} ${cy}`,
    `L ${start.x} ${start.y}`,
    `A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`,
    `Z`
  ].join(' ');
}
import { Scoreboard, MatchType } from "./class/scoreboard";

export let scoreboards:Scoreboard[] = [];
export let currentSB:Scoreboard = new Scoreboard("", MatchType.Team, 6, 1);
export let communicationCount = 0;
export let isCommunicating    = false;
export let isDirectTeamChoice = true;

export function setCurrentScoreboard(arg:Scoreboard){
  currentSB = arg;
}

export function changeCommunicationState(arg:number){
  const registerButton      = document.getElementById('register') as HTMLButtonElement;
  communicationCount = communicationCount + arg;
  if(communicationCount > 0){
    isCommunicating = true;
    registerButton.textContent = "通信中...";
  }else{
    isCommunicating = false;
    if(registerButton.textContent == "通信中...")registerButton.textContent = "登録";
  }
}

export function setSelectionMode(arg:boolean){
  isDirectTeamChoice = arg;
}
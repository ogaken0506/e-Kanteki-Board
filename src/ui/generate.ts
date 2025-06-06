import { Scoreboard } from '../class/scoreboard';
import { onSquareClick, onDistanceInput } from './scoreboardEvent';

const fistTeamHeaderTemplate = document.getElementById("first-team-header-template")! as HTMLTemplateElement;
const teamHeaderTemplate     = document.getElementById("team-header-template")!       as HTMLTemplateElement;
const archerNormaTemplate    = document.getElementById("archer-normal-template")!     as HTMLTemplateElement;
const archerDistanceTemplate = document.getElementById("archer-distance-template")!   as HTMLTemplateElement;
const teamSelectTemplate     = document.getElementById("team-select-template")!       as HTMLTemplateElement;

const orderText = ["大前","二的","三的","四的","五的","六的","七的","八的","九的","拾的"]

export function generateScoreboardElements(arg:Scoreboard){
  const scoreboardElem = document.getElementById("scoreboard") as HTMLElement;
  scoreboardElem.innerHTML = "";

  for(let i=0; i<arg.teams.length; i++){

    const teamWrapperElem = document.createElement('div');
    teamWrapperElem.classList.add('team-wrapper')
    teamWrapperElem.id = "TW" + (i+1).toString();

    const teamElem = document.createElement('div');
    teamElem.classList.add('team')
    teamElem.id = "T" + (i+1).toString();

    const teamPlaceElem = document.createElement('div');
    teamPlaceElem.classList.add('team-place')
    teamPlaceElem.id = "TP" + (i+1).toString();


    //チームヘッダー追加
    if(i == 0 && arg.method != "distance"){
      const firstTeamHeaderElem = fistTeamHeaderTemplate.content.cloneNode(true)
      teamElem.appendChild(firstTeamHeaderElem);
    }else{
      const teamHeaderElem = teamHeaderTemplate.content.cloneNode(true) as HTMLElement;
      teamHeaderElem.querySelector('.team-header')!.id = "TH" + (i+1).toString();
      teamElem.appendChild(teamHeaderElem);
    }

    //チームの選手人数分枠追加
    if(arg.method == "distance"){ //遠近競射の場合
      for(let j=0; j<arg.teamSize; j++){
        const archerElem = archerDistanceTemplate.content.cloneNode(true) as HTMLElement;
        archerElem.querySelector('.archer')!.id = "A" + (j+1).toString();
        teamElem.appendChild(archerElem);
      }
    }else{                        //それ以外の場合
      for(let j=0; j<arg.teamSize; j++){
        const archerElem = archerNormaTemplate.content.cloneNode(true) as HTMLElement;
        archerElem.querySelector('.archer')!.id = "A" + (j+1).toString();
        if(j == 0){
          archerElem.querySelector('.archer-order')!.textContent = "大前"
        }else if(arg.teamSize == 3 && j == 1){
          archerElem.querySelector('.archer-order')!.textContent = "中"
        }else if(j == arg.teamSize - 2){
          archerElem.querySelector('.archer-order')!.textContent = "落前"
        }else if(j == arg.teamSize - 1){
          archerElem.querySelector('.archer-order')!.textContent = "落"
        }else if(9 < j){
          archerElem.querySelector('.archer-order')!.textContent = (j+1).toString()+'的'
        }else{
          archerElem.querySelector('.archer-order')!.textContent = orderText[j]
        }
        teamElem.appendChild(archerElem);
      }
    }
    teamWrapperElem.appendChild(teamElem);

    //チームの場所表示枠追加(射場、前立、後立)
    teamPlaceElem.textContent = "第" + (arg.shajo + 1) + "射場";
    if(arg.teamCount == 2){
      if(i == 0){
        teamPlaceElem.textContent = "第" + (arg.shajo + 1) + "射場 前立";
      }else if(i == 1){
        teamPlaceElem.textContent = "第" + (arg.shajo + 1) + "射場 後立";
      }
    }else if(2 < arg.teamCount){
      teamPlaceElem.textContent = "第" + (arg.shajo + 1) + "射場 組(" + (i+1).toString() + ")";
    }
    teamWrapperElem.appendChild(teamPlaceElem);
    scoreboardElem.appendChild(teamWrapperElem);
  }
  
  Array.from(document.getElementsByClassName("square-button")).forEach((button, index) => {
    button.addEventListener('click', onSquareClick);
  });
  Array.from(document.getElementsByClassName("distance-input")).forEach((input, index) => {
    input.addEventListener('input', onDistanceInput)
  })
}

export function generateTeamSelectElem(teamCount:number){
  const selectsWrapper = document.getElementById('team-selects-wrapper') as HTMLElement;
  selectsWrapper.innerHTML = "";
  for(let i=0; i<teamCount; i++){
    const selectWrapper = teamSelectTemplate.content.cloneNode(true) as HTMLElement;
    selectWrapper.querySelector('.team-select-wrapper')!.id = "TSW" + (i+1).toString();
    selectWrapper.querySelector('.team-select')!.id = "TS" + (i+1).toString();
    selectWrapper.querySelector('.match-select-label')!.id = "TSL" + (i+1).toString();
    selectWrapper.querySelector('.match-select-label')!.setAttribute('for', "TS" + (i+1).toString());
    selectsWrapper.appendChild(selectWrapper);
  }

  if(teamCount == 1){
    document.getElementById('TSL1')!.textContent = '組';
  }else if(teamCount == 2){
    document.getElementById('TSL1')!.textContent = '前立';
    document.getElementById('TSL2')!.textContent = '後立';
  }else{
    for(let i=0; i<teamCount; i++){
      document.getElementById('TSL'+(i+1))!.textContent = '組('+(i+1).toString()+')';
    }
  }
}


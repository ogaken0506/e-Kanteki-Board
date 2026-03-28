import { checkHistoryButtonState, getCurrentSavedScoreboard, getCurrentScoreboard } from "../state";
import * as GetElems from './getElems';

export function onSquareClick(e:Event){
  const squareButton = e.target as HTMLButtonElement;
  if(document.getElementsByClassName('score-button').length > 0){
    document.getElementById("hit-button")?.remove();
    document.getElementById("miss-button")?.remove();
    document.getElementById("uncertain-button")?.remove();
    document.getElementById("erase-button")?.remove();

    document.getElementById( "early-hit-button")?.remove();
    document.getElementById(  "late-hit-button")?.remove();
    document.getElementById("early-miss-button")?.remove();
    document.getElementById( "late-miss-button")?.remove();
    return;
  }

  const buttonsInfo = [
    {type:"miss",       text:"外"},
    {type:"hit",        text:"中"},
    {type:"uncertain",  text:"疑"},
    {type:"erase",      text:"消"},
    {type:"early-hit",  text:"早"},
    {type:"late-hit",   text:"遅"},
    {type:"early-miss", text:"早"},
    {type:"late-miss",  text:"遅"},
  ]

  buttonsInfo.forEach((info, i) => {
    const buttonElem = document.createElement('button');
    buttonElem.setAttribute('id', info.type + "-button");
    buttonElem.setAttribute('class', 'score-button');
    buttonElem.textContent = info.text;
    squareButton.after(buttonElem);

    buttonElem.addEventListener('click', onScoreButtonClick);
  })
}

function onScoreButtonClick(e:Event){
  const currentSB = getCurrentScoreboard();

  const scoreButton = e.target as HTMLElement;
  const square = scoreButton.parentElement as HTMLElement;

  const teamElem   = scoreButton.closest('.team')   as HTMLElement;
  const archerElem = scoreButton.closest('.archer') as HTMLElement;
  const squareElem = scoreButton.closest('.square') as HTMLElement;
  if(!teamElem || !archerElem || !squareElem){
    console.warn("看的板のHTML構造が変です。");
    return;
  }

  const teamIndex   = parseInt(  teamElem.id.replace(/(^T)/, "")) - 1;
  const archerIndex = parseInt(archerElem.id.replace(/(^A)/, "")) - 1;
  const scoreIndex  = parseInt(squareElem.id.replace(/(^S)/, "")) - 1;
  const buttonLocale = `T${teamIndex}-A${archerIndex}-S${scoreIndex}`;
  const targetArcher = currentSB.teams[teamIndex]?.archers[archerIndex];
  if(!targetArcher){
    console.warn('存在しない射手を参照しています');
    return;
  }
  if(scoreIndex != 0 && scoreIndex != 1 && scoreIndex != 2 && scoreIndex != 3){
    console.warn('scoreIndexが範囲外です');
    return;
  }
  const beforeScore = targetArcher.score[scoreIndex];
  if (square) {
    square.classList.remove("hit", "miss", "uncertain", "early", "late");

    switch(scoreButton.id){
      case "hit-button":
        square.classList.add("hit");
        targetArcher.score[scoreIndex] = "o";
        break;
      case "miss-button":
        square.classList.add("miss");
        targetArcher.score[scoreIndex] = "x";
        break;
      case "uncertain-button":
        square.classList.add("uncertain");
        targetArcher.score[scoreIndex] = "?";
        break;
      case "erase-button":
        targetArcher.score[scoreIndex] = "#";
        break;
      case "early-hit-button":
        square.classList.add("early","hit");
        targetArcher.score[scoreIndex] = "E";
        break;
      case "late-hit-button":
        square.classList.add("late","hit");
        targetArcher.score[scoreIndex] = "L";
        break;
      case "early-miss-button":
        square.classList.add("early","miss");
        targetArcher.score[scoreIndex] = "e";
        break;
      case "late-miss-button":
        square.classList.add("late","miss");
        targetArcher.score[scoreIndex] = "l";
        break;
    }

    if(beforeScore != targetArcher.score[scoreIndex]){
      currentSB.addHistory(buttonLocale, beforeScore, targetArcher.score[scoreIndex]);
      checkHistoryButtonState();
    }

    document.getElementById("hit-button")?.remove();
    document.getElementById("miss-button")?.remove();
    document.getElementById("uncertain-button")?.remove();
    document.getElementById("erase-button")?.remove();
    document.getElementById( "early-hit-button")?.remove();
    document.getElementById(  "late-hit-button")?.remove();
    document.getElementById("early-miss-button")?.remove();
    document.getElementById( "late-miss-button")?.remove();

    let hitCount = 0;
    for(let i=0; i<targetArcher.score.length; i++){
      if(targetArcher.score[i] == "o"){
        hitCount++;
      }
    }
    archerElem.querySelector('.archer-hit-count')!.textContent = hitCount.toString() + "中";
  }
}

export function onDistanceInput(e:Event){
  const savedSB = getCurrentSavedScoreboard();
  const distanceInput = e.target as HTMLInputElement;
  const teamElem   = distanceInput.closest(  '.team') as HTMLElement;
  const archerElem = distanceInput.closest('.archer') as HTMLElement;
  if(!teamElem || !archerElem){
    console.warn("看的板のHTML構造が変です。");
    return;
  }

  const teamIndex   = parseInt(  teamElem.id.replace(/(^T)/, "")) - 1;
  const archerIndex = parseInt(archerElem.id.replace(/(^A)/, "")) - 1;
  const targetArcher = savedSB.teams[teamIndex]?.archers[archerIndex];
  if(!targetArcher){
    console.warn('存在しない射手を参照しています');
    return;
  }
  GetElems.scoreSlideValue(teamIndex+1,archerIndex+1).textContent = distanceInput.value;
  if(parseInt(distanceInput.value) != targetArcher.distance){
    GetElems.scoreSlideValue(teamIndex+1,archerIndex+1).textContent += "(" +targetArcher.distance.toString() + ")";
  }
}

export function onDistanceChange(e:Event){
  const distanceInput = e.target as HTMLInputElement;
  const teamElem   = distanceInput.closest(  '.team') as HTMLElement;
  const archerElem = distanceInput.closest('.archer') as HTMLElement;
  if(!teamElem || !archerElem){
    console.warn("看的板のHTML構造が変です。");
    return;
  }
  const currentSB = getCurrentScoreboard();
  const teamIndex   = parseInt(  teamElem.id.replace(/(^T)/, "")) - 1;
  const archerIndex = parseInt(archerElem.id.replace(/(^A)/, "")) - 1;
  const targetArcher = currentSB.teams[teamIndex]?.archers[archerIndex];
  if(!targetArcher){
    console.warn('存在しない射手を参照しています');
    return;
  }

  const inputLocale = `T${teamIndex}-A${archerIndex}-D0`;
  const before = targetArcher.distance.toString();

  targetArcher.distance = parseInt(distanceInput.value);

  if(before != targetArcher.distance.toString()){
    currentSB.addHistory(inputLocale, before, targetArcher.distance.toString())
    checkHistoryButtonState();
  }
}
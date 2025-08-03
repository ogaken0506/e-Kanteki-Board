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
  const hitButton       = document.createElement('button');
  const missButton      = document.createElement('button');
  const uncertainButton = document.createElement('button');
  const eraseButton     = document.createElement('button');
  const earlyHitButton  = document.createElement('button');
  const lateHitButton   = document.createElement('button');
  const earlyMissButton = document.createElement('button');
  const lateMissButton  = document.createElement('button');

  const types = ["miss", "hit",  "uncertain", "erase", "early-hit", "late-hit", "early-miss", "late-miss"];
  const buttons = [missButton, hitButton, uncertainButton, eraseButton, earlyHitButton, lateHitButton, earlyMissButton, lateMissButton];
  const texts = ['外', '中', '疑', '消', '早', '遅', '早', '遅'];

  for(let i = 0; i < 8; i++){
    buttons[i].setAttribute('id', types[i] + "-button");
    buttons[i].setAttribute('class', 'score-button');
    buttons[i].textContent = texts[i];
    squareButton.after(buttons[i]);

    buttons[i].addEventListener('click', onScoreButtonClick);
  }
}

function onScoreButtonClick(e:Event){
  let currentSB = getCurrentScoreboard();

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
  const beforeScore = currentSB.teams[teamIndex].archers[archerIndex].score[scoreIndex];
  if (square) {
    square.classList.remove("hit", "miss", "uncertain", "early", "late");

    switch(scoreButton.id){
      case "hit-button":
        square.classList.add("hit");
        currentSB.teams[teamIndex].archers[archerIndex].score[scoreIndex] = "o";
        break;
      case "miss-button":
        square.classList.add("miss");
        currentSB.teams[teamIndex].archers[archerIndex].score[scoreIndex] = "x";
        break;
      case "uncertain-button":
        square.classList.add("uncertain");
        currentSB.teams[teamIndex].archers[archerIndex].score[scoreIndex] = "?";
        break;
      case "erase-button":
        currentSB.teams[teamIndex].archers[archerIndex].score[scoreIndex] = "#";
        break;
      case "early-hit-button":
        square.classList.add("early","hit");
        currentSB.teams[teamIndex].archers[archerIndex].score[scoreIndex] = "E";
        break;
      case "late-hit-button":
        square.classList.add("late","hit");
        currentSB.teams[teamIndex].archers[archerIndex].score[scoreIndex] = "L";
        break;
      case "early-miss-button":
        square.classList.add("early","miss");
        currentSB.teams[teamIndex].archers[archerIndex].score[scoreIndex] = "e";
        break;
      case "late-miss-button":
        square.classList.add("late","miss");
        currentSB.teams[teamIndex].archers[archerIndex].score[scoreIndex] = "l";
        break;
    }

    if(beforeScore != currentSB.teams[teamIndex].archers[archerIndex].score[scoreIndex]){
      currentSB.addHistory(buttonLocale, beforeScore, currentSB.teams[teamIndex].archers[archerIndex].score[scoreIndex]);
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
    for(let i=0; i<currentSB.teams[teamIndex].archers[archerIndex].score.length; i++){
      if(currentSB.teams[teamIndex].archers[archerIndex].score[i] == "o"){
        hitCount++;
      }
    }
    archerElem.querySelector('.archer-hit-count')!.textContent = hitCount.toString() + "中";
  }
}

export function onDistanceInput(e:Event){
  let currentSB = getCurrentScoreboard();
  let savedSB = getCurrentSavedScoreboard();
  const distanceInput = e.target as HTMLInputElement;
  const teamElem   = distanceInput.closest(  '.team') as HTMLElement;
  const archerElem = distanceInput.closest('.archer') as HTMLElement;
  if(!teamElem || !archerElem){
    console.warn("看的板のHTML構造が変です。");
    return;
  }

  const teamIndex   = parseInt(  teamElem.id.replace(/(^T)/, "")) - 1;
  const archerIndex = parseInt(archerElem.id.replace(/(^A)/, "")) - 1;
  GetElems.scoreSlideValue(teamIndex+1,archerIndex+1).textContent = distanceInput.value;
  if(parseInt(distanceInput.value) != savedSB.teams[teamIndex].archers[archerIndex].distance){
    GetElems.scoreSlideValue(teamIndex+1,archerIndex+1).textContent += "(" +savedSB.teams[teamIndex].archers[archerIndex].distance.toString() + ")";
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
  const teamIndex   = parseInt(  teamElem.id.replace(/(^T)/, "")) - 1;
  const archerIndex = parseInt(archerElem.id.replace(/(^A)/, "")) - 1;

  let currentSB = getCurrentScoreboard();

  const inputLocale = `T${teamIndex}-A${archerIndex}-D0`;
  const before = currentSB.teams[teamIndex].archers[archerIndex].distance.toString();

  currentSB.teams[teamIndex].archers[archerIndex].distance = parseInt(distanceInput.value);

  if(before != currentSB.teams[teamIndex].archers[archerIndex].distance.toString()){
    currentSB.addHistory(inputLocale, before, currentSB.teams[teamIndex].archers[archerIndex].distance.toString())
    checkHistoryButtonState();
  }
}
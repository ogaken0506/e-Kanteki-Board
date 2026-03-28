import { Scoreboard } from "../class/scoreboard";
import * as GetElems from './getElems'

const archerElements = document.getElementsByClassName("archer");

export function applyScore(arg:Scoreboard) {
  for (let i = 0; i < arg.teams.length; i++) {
    for (let j = 0; j < arg.teamSize; j++) {
      const numberElem = archerElements[i * arg.teamSize + j]?.querySelector('.archer-number');
      const nameElem   = archerElements[i * arg.teamSize + j]?.querySelector('.archer-name');
      const countElem  = archerElements[i * arg.teamSize + j]?.querySelector('.archer-hit-count');
      const targetArcher = arg.teams[i]?.archers[j];
      if(!numberElem)console.warn('番号要素が見つかりません');
      if(!nameElem)console.warn('名前要素が見つかりません');
      if(!countElem)console.warn('カウント要素が見つかりません');
      if(!targetArcher)console.warn('存在しない選手を参照しています');
      if(!numberElem||!nameElem||!countElem||!targetArcher)return;
      numberElem.textContent = targetArcher.number.toString();
      nameElem.textContent   = targetArcher.name;

      if(arg.method != "distance"){
        for (let k = 0; k < 4; k++) {
          const ScoreButton = GetElems.scoreButton(i+1,j+1,k+1);
          const Square = ScoreButton.parentElement!
          Square.classList.remove('hit', 'miss', 'uncertain', 'early', 'late');
          ScoreButton.disabled = false;
          if(targetArcher.number == 0){
            ScoreButton.disabled = true
          }else if(targetArcher.score[k] === "o"){
            Square.classList.add('hit');
          }else if(targetArcher.score[k] === "x"){
            Square.classList.add('miss');
          }else if(targetArcher.score[k] === "?"){
            Square.classList.add('uncertain');
          }else if(targetArcher.score[k] === "E"){
            Square.classList.add('early','hit');
          }else if(targetArcher.score[k] === "L"){
            Square.classList.add('late','hit');
          }else if(targetArcher.score[k] === "e"){
            Square.classList.add('early','miss');
          }else if(targetArcher.score[k] === "l"){
            Square.classList.add('late','miss');
          }
        }
        let hitCount = 0;
        for(let k=0; k<4; k++){
          if(targetArcher.score[k] == "o"){
            hitCount++;
          }
        }
        countElem.textContent = hitCount.toString() + "中";
      }else{
        const scoreSlide = GetElems.scoreSlide(i+1,j+1);
        const scoreSlideValue = GetElems.scoreSlideValue(i+1,j+1);

        scoreSlide.disabled = false;
        scoreSlide.value = "0";
        scoreSlideValue.textContent = "0";
        if(targetArcher.number == 0){
          scoreSlide.disabled = true
        }else{
          scoreSlide.value            = targetArcher.distance.toString();
          scoreSlideValue.textContent = targetArcher.distance.toString();
        }
      }
    }
  }
}

export function applySavedScore(arg:Scoreboard) {
  for (let i = 0; i < arg.teams.length; i++) {
    for (let j = 0; j < arg.teamSize; j++) {
      const targetArcher = arg.teams[i]?.archers[j];
      if(!targetArcher){console.warn('存在しない選手を参照しています');return;}

      if(arg.method != "distance"){
        for (let k = 0; k < 4; k++) {
          const ScoreButton = GetElems.scoreButton(i+1,j+1,k+1);
          const Square = ScoreButton.parentElement!
          Square.classList.remove('prev-hit', 'prev-miss', 'prev-uncertain', 'prev-early', 'prev-late');
          ScoreButton.disabled = false;
          if(targetArcher.number == 0){
            ScoreButton.disabled = true
          }else if(targetArcher.score[k] === "o"){
            Square.classList.add('prev-hit');
          }else if(targetArcher.score[k] === "x"){
            Square.classList.add('prev-miss');
          }else if(targetArcher.score[k] === "?"){
            Square.classList.add('prev-uncertain');
          }else if(targetArcher.score[k] === "E"){
            Square.classList.add('prev-early','prev-hit');
          }else if(targetArcher.score[k] === "L"){
            Square.classList.add('prev-late','prev-hit');
          }else if(targetArcher.score[k] === "e"){
            Square.classList.add('prev-early','prev-miss');
          }else if(targetArcher.score[k] === "l"){
            Square.classList.add('prev-late','prev-miss');
          }
        }
      }else{
        const scoreSlideValue = GetElems.scoreSlideValue(i+1,j+1);
        const currentDistanceValue = Number(scoreSlideValue.textContent?.replace(/\([0-9]+\)$/,""));
        if(targetArcher.number != 0 && scoreSlideValue.textContent){
          if(currentDistanceValue != targetArcher.distance){
            scoreSlideValue.textContent = scoreSlideValue.textContent.replace(/\([0-9]+\)$/,"") + "(" +targetArcher.distance.toString() + ")";
          }else{
            scoreSlideValue.textContent = currentDistanceValue.toString();
          }
        }
      }
    }
  }
}

export function applyScoreboardData(arg:Scoreboard){
  //チーム名
  for(let i=0; i<arg.teams.length; i++){
    GetElems.teamNameElem(i+1).textContent = arg.teams[i]?.name ?? "";
  }
  //場所
  if(arg.teams.length == 1){
    GetElems.teamPlaceElem(1).textContent = "第"+(arg.shajo+1).toString()+"射場";
  }else if(1 < arg.teams.length){
    for(let i=0; i<arg.teams.length; i++){
      GetElems.teamPlaceElem(i+1).textContent = "第"+(arg.shajo+1).toString()+"射場 " + GetElems.teamSelectLabel(i+1).textContent;
    }
  }
  //選手と得点
  applyScore(arg);
}

export function clearScoreboard(arg:Scoreboard){
  for(let i=0; i<arg.teams.length; i++){
    GetElems.teamNameElem(i+1).textContent = "";
  }
  Array.from(archerElements).forEach((archer, index) => {
    archer.querySelector('.archer-number')!.textContent = "0";
    archer.querySelector('.archer-name'  )!.textContent = "";
  });
  Array.from(document.getElementsByClassName("square-button")).forEach((button, index) => {
    const elem = button.parentElement as HTMLElement;
    if(elem){
      elem.classList.remove("hit", "miss", "uncertain", "early", "late", "prev-hit", "prev-miss", "prev-uncertain", "prev-early", "prev-late");
    }
  })
}
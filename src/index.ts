import {
  addScoreboard,
  changeCommunicationState,
  clearScoreboards,
  sampleScoreboard,
  updateTimerState
} from './state'

import { 
  Scoreboard,
  MatchType } from './class/scoreboard';
import info   from './class/info';

import { getLoginStatus } from './network/api';

import { 
  generateScoreboardElements, 
  generateTeamSelectElem } 
  from './ui/generate';
import * as Opt from './ui/selectOptions';
import {
  onSelectionModeClick,
  onRegisterClick,
  onPrevClick,
  onNextClick,
  onCategoryClick,
  sidebarChangeEventHandler,
  onUndoClick,
  onRedoClick,
  onTimerClick
} from './ui/sidebarEvent';

import JSON5 from 'json5'
import { applyScoreboardData } from './ui/scoreboardView';

const version = "ver.20260401"

let isValidInfoFile = false;

const selectionModeButton = document.getElementById('selection-mode') as HTMLButtonElement;
const registerButton   = document.getElementById('register') as HTMLButtonElement;

sampleScoreboard.loadArcher(0,"1:那須与一,2:藤原秀郷,3:板額御前,4:巴御前,5:大島光義");
generateScoreboardElements( sampleScoreboard );
generateTeamSelectElem(1);
applyScoreboardData(sampleScoreboard);

const scriptVersionElem = document.getElementById("script-version")
if(scriptVersionElem)scriptVersionElem.textContent = version;

// GoogleログインとシートIDと試合の情報のjson(json5)を要求(構造でチェック)
document.getElementById('info-file')!.addEventListener('change', function(e){
  const elem = e.target as HTMLInputElement;
  if(elem.files){
    const file_reader = new FileReader();
    file_reader.onload = function(e){
      try{
        const json = JSON5.parse(file_reader.result as string);
        console.log("selectedFile",json);
        if(info.setInfo(JSON.stringify(json))){
          isValidInfoFile = true;
        }
        console.log("loaded Categories  ",info.categories);
        console.log("loaded Venue  ",     info.venue);
      }catch(e){
        console.log(e);
      }
    }
    if(elem.files[0]){
      file_reader.readAsText(elem.files[0]);
    }
  }
});


//両方揃ったら閉じる
document.getElementById('close-form')!.addEventListener('click', function(e){
  if(isValidInfoFile && getLoginStatus()){
    document.getElementById('cover')?.remove();
    applyInfo();
  }else{
    if(!isValidInfoFile) alert("設定ファイルが正しくありません");
    if(!getLoginStatus()) alert("ログインが正しくありません");
  }
});

async function applyInfo(){
  changeCommunicationState(1);
  //scoreboardsを空にしてcategoryを追加
  clearScoreboards()
  for(let i=0; i<info.categories.length; i++){
    const categoryInfo = info.categories[i];
    if(categoryInfo){
      Opt.addCategoryOption(categoryInfo.name, categoryInfo.background_color, i.toString());
      if(categoryInfo.match_type == MatchType.Team){
        addScoreboard(categoryInfo.sheet_id, MatchType.Team,       categoryInfo.team_size, categoryInfo.team_count);
      }else if(categoryInfo.match_type == MatchType.Individual){
        addScoreboard(categoryInfo.sheet_id, MatchType.Individual, categoryInfo.team_size, categoryInfo.team_count);
      }
    }
  }

  //categoryのclickイベント登録
  const categoryButtons = document.getElementsByClassName('category-input');
  for(const categoryButton of categoryButtons){
    categoryButton.addEventListener('click', onCategoryClick);
  }

  //射場の選択肢生成
  Opt.updateShajoOptions(info.venue.shajo_count);

  changeCommunicationState(-1);
}

document.getElementById('prev')!.addEventListener('click', onPrevClick);

document.getElementById('next')!.addEventListener('click', onNextClick)

document.getElementById('undo')!.addEventListener('click', onUndoClick);

document.getElementById('redo')!.addEventListener('click', onRedoClick)

registerButton.addEventListener('click', onRegisterClick);

selectionModeButton.addEventListener('click', onSelectionModeClick);

//サイドバーに変更があれば更新
Array.from(document.getElementsByClassName('match-select')).forEach((select, index) => {
  select.addEventListener('change', sidebarChangeEventHandler)
})

setInterval(updateTimerState, 1000);
document.getElementById('timer-svg')!.addEventListener('click', onTimerClick);

// 適当なところをクリックしたら['外', '中', '疑', '消']ボタンは消しておく、通信の可否も戻す
document.addEventListener('click', function (e) {
  const target = e.target as HTMLElement;
  if (target.className !== 'square-button') {
    document.getElementById("hit-button")?.remove();
    document.getElementById("miss-button")?.remove();
    document.getElementById("uncertain-button")?.remove();
    document.getElementById("erase-button")?.remove();
    document.getElementById( "early-hit-button")?.remove();
    document.getElementById(  "late-hit-button")?.remove();
    document.getElementById("early-miss-button")?.remove();
    document.getElementById( "late-miss-button")?.remove();
  }
  if( registerButton.textContent!.match(/^失敗$|^成功$/) ){
      registerButton.textContent = "登録"
    };
});

//ダブルタップによるズーム防止
document.addEventListener('dblclick', function(e){e.preventDefault()}, { passive: false });

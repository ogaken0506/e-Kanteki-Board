import {
  scoreboards,
  currentSB,
  changeCommunicationState
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
  sidebarChangeEventHandler
} from './ui/sidebarEvent';

import JSON5 from 'json5'

let isValidInfoFile = false;

const selectionModeButton = document.getElementById('selection-mode') as HTMLButtonElement;
const registerButton   = document.getElementById('register') as HTMLButtonElement;

generateScoreboardElements(currentSB);
generateTeamSelectElem(1)

// GoogleログインとシートIDと試合の情報のjson(json5)を要求(構造でチェック)
document.getElementById('info-file')!.addEventListener('change', function(e){
  let elem = e.target as HTMLInputElement;
  if(elem.files){
    let file_reader = new FileReader();
    file_reader.onload = function(e){
      try{
        let json = JSON5.parse(file_reader.result as string);
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
    file_reader.readAsText(elem.files[0]);
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
  //categoryを追加
  for(let i=0; i<info.categories.length; i++){
    Opt.addCategoryOption(info.categories[i].name, info.categories[i].background_color, i.toString());
  }
  //scoreboardを生成、初期化
  scoreboards.length = 0;
  for(let i=0; i<info.categories.length; i++){
    if(info.categories[i].match_type == MatchType.Team){
      scoreboards.push(new Scoreboard(info.categories[i].sheet_id, MatchType.Team, info.categories[i].team_size, info.categories[i].team_count));
    }
    if(info.categories[i].match_type == MatchType.Individual){
      scoreboards.push(new Scoreboard(info.categories[i].sheet_id, MatchType.Individual, info.categories[i].team_size, info.categories[i].team_count));
    }
  }

  //categoryのclickイベント登録
  let categoryButtons = document.getElementsByClassName('category-input');
  for(let i=0; i<categoryButtons.length; i++){
    categoryButtons[i].addEventListener('click', onCategoryClick)
  }

  //射場の選択肢生成
  Opt.updateShajoOptions(info.venue.shajo_count);

  changeCommunicationState(-1);
}

document.getElementById('prev')!.addEventListener('click', onPrevClick);

document.getElementById('next')!.addEventListener('click', onNextClick)

registerButton.addEventListener('click', onRegisterClick);

selectionModeButton.addEventListener('click', onSelectionModeClick);

//サイドバーに変更があれば更新
Array.from(document.getElementsByClassName('match-select')).forEach((select, index) => {
  select.addEventListener('change', sidebarChangeEventHandler)
})

// 適当なところをクリックしたら['外', '中', '疑', '消']ボタンは消しておく、通信の可否も戻す
document.addEventListener('click', function (e) {
  const target = e.target as HTMLElement;
  if (target.className !== 'square-button') {
    document.getElementById("hit-button")?.remove();
    document.getElementById("miss-button")?.remove();
    document.getElementById("uncertain-button")?.remove();
    document.getElementById("erase-button")?.remove();
  }
  if(registerButton.textContent!.match(/^失敗$|^成功$/))registerButton.textContent = "登録";
});

//ダブルタップによるズーム防止
document.addEventListener('dblclick', function(e){e.preventDefault()}, { passive: false });
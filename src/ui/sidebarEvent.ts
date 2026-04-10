import {
  getCurrentScoreboard,
  getCurrentSavedScoreboard,
  setCurrentIndex,
  isCommunicating,
  changeCommunicationState,
  isDirectTeamChoice,
  setSelectionMode,
  checkHistoryButtonState
} from '../state'
import * as GetElems from './getElems';
import * as Comm     from '../network/communication';
import info   from '../class/info';
import { generateScoreboardElements, generateTeamSelectElem } from './generate';
import * as Opt from './selectOptions';
import { applySavedScore, applyScoreboardData, clearScoreboard } from './scoreboardView';
import { refreshToken } from '../network/api';

const selectionModeButton = document.getElementById('selection-mode' ) as HTMLButtonElement;
const registerButton      = document.getElementById('register')        as HTMLButtonElement;
const roundSelectElem  = document.getElementById('round-select' ) as HTMLSelectElement;
const groupSelectElem  = document.getElementById('group-select' ) as HTMLSelectElement;
const shajoSelectElem  = document.getElementById('shajo-select' ) as HTMLSelectElement;

export async function onCategoryClick(e:Event){
  if(isCommunicating)return;
  const target = e.target as HTMLInputElement;
  const selectedIndex:number = Number(target.value);

  const selectedCategoryInfo = info.categories[selectedIndex];
  if(!selectedCategoryInfo){
    console.warn('invalid category index');
    return;
  }
  setCurrentIndex(selectedIndex);
  const currentSB = getCurrentScoreboard();
  const savedSB = getCurrentSavedScoreboard();
  generateTeamSelectElem(currentSB.teams.length);

  changeCommunicationState(1);
  document.getElementById('sidebar-content')!.style.backgroundColor = selectedCategoryInfo.background_color;
  const PromiseTeamList:Promise<string[]> = Comm.getTeamList(currentSB.sheetId, currentSB.round);
  const roundsArray = await Comm.getRoundRawValue(currentSB.sheetId);

  if(!roundsArray[0]){
    console.warn('invalid rounds data');
    return;
  }
  //roundの選択肢削除&生成
  Opt.clearRoundOptions();
  const nameColumn = roundsArray[0].indexOf("name");
  const columnNameColumn = roundsArray[0].indexOf("column_name");
  const methodColumn = roundsArray[0].indexOf("method");
  if(nameColumn != -1 && columnNameColumn != -1 && methodColumn != -1){
    const slicedRoundsArray = roundsArray.slice(1)// 1行目は項目名のため除く
    for(const round of slicedRoundsArray){
      Opt.addRoundOption(round[nameColumn], round[columnNameColumn], round[methodColumn])
    }
  }else if(nameColumn == -1){
    console.warn("name列が見つかりません");
  }else if(columnNameColumn == -1){
    console.warn("column_name列が見つかりません");
  }else if(methodColumn == -1){
    console.warn("method列が見つかりません");
  }
  roundSelectElem.selectedIndex = -1;

  //teamの選択肢削除&生成
  const teamList = await PromiseTeamList;
  Opt.updateTeamOptions(selectedCategoryInfo.team_count, teamList, sidebarChangeEventHandler);

  //groupの選択肢削除&生成
  Opt.updateGroupOptions(teamList.length, info.venue.shajo_count*currentSB.teamCount)

  //round,team,groupの選択をスコボに基づいて変更
  if(currentSB.round != ""){
    for(let i=0; i<roundSelectElem.options.length; i++){
      if(roundSelectElem.options[i]?.value == currentSB.round){
        roundSelectElem.selectedIndex = i;
        break;
      }
    }
  }
  for(let i=0; i<currentSB.teams.length; i++){
    const teamName = currentSB.teams[i]?.name;
    if(teamName){
      for(let j=0; j<GetElems.teamSelect(i+1).options.length; j++){
        if(GetElems.teamSelect(i+1).options[j]?.label == teamName){
          GetElems.teamSelect(i+1).selectedIndex = j;
          break;
        }
      }
    }
  }

  if(0<currentSB.teams.length){
    groupSelectElem.selectedIndex = Math.floor(GetElems.teamSelect(1).selectedIndex / (info.venue.shajo_count * currentSB.teamCount))
    shajoSelectElem.selectedIndex = Math.floor((GetElems.teamSelect(1).selectedIndex % (info.venue.shajo_count * currentSB.teamCount)) / currentSB.teamCount)
    currentSB.shajo = shajoSelectElem.selectedIndex;
    currentSB.groupIndex = groupSelectElem.selectedIndex;
    savedSB.shajo = shajoSelectElem.selectedIndex;
    savedSB.groupIndex = groupSelectElem.selectedIndex;
  }

  generateScoreboardElements(currentSB);
  if(currentSB.method == "distance"){
    for(let i=0; i<currentSB.teams.length; i++){
      GetElems.teamSelect(i+1).disabled = true;
    }
    groupSelectElem.disabled = true;
    shajoSelectElem.disabled = true;
  }
  //2回呼べば元に戻る
  onSelectionModeClick();
  onSelectionModeClick();
  

  //スコアボードから記録を再現
  applyScoreboardData(currentSB);
  applySavedScore(savedSB);

  changeCommunicationState(-1);
}

export async function sidebarChangeEventHandler(e:Event){
  const target = e.target as HTMLSelectElement;
  if (!target) return;
  const currentSB = getCurrentScoreboard();
  const savedSB = getCurrentSavedScoreboard();
  const misMatch = await currentSB.compare(savedSB);
  let arrangedMisMatch:string="";
  for(let i=0; i<misMatch.length; i++){
    arrangedMisMatch += misMatch[i] + "\n";
  }

  //未保存の記録がある場合は選択肢を元に戻す
  if(0 < misMatch.length){
    alert("未保存の記録があります\n"+arrangedMisMatch);
    if(target.id == "round-select"){           //段階の選択肢
      for(let i=0; i<target.options.length; i++){
        if(target.options[i]?.value == currentSB.round){
          target.selectedIndex = i;
          break;
        }
      }
    }else if(target.id.match(/^TS[0-9]+$/)){   //組の選択肢
      const teamNum = parseInt(target.id.replace(/^TS/, ""));
      const teamName = currentSB.teams[teamNum-1]?.name;
      if(teamName){
        for(let i=0; i<target.options.length; i++){
          if(target.options[i]?.value == teamName){
            target.selectedIndex = i;
            break;
          }
        }
      }
    }else if(target.id == "group-select"){     //群の選択肢
      groupSelectElem.selectedIndex = currentSB.groupIndex;
    }else if(target.id == "shajo-select"){     //射場の選択肢
      shajoSelectElem.selectedIndex = currentSB.shajo;
    }
    return;
  }

  //スコアボードを初期化
  clearScoreboard(currentSB);

  if(target.id == "round-select"){
    currentSB.round = target.value;
    const PromiseTeamList:Promise<string[]> = Comm.getTeamList(currentSB.sheetId, currentSB.round);
    const teamList = await PromiseTeamList;
    currentSB.setMethod(target.options[target.selectedIndex]?.dataset.method, teamList);
    generateTeamSelectElem(currentSB.teams.length);

    //teamの選択肢削除&生成
    Opt.updateTeamOptions(currentSB.teamCount, teamList, sidebarChangeEventHandler)
    //2回呼べば元に戻る
    onSelectionModeClick();
    onSelectionModeClick();


    //groupの選択肢削除&生成
    Opt.updateGroupOptions(teamList.length, info.venue.shajo_count*currentSB.teamCount)

    generateScoreboardElements(currentSB);
    if(currentSB.method == "distance"){
      for(let i=0; i<currentSB.teams.length; i++){
        GetElems.teamSelect(i+1).disabled = true;
      }
      groupSelectElem.disabled = true;
      shajoSelectElem.disabled = true;
    }

    if(isDirectTeamChoice && currentSB.method != "distance"){
      //round変更前に選択していたteamがround変更後にも存在する場合は選択肢をそのteamに変更
      for(let i=0; i<currentSB.teams.length; i++){
        const team = currentSB.teams[i];
        if(!team) continue;
        for(let j=0; j<GetElems.teamSelect(i+1).options.length; j++){
          if(GetElems.teamSelect(i+1).options[j]?.label == team.name){
            GetElems.teamSelect(i+1).selectedIndex = j;
            break;
          }
        }
        if(GetElems.teamSelect(i+1).selectedIndex == -1){
          team.name = "";
        }
      }
      if(GetElems.teamSelect(1).selectedIndex != -1){
        groupSelectElem.selectedIndex = Math.floor(GetElems.teamSelect(1).selectedIndex / (info.venue.shajo_count * currentSB.teamCount))
        shajoSelectElem.selectedIndex = Math.floor((GetElems.teamSelect(1).selectedIndex % (info.venue.shajo_count * currentSB.teamCount)) / currentSB.teamCount)
      }
    }else if(!isDirectTeamChoice){
      //round変更前に選択していたgroupIndexがround変更後にも存在する場合は選択肢をそのgroupIndexに変更
      if(groupSelectElem.options.length >= currentSB.groupIndex){
        groupSelectElem.selectedIndex = currentSB.groupIndex;
        for(let i=0; i<currentSB.teams.length; i++){
          GetElems.teamSelect(i+1).selectedIndex = (groupSelectElem.selectedIndex * info.venue.shajo_count + shajoSelectElem.selectedIndex)*currentSB.teamCount + i;
          const team = currentSB.teams[i];
          if(team){
            team.name = GetElems.teamSelect(i+1).value;
          }else{
            console.warn('Scoreboard.Team['+i+']が存在しないことになっています');
          }
        }
      }else{
        currentSB.groupIndex = -1;
      }
    }
  }
  if(target.id.match(/^TS[0-9]+$/)){
    const teamNum = parseInt(target.id.replace(/^TS/, ""));
    const team = currentSB.teams[teamNum-1];
    if(team){
      team.name = target.value;
      if(teamNum == 1){
        groupSelectElem.selectedIndex = Math.floor(GetElems.teamSelect(1).selectedIndex / (info.venue.shajo_count * currentSB.teamCount))
        shajoSelectElem.selectedIndex = Math.floor((GetElems.teamSelect(1).selectedIndex % (info.venue.shajo_count * currentSB.teamCount)) / currentSB.teamCount)
        currentSB.shajo = shajoSelectElem.selectedIndex;
        currentSB.groupIndex = groupSelectElem.selectedIndex;
      }
    }else{
      console.warn('組の選択欄に対応するScoreboard.Teamが存在しないことになっています');
    }
  }
  if(target.id == "group-select"){
    currentSB.groupIndex = parseInt(target.value);
    for(let i=0; i<currentSB.teamCount; i++){
      GetElems.teamSelect(i+1).selectedIndex = (groupSelectElem.selectedIndex * info.venue.shajo_count + shajoSelectElem.selectedIndex)*currentSB.teamCount + i;
      const team = currentSB.teams[i];
      if(team){
        team.name = GetElems.teamSelect(i+1).value;
      }else{
        console.warn('Scoreboard.Team['+i+']が存在しないことになっています');
      }
    }
  }
  if(target.id == "shajo-select"){
    currentSB.shajo = parseInt(target.value);
    for(let i=0; i<currentSB.teamCount; i++){
      GetElems.teamSelect(i+1).selectedIndex = (groupSelectElem.selectedIndex * info.venue.shajo_count + shajoSelectElem.selectedIndex)*currentSB.teamCount + i;
      const team = currentSB.teams[i];
      if(team){
        team.name = GetElems.teamSelect(i+1).value;
      }else{
        console.warn('Scoreboard.Team['+i+']が存在しないことになっています');
      }
    }
  }
  changeCommunicationState(1);
  await Comm.getScore(currentSB);
  applyScoreboardData(currentSB);
  savedSB.loadScoreboard(currentSB);
  applySavedScore(savedSB);
  checkHistoryButtonState();
  changeCommunicationState(-1);
}

export function onNextClick(e:Event){
  if(isCommunicating)return;
  if(groupSelectElem.options.length <= groupSelectElem.selectedIndex + 1){
    return;
  }
  ++groupSelectElem.selectedIndex;
  groupSelectElem.dispatchEvent(new Event('change'));
}

export function onPrevClick(e:Event){
  if(isCommunicating)return;
  if(groupSelectElem.selectedIndex <= 0){
    return;
  }
  --groupSelectElem.selectedIndex;
  groupSelectElem.dispatchEvent(new Event('change'));
}

export async function onRegisterClick(e:Event){
  if(isCommunicating)return;
  const currentSB = getCurrentScoreboard();
  const savedSB = getCurrentSavedScoreboard();
  changeCommunicationState(1,"登録中...");
  await Comm.registerScore(currentSB);
  changeCommunicationState(0,"確認中...");
  if(await Comm.verifyUpdate(currentSB)) {
    registerButton.textContent = "成功";
    savedSB.loadScoreboard(currentSB);
    applySavedScore(savedSB);
  }else{
    registerButton.textContent = "失敗";

  }
  changeCommunicationState(-1);
}

export function onSelectionModeClick(e?:Event){
  const currentSB = getCurrentScoreboard();
  if(isDirectTeamChoice){//[組]→[群,射場]
    setSelectionMode(false);
    for(let i=0; i<currentSB.teams.length; i++){
      GetElems.teamSelect(i+1).disabled = true;
    }
    groupSelectElem.disabled = false;
    shajoSelectElem.disabled = false;
    selectionModeButton.textContent = "[組]を直接指定する";
  }else{//[群,射場]→[組]
    setSelectionMode(true);
    for(let i=0; i<currentSB.teams.length; i++){
      GetElems.teamSelect(i+1).disabled = false;
    }
    groupSelectElem.disabled = true;
    shajoSelectElem.disabled = true;
    selectionModeButton.textContent = "[群,射場]で[組]を指定する";
  }
  if(currentSB.method == "distance"){
    for(let i=0; i<currentSB.teams.length; i++){
      GetElems.teamSelect(i+1).disabled = true;
    }
    groupSelectElem.disabled = true;
    shajoSelectElem.disabled = true;
  }
}

export function onUndoClick(e:Event){
  const currentSB = getCurrentScoreboard();
  const savedSB = getCurrentSavedScoreboard();
  currentSB.undoHistory();
  applyScoreboardData(currentSB);
  applySavedScore(savedSB);
  checkHistoryButtonState();
}

export function onRedoClick(e:Event){
  const currentSB = getCurrentScoreboard();
  const savedSB = getCurrentSavedScoreboard();
  currentSB.redoHistory();
  applyScoreboardData(currentSB);
  applySavedScore(savedSB);
  checkHistoryButtonState();
}

export function onTimerClick(e:Event){
  const timerSvg = e.currentTarget as HTMLElement | SVGElement;
  if(timerSvg.classList.contains('blink')) refreshToken(true);
}
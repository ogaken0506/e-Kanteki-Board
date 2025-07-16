import {
  getCurrentScoreboard,
  getCurrentSavedScoreboard,
  setCurrentIndex,
  isCommunicating,
  changeCommunicationState,
  isDirectTeamChoice,
  setSelectionMode
} from '../state'
import * as GetElems from './getElems';
import * as Comm     from '../network/communication';
import info   from '../class/info';
import { generateScoreboardElements, generateTeamSelectElem } from './generate';
import * as Opt from './selectOptions';
import { applyScoreboardData, clearScoreboard } from './scoreboardView';

const selectionModeButton = document.getElementById('selection-mode' ) as HTMLButtonElement;
const registerButton      = document.getElementById('register')        as HTMLButtonElement;
const roundSelectElem  = document.getElementById('round-select' ) as HTMLSelectElement;
const groupSelectElem  = document.getElementById('group-select' ) as HTMLSelectElement;
const shajoSelectElem  = document.getElementById('shajo-select' ) as HTMLSelectElement;

export async function onCategoryClick(e:Event){
  if(isCommunicating)return;
  const target = e.target as HTMLInputElement;
  const selectedIndex:number = Number(target.value);

  setCurrentIndex(selectedIndex);
  let currentSB = getCurrentScoreboard();
  generateTeamSelectElem(currentSB.teams.length);

  changeCommunicationState(1);
  document.getElementById('sidebar-content')!.style.backgroundColor = info.categories[selectedIndex].background_color;
  let PromiseTeamList:Promise<string[]> = Comm.getTeamList(currentSB.sheetId, currentSB.round);

  //roundの選択肢削除&生成
  Opt.clearRoundOptions();
  let rounds = info.categories[selectedIndex].rounds;
  for(let i=0; i<rounds.length; i++){
    Opt.addRoundOption(rounds[i].name, rounds[i].short_name, rounds[i].method)
  }
  roundSelectElem.selectedIndex = -1;

  //teamの選択肢削除&生成
  let teamList = await PromiseTeamList;
  Opt.updateTeamOptions(info.categories[selectedIndex].team_count, teamList, sidebarChangeEventHandler);

  //groupの選択肢削除&生成
  Opt.updateGroupOptions(teamList.length, info.venue.shajo_count*currentSB.teamCount)

  //round,team,groupの選択をスコボに基づいて変更
  if(currentSB.round != ""){
    for(let i=0; i<roundSelectElem.options.length; i++){
      if(roundSelectElem.options[i].value == currentSB.round){
        roundSelectElem.selectedIndex = i;
        break;
      }
    }
  }
  for(let i=0; i<currentSB.teams.length; i++){
    if(currentSB.teams[i].name != ""){
      for(let j=0; j<GetElems.teamSelect(i+1).options.length; j++){
        if(GetElems.teamSelect(i+1).options[j].label == currentSB.teams[i].name){
          GetElems.teamSelect(i+1).selectedIndex = j;
          break;
        }
      }
    }
  }

  groupSelectElem.selectedIndex = currentSB.group;

  shajoSelectElem.selectedIndex = currentSB.shajo;

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

  changeCommunicationState(-1);
}

export async function sidebarChangeEventHandler(e:Event){
  const target = e.target as HTMLSelectElement;
  if (!target) return;
  let currentSB = getCurrentScoreboard();
  let savedSB = getCurrentSavedScoreboard();
  let misMatch = await currentSB.compare(savedSB);

  //未保存の記録がある場合は選択肢を元に戻す
  if(0 < misMatch.length){
    alert("未保存の記録があります\n"+misMatch.toString());
    if(target.id == "round-select"){
      for(let i=0; i<target.options.length; i++){
        if(target.options[i].value == currentSB.round){
          target.selectedIndex = i;
          break;
        }
      }
    }else if(target.id.match(/^TS[0-9]+$/)){
      let teamNum = parseInt(target.id.replace(/^TS/, ""));
      for(let i=0; i<target.options.length; i++){
        if(target.options[i].value == currentSB.teams[teamNum-1].name){
          target.selectedIndex = i;
          break;
        }
      }
    }else if(target.id == "group-select"){
      groupSelectElem.selectedIndex = currentSB.group;
    }else if(target.id == "shajo-select"){
      shajoSelectElem.selectedIndex = currentSB.shajo;
    }
    return;
  }

  //スコアボードを初期化
  clearScoreboard(currentSB);

  if(target.id == "round-select"){
    currentSB.round = target.value;
    let PromiseTeamList:Promise<string[]> = Comm.getTeamList(currentSB.sheetId, currentSB.round);
    let teamList = await PromiseTeamList;
    currentSB.setMethod(target.options[target.selectedIndex].dataset.method, teamList);
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
        for(let j=0; j<GetElems.teamSelect(i+1).options.length; j++){
          if(GetElems.teamSelect(i+1).options[j].label == currentSB.teams[i].name){
            GetElems.teamSelect(i+1).selectedIndex = j;
            break;
          }
        }
        if(GetElems.teamSelect(i+1).selectedIndex == -1){
          currentSB.teams[i].name = "";
        }
      }
      if(GetElems.teamSelect(1).selectedIndex != -1){
        groupSelectElem.selectedIndex = Math.floor(GetElems.teamSelect(1).selectedIndex / (info.venue.shajo_count * currentSB.teamCount))
        shajoSelectElem.selectedIndex = Math.floor((GetElems.teamSelect(1).selectedIndex % (info.venue.shajo_count * currentSB.teamCount)) / currentSB.teamCount)
      }
    }else if(!isDirectTeamChoice){
      //round変更前に選択していたgroupがround変更後にも存在する場合は選択肢をそのgroupに変更
      if(groupSelectElem.options.length >= currentSB.group){
        groupSelectElem.selectedIndex = currentSB.group;
        for(let i=0; i<currentSB.teams.length; i++){
          GetElems.teamSelect(i+1).selectedIndex = (groupSelectElem.selectedIndex * info.venue.shajo_count + shajoSelectElem.selectedIndex)*currentSB.teamCount + i;
          currentSB.teams[i].name = GetElems.teamSelect(i+1).value;
        }
      }else{
        currentSB.group = -1;
      }
    }
  }
  if(target.id.match(/^TS[0-9]+$/)){
    let teamNum = parseInt(target.id.replace(/^TS/, ""));
    currentSB.teams[teamNum-1].name = target.value;
    if(teamNum == 1){
      groupSelectElem.selectedIndex = Math.floor(GetElems.teamSelect(1).selectedIndex / (info.venue.shajo_count * currentSB.teamCount))
      shajoSelectElem.selectedIndex = Math.floor((GetElems.teamSelect(1).selectedIndex % (info.venue.shajo_count * currentSB.teamCount)) / currentSB.teamCount)
      currentSB.shajo = shajoSelectElem.selectedIndex;
      currentSB.group = groupSelectElem.selectedIndex;
    }
  }
  if(target.id == "group-select"){
    currentSB.group = parseInt(target.value);
    for(let i=0; i<currentSB.teamCount; i++){
      GetElems.teamSelect(i+1).selectedIndex = (groupSelectElem.selectedIndex * info.venue.shajo_count + shajoSelectElem.selectedIndex)*currentSB.teamCount + i;
      currentSB.teams[i].name = GetElems.teamSelect(i+1).value;
    }
  }
  if(target.id == "shajo-select"){
    currentSB.shajo = parseInt(target.value);
    for(let i=0; i<currentSB.teamCount; i++){
      GetElems.teamSelect(i+1).selectedIndex = (groupSelectElem.selectedIndex * info.venue.shajo_count + shajoSelectElem.selectedIndex)*currentSB.teamCount + i;
      currentSB.teams[i].name = GetElems.teamSelect(i+1).value;
    }
  }
  changeCommunicationState(1);
  await Comm.getScore(currentSB);
  applyScoreboardData(currentSB);
  savedSB.loadScoreboard(currentSB);
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
  let currentSB = getCurrentScoreboard();
  let savedSB = getCurrentSavedScoreboard();
  changeCommunicationState(1);
  await Comm.registerScore(currentSB);
  if(await Comm.verifyUpdate(currentSB)) {
    registerButton.textContent = "成功";
    savedSB.loadScoreboard(currentSB);
  }else{
    registerButton.textContent = "失敗";

  }
  changeCommunicationState(-1);
}

export function onSelectionModeClick(e?:Event){
  let currentSB = getCurrentScoreboard();
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
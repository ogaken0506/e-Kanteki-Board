import {Scoreboard, MatchType, MatchMethod} from '../class/scoreboard';
import { getValues, updateValues } from './api';

const ORDER_RANGE         =         'ORDER!A1:ZZ1000';
const RECEIVED_DATA_RANGE = 'RECEIVED_DATA!A1:ZZ1000';

export async function getTeamList(id:string, round:string): Promise<string[]>{
  let data = await getValues(id, ORDER_RANGE);
  let column = -1;
  if(data && round){
    column = data[0].indexOf(round+"-team");
    if(column == -1)return [];
    data = data.slice(1); //配列の1番目は項目名が入っているため除去
    return data.map((eachRowData: any) => eachRowData[column]).filter((value) => (value != "" && value != undefined));
  }
  return [];
}

export async function getScore(arg:Scoreboard): Promise<Scoreboard> {
  try {
    if(arg.method != MatchMethod.Distance){
      arg.clearArchers();
      arg.clearScore();
      let teamSize = arg.teamSize;
      let data = await getValues(arg.sheetId, RECEIVED_DATA_RANGE);
      if(data){
        for(let i=0; i<arg.teamCount; i++){
          //まず既存の記録チェック
          let archerData = retrieveData(data, arg.teams[i].name, arg.round + "-archer" );
          let scoreData  = retrieveData(data, arg.teams[i].name, arg.round + "-score" );
          if(archerData && scoreData){
            if(archerData.split(',').length == teamSize && scoreData.split(',').length == teamSize){
              arg.loadArcher(arg.teams[i].name, archerData);
              arg.loadScore(arg.teams[i].name,scoreData);
              continue;
            }else{
              console.warn("チーム名：",arg.teams[i].name)
              console.warn("段階名：",arg.round)
              console.warn("データの形式が合いませんでした。")
            }
          }
          //記録がない場合、受信データの形式が合わない場合、ORDERシートから立順を取得、スコアは空白
          archerData = await retrieveOrderData(arg, i);
          arg.clearArchers(arg.teams[i].name);
          arg.clearScore(arg.teams[i].name);
          if(archerData.split(',').length == teamSize){
            arg.loadArcher(arg.teams[i].name, archerData);
            continue;
          }else if(archerData){
            console.warn("チーム名：",arg.teams[i].name)
            console.warn("段階名：",arg.round)
            console.warn("選手データの形式が合いませんでした。")
            arg.clearArchers(arg.teams[i].name);
            continue;
          }
        }
        return arg;
      }
    }else if(arg.method == MatchMethod.Distance){
      let teamSize = arg.teamSize;
      arg.clearArchers();
      arg.clearDistance();
      let data = await getValues(arg.sheetId, RECEIVED_DATA_RANGE);
      if(data){
        for(let i=0; i<arg.teams.length; i++){
          //まず既存の記録チェック
          let archerData = retrieveData(data, arg.teams[i].name, arg.round + "-archer" );
          let scoreData  = retrieveData(data, arg.teams[i].name, arg.round + "-score" );
          if(archerData && scoreData){
            if(archerData.split(',').length == teamSize && scoreData.split(',').length == teamSize){
              arg.loadArcher(arg.teams[i].name, archerData);
              arg.loadDistance(arg.teams[i].name,scoreData);
              continue;
            }else{
              console.warn("チーム名：",arg.teams[i].name)
              console.warn("段階名：",arg.round)
              console.warn("データの形式が合いませんでした。")
            }
          }
          //記録がない場合、受信データの形式が合わない場合、ORDERシートから立順を取得、スコアは空白
          archerData = await retrieveOrderData(arg, i);
          arg.clearArchers(arg.teams[i].name);
          arg.clearDistance(arg.teams[i].name);
          if(archerData.split(',').length == teamSize){
            arg.loadArcher(arg.teams[i].name, archerData);
            continue;
          }else if(archerData){
            console.warn("チーム名：",arg.teams[i].name)
            console.warn("段階名：",arg.round)
            console.warn("選手データの形式が合いませんでした。")
            arg.clearArchers(arg.teams[i].name);
            continue;
          }
        }
        return arg;
      }
    }
  } catch (error) {
    console.log(error); // エラー表示
    return new Scoreboard(arg.sheetId, arg.matchType, arg.teamSize, arg.teamCount);
  }
  return arg;
}

export async function registerScore(arg:Scoreboard){
  if(arg.matchType == MatchType.Team){
    let data = await getValues(arg.sheetId, RECEIVED_DATA_RANGE);
    if(data){
      let column = data[0].indexOf(arg.round+'-archer');
      let columnLetter = numToAlphabet(column);

      for(let i=0; i<arg.teamCount; i++){
        let row = data.map((eachRowData: any) => eachRowData[0]).indexOf(arg.teams[i].name);
        let values:string[][] = [[arg.getArcherData(i), arg.getScoreData(i)]];
        let archerCount = arg.teamSize;
        let matches = arg.getArcherData(i).match(/(^0:|,0:)/g);
        if (matches) archerCount -= matches.length;
        if(0<archerCount)await updateValues(arg.sheetId, 'RECEIVED_DATA!'+columnLetter+(row+1).toString(), values)
      }
    }
  }
  if(arg.matchType == MatchType.Individual && arg.method != MatchMethod.Distance){
    let data = await getValues(arg.sheetId, RECEIVED_DATA_RANGE);
    if(data && arg.shajo != -1){
      let column = data[0].indexOf(arg.round+'-archer');
      let columnLetter = numToAlphabet(column);
      let row = data.map((eachRowData: any) => eachRowData[0]).indexOf(arg.teams[0].name);
      
      let values:string[][] = [[arg.getArcherData(), arg.getScoreData()]];

      await updateValues(arg.sheetId, 'RECEIVED_DATA!'+columnLetter+(row+1).toString(), values)
    }
  }
  if(arg.method == MatchMethod.Distance){
    let data = await getValues(arg.sheetId, RECEIVED_DATA_RANGE);
    if(data){
      let column = data[0].indexOf(arg.round+'-archer');
      let columnLetter = numToAlphabet(column);

      for(let i=0; i<arg.teams.length; i++){
        let row = data.map((eachRowData: any) => eachRowData[0]).indexOf(arg.teams[i].name);
        let values:string[][] = [[arg.getArcherData(i), arg.getDistanceData(i)]];
        let archerCount = arg.teamSize;
        let matches = arg.getArcherData(i).match(/(^0:|,0:)/g);
        if (matches) archerCount -= matches.length;
        if(0<archerCount)await updateValues(arg.sheetId, 'RECEIVED_DATA!'+columnLetter+(row+1).toString(), values)
      }
    }
  }
}


async function retrieveOrderData(arg:Scoreboard, teamIndex:number):Promise<string>{
  let teamColumn = -1;
  let archerColumn = -1;
  let index = -1;
  let data = await getValues(arg.sheetId, ORDER_RANGE);
  let orderData:string = "";
  if(teamIndex < 0 || arg.teams.length <= teamIndex) return "";
  if(data){
    teamColumn = data[0].indexOf(arg.round + "-team");
    archerColumn = data[0].indexOf(arg.round + "-archer");
    if(teamColumn != -1 && archerColumn != -1){
      if(arg.teams[0].name!="")index   = data.map((eachRowData: any) => eachRowData[teamColumn]).indexOf(arg.teams[teamIndex].name);
      if(index != -1){
        let orderStr = data[index][archerColumn]
        for(let i=0; i<arg.teamSize;i++){
          if(orderStr.split(",")[i]){
            orderData += orderStr.split(",")[i] + ",";
          }else{
            orderData += ",";
          }
        }
      }
    }
  }
  if(orderData.match(/,$/)){
    orderData = orderData.slice(0,-1);
  }
  return orderData;
}

function retrieveData(source:string[][], key:string, header:string):string{
  let column = source[0].indexOf(header);
  let row = source.map((eachRowData: any) => eachRowData[0]).indexOf(key);
  if(column == -1 || row == -1) return "";
  return source[row][column];
};

function numToAlphabet(index:number):string{
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if(0<=index && index<26)return alphabet[index];
  if(26<=index)return alphabet[Math.floor(index / 26)-1]+alphabet[index%26]
  return "";
}

export async function verifyUpdate(arg:Scoreboard):Promise<boolean>{
  let uploadedScore = new Scoreboard(arg.sheetId, arg.matchType, arg.teamSize, arg.teamCount);
  uploadedScore.round = arg.round;
  uploadedScore.method = arg.method;
  uploadedScore.teams = [];
  for(let i=0; i<arg.teams.length; i++){
    uploadedScore.teams.push({name:arg.teams[i].name, archers:[]});
    for(let j=0; j<arg.teams[i].archers.length; j++){
      uploadedScore.teams[i].archers.push({ name: "", number: 0, score: ["#","#","#","#"] , distance: 0})
    }
  }
  
  await getScore(uploadedScore)
  for(let i=0; i<arg.teams.length; i++){
    if(uploadedScore.teams[i].name != arg.teams[i].name) return false;
    for(let j=0; j<arg.teams[i].archers.length; j++){
      if(uploadedScore.teams[i].archers[j].number           != arg.teams[i].archers[j].number)           {console.warn("uploaded",uploadedScore.teams[i].archers[j].number,  "current",arg.teams[i].archers[j].number);  return false;}
      if(uploadedScore.teams[i].archers[j].name             != arg.teams[i].archers[j].name)             {console.warn("uploaded",uploadedScore.teams[i].archers[j].name,    "current",arg.teams[i].archers[j].name);    return false;}
      if(uploadedScore.teams[i].archers[j].score.toString() != arg.teams[i].archers[j].score.toString()) {console.warn("uploaded",uploadedScore.teams[i].archers[j].score,   "current",arg.teams[i].archers[j].score);   return false;}
      if(uploadedScore.teams[i].archers[j].distance         != arg.teams[i].archers[j].distance)         {console.warn("uploaded",uploadedScore.teams[i].archers[j].distance,"current",arg.teams[i].archers[j].distance);return false;}
      console.log("team:"+i.toString()+".archer:"+j.toString()+".ok")
    }
  }
  return true;
}
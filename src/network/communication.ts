import {Scoreboard, MatchType, MatchMethod} from '../class/scoreboard';
import { getValues, updateValues } from './api';

const ORDER_RANGE         =         'ORDER!A1:GZ1000';
const RECEIVED_DATA_RANGE = 'RECEIVED_DATA!A1:GZ1000';
const ROUNDS_DATA_RANGE   =        'ROUNDS!A1:Z100';

export async function getTeamList(id:string, round:string): Promise<string[]>{
  let data = await getValues(id, ORDER_RANGE);
  let column = -1;
  if(data && data[0] && round){
    column = data[0].indexOf(round+"-team");
    if(column == -1)return [];
    data = data.slice(1); //配列の1番目は項目名が入っているため除去
    return data.map((eachRowData: any) => eachRowData[column]).filter((value) => (value != "" && value != undefined));
  }
  return [];
}

export async function getRoundRawValue(id:string): Promise<string[][]>{
  const data = await getValues(id, ROUNDS_DATA_RANGE);
  const header = data?.[0];
  if(header){
    //by Gemini
    const targetHeaders = ["name", "column_name", "method"];
    // 対象の列インデックスを抽出
    const targetIndexes = header
      .map((value, index) => targetHeaders.includes(value) ? index : -1)
      .filter(index => index !== -1);
    // 抽出
    const filteredData = data.map(row => 
      targetIndexes.map(i => {
        const val = row[i];
        return typeof val === "string" ? val : ""; // 確実に string を返す
      })
    );
    return filteredData;
  }
  return [[]];
}

export async function getScore(arg:Scoreboard): Promise<Scoreboard> {
  try {
    if(arg.method != MatchMethod.Distance){
      arg.clearArchers();
      arg.clearScore();
      arg.clearHistory();
      const teamSize = arg.teamSize;
      const data = await getValues(arg.sheetId, RECEIVED_DATA_RANGE);
      if(data){
        for(let i=0; i<arg.teamCount; i++){
          const targetTeam = arg.teams[i];
          if(!targetTeam){
            console.warn('Scoreboard.Team['+i+']が存在しないことになっています');
            continue;
          }
          //まず既存の記録チェック
          let archerData = retrieveData(data, targetTeam.name, arg.round + "-archer" );
          const scoreData  = retrieveData(data, targetTeam.name, arg.round + "-score"  );
          if(archerData && scoreData){
            if(archerDataLength(archerData) == teamSize && scoreData.split(',').length == teamSize){
              arg.loadArcher(targetTeam.name, archerData);
              arg.loadScore( targetTeam.name,  scoreData);
              continue;
            }else{
              console.warn("チーム名：",targetTeam.name)
              console.warn("段階名：",arg.round)
              console.warn("データの形式が合いませんでした。")
            }
          }
          //記録がない場合、受信データの形式が合わない場合、ORDERシートから立順を取得、スコアは空白
          archerData = await retrieveOrderData(arg, i);
          arg.clearArchers(targetTeam.name);
          arg.clearScore(targetTeam.name);
          if(archerDataLength(archerData) == teamSize){
            arg.loadArcher(targetTeam.name, archerData);
            continue;
          }else if(archerData){
            console.warn("チーム名：",targetTeam.name)
            console.warn("段階名：",arg.round)
            console.warn("選手データの形式が合いませんでした。")
            arg.clearArchers(targetTeam.name);
            continue;
          }
        }
        return arg;
      }
    }else if(arg.method == MatchMethod.Distance){
      const teamSize = arg.teamSize;
      arg.clearArchers();
      arg.clearDistance();
      const data = await getValues(arg.sheetId, RECEIVED_DATA_RANGE);
      if(data){
        for(let i=0; i<arg.teams.length; i++){
          const targetTeam = arg.teams[i];
          if(!targetTeam){
            console.warn('Scoreboard.Team['+i+']が存在しないことになっています');
            continue;
          }
          //まず既存の記録チェック
          let archerData = retrieveData(data, targetTeam.name, arg.round + "-archer" );
          const scoreData  = retrieveData(data, targetTeam.name, arg.round + "-score"  );
          if(archerData && scoreData){
            if(archerDataLength(archerData) == teamSize && scoreData.split(',').length == teamSize){
              arg.loadArcher(targetTeam.name, archerData);
              arg.loadDistance(targetTeam.name,scoreData);
              continue;
            }else{
              console.warn("チーム名：",targetTeam.name)
              console.warn("段階名：",arg.round)
              console.warn("データの形式が合いませんでした。")
            }
          }
          //記録がない場合、受信データの形式が合わない場合、ORDERシートから立順を取得、スコアは空白
          archerData = await retrieveOrderData(arg, i);
          arg.clearArchers(targetTeam.name);
          arg.clearDistance(targetTeam.name);
          if(archerDataLength(archerData) == teamSize){
            arg.loadArcher(targetTeam.name, archerData);
            continue;
          }else if(archerData){
            console.warn("チーム名：",targetTeam.name)
            console.warn("段階名：",arg.round)
            console.warn("選手データの形式が合いませんでした。")
            arg.clearArchers(targetTeam.name);
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
  let data = await getValues(arg.sheetId, RECEIVED_DATA_RANGE);
  if(data && data[0]){
    const column = data[0].indexOf(arg.round+'-archer');
    const columnLetter = numToAlphabet(column);
    if(arg.matchType == MatchType.Team && arg.method != MatchMethod.Distance){
      for(let i=0; i<arg.teamCount; i++){
        const team = arg.teams[i];
        if(!team){
          console.warn('T'+i+'が存在しないことになっています');
          continue;
        }
        const row = data.map((eachRowData: any) => eachRowData[0]).indexOf(team.name);
        const values:string[][] = [[arg.getArcherData(i), arg.getScoreData(i)]];
        let archerCount = arg.teamSize;
        const matches = arg.getArcherData(i).match(/(^0:|,0:)/g);
        if (matches) archerCount -= matches.length;
        if(0<archerCount)await updateValues(arg.sheetId, 'RECEIVED_DATA!'+columnLetter+(row+1).toString(), values)
      }
    }else if(arg.matchType == MatchType.Individual && arg.method != MatchMethod.Distance){
      if(arg.shajo != -1 && arg.teams[0]){
        const row = data.map((eachRowData: any) => eachRowData[0]).indexOf(arg.teams[0].name);
        
        const values:string[][] = [[arg.getArcherData(), arg.getScoreData()]];

        await updateValues(arg.sheetId, 'RECEIVED_DATA!'+columnLetter+(row+1).toString(), values)
      }
    }else if(arg.method == MatchMethod.Distance){
      for(let i=0; i<arg.teams.length; i++){
        const team = arg.teams[i];
        if(!team){
          console.warn('T'+i+'が存在しないことになっています');
          continue;
        }
        const row = data.map((eachRowData: any) => eachRowData[0]).indexOf(team.name);
        const values:string[][] = [[arg.getArcherData(i), arg.getDistanceData(i)]];
        let archerCount = arg.teamSize;
        const matches = arg.getArcherData(i).match(/(^0:|,0:)/g);
        if (matches) archerCount -= matches.length;
        if(0<archerCount)await updateValues(arg.sheetId, 'RECEIVED_DATA!'+columnLetter+(row+1).toString(), values)
      }
    }
  }
}


async function retrieveOrderData(arg:Scoreboard, teamIndex:number):Promise<string>{
  const targetTeam = arg.teams[teamIndex];
  let index = -1;
  const data = await getValues(arg.sheetId, ORDER_RANGE);
  let orderData = "";
  if(!targetTeam) return "";
  if(data && data[0]){
    const teamColumn = data[0].indexOf(arg.round + "-team");
    const archerColumn = data[0].indexOf(arg.round + "-archer");
    if(teamColumn != -1 && archerColumn != -1){
      if(targetTeam.name != ""){
        index = data.map((eachRowData: any) => eachRowData[teamColumn]).indexOf(targetTeam.name);
      }
      if(index != -1){
        orderData = data[index]?.[archerColumn] ?? "";
      }
    }
  }
  return orderData;
}

function retrieveData(source:string[][], key:string, header:string):string{
  const column = source[0]?.indexOf(header) ?? -1;
  const row = source.map((eachRowData: any) => eachRowData[0]).indexOf(key);
  if(column == -1 || row == -1) return "";
  return source[row]?.[column] ?? "";
};

function numToAlphabet(index: number): string {
  if (index < 0) return "";
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  
  const char = alphabet.charAt(index % 26);
  const remainder = Math.floor(index / 26) - 1;

  if (remainder < 0) {
    return char;
  }
  return numToAlphabet(remainder) + char;
}

function archerDataLength(data:string):number{
  const archerCount = data.split(',').length;
  for(let i=0; i<archerCount; i++){
    const archerData = data.split(',')[i];
    if(!archerData) continue;
    const archerNumber = parseInt(archerData.split(':')[0] ?? "NaN");
    if(isNaN(archerNumber)){
      return -1;
    }
    const archerName = archerData.split(':')[1];
    if(archerName == undefined){
      return -1;
    }
  }
  return archerCount;
}

export async function verifyUpdate(arg:Scoreboard):Promise<boolean>{
  const uploadedScore = new Scoreboard(arg.sheetId, arg.matchType, arg.teamSize, arg.teamCount);
  uploadedScore.loadScoreboard(arg);
  uploadedScore.clearArchers();
  
  await getScore(uploadedScore)
  const differences = await arg.compare(uploadedScore);
  if(0 < differences.length){
    console.warn(differences);
    return false
  };
  return true;
}
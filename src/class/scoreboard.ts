export interface Archer {
  name  : string;
  number: number;
  score : string[];
  distance: number;
}
export interface Team{
  name :string;
  archers: Archer[];
}
export const enum MatchType{
  Team      ='team',
  Individual='individual'
}
export const enum MatchMethod{
  Normal   ='normal',
  ShootOff ='shoot-off',
  Distance ='distance'
}

export class Scoreboard {
  sheetId:string;
  matchType:MatchType;

  teams: Team[];
  teamSize:number;
  teamCount:number;
  round: string;
  group: number;
  shajo: number;       //0:第1射場, 1:第2射場, 2:第3射場, ...
  method: MatchMethod;

  constructor(sheetId:string, matchType:MatchType, teamSize:number, teamCount:number) {
    this.sheetId = sheetId;
    this.matchType = matchType;

    this.teamSize = teamSize;
    this.teamCount = teamCount;
    this.teams = Array.from({ length: teamCount }, () => ({
      name :"",
      archers:Array.from({ length: teamSize }, () => ({ name: "", number: 0, score: ["#","#","#","#"] , distance: 0}))
    }));
    this.round = "";
    this.group = -1;
    this.shajo = 0;
    this.method = MatchMethod.Normal;
  }

  setMethod(str:string|undefined, teamList?:string[]){
    if(str == "shoot-off"){
      this.method = MatchMethod.ShootOff;
      if(this.teamCount != this.teams.length){
        this.teams = Array.from({ length: this.teamCount }, () => ({
          name :"",
          archers:Array.from({ length: this.teamSize }, () => ({ name: "", number: 0, score: ["#","#","#","#"] , distance: 0}))
        }))
      };
    }else if(str == "distance"){
      this.method = MatchMethod.Distance;
      if(teamList != undefined){
        this.teams = Array.from({ length: teamList.length }, (v,i) => ({
          name :teamList[i],
          archers:Array.from({ length: this.teamSize }, () => ({ name: "", number: 0, score: ["#","#","#","#"] , distance: 0}))
        }));
      }else{
        this.teams = [];
      }
    }else {
      this.method = MatchMethod.Normal;
      if(this.teamCount != this.teams.length){
        this.teams = Array.from({ length: this.teamCount }, () => ({
          name :"",
          archers:Array.from({ length: this.teamSize }, () => ({ name: "", number: 0, score: ["#","#","#","#"] , distance: 0}))
        }))
      };
    }
  }

  loadArcher(indexOrName:number|string, dataStr:string){
    let index = this.getTeamIndex(indexOrName);
    if(index < 0 || this.teams.length <= index) return;
    for(let i = 0; i < this.teamSize; i++){
      this.clearArchers(index, i)
      if(dataStr.split(',')[i]){
        if(!isNaN(parseInt(dataStr.split(',')[i].split(':')[0], 10)) && dataStr.split(',')[i].split(':')[1]){
          this.teams[index].archers[i].number = parseInt(dataStr.split(',')[i].split(':')[0], 10);
          this.teams[index].archers[i].name   =          dataStr.split(',')[i].split(':')[1];
        }
      }
    }
  }

  loadScore(indexOrName:number|string, dataStr:string){
    let index = this.getTeamIndex(indexOrName);
    if(index < 0 || this.teams.length <= index) return;
    for(let i = 0; i < this.teamSize; i++){
      if(dataStr.split(',')[i]){
        for(let j = 0; j < 4; j++){
          if(dataStr.split(',')[i].split("")[j]){
            if(dataStr.split(',')[i].split("")[j].match(/o|x|#|\?|E|L|e|l/)){
              this.teams[index].archers[i].score[j] = dataStr.split(',')[i].split("")[j];
            }else{
              this.teams[index].archers[i].score[j] = "#";
            }
          }
        }
      }else{
        this.clearScore(index, i)
      }
    }
  }

  loadDistance(indexOrName:number|string, dataStr:string){
    let index = this.getTeamIndex(indexOrName);
    if(index < 0 || this.teams.length <= index) return;
    for(let i = 0; i < this.teamSize; i++){
      if(dataStr.split(',')[i]){
        this.teams[index].archers[i].distance = parseInt(dataStr.split(',')[i]);
      }else{
        this.clearDistance(index, i)
      }
    }
  }

  loadScoreboard(other:Scoreboard){
    this.sheetId = other.sheetId;
    this.matchType = other.matchType;
    this.round = other.round;
    this.group = other.group;
    this.shajo = other.shajo;
    this.method = other.method;
    this.teamCount = other.teamCount;
    this.teamSize = other.teamSize;
    this.teams = structuredClone(other.teams);
  }

  getArcherData(indexOrName?:number|string, start?:number, end?:number):string{
    let dataStr = "";
    if(indexOrName == undefined){
      for(let i = 0; i < this.teams.length; i++){
        for(let j = 0; j < this.teamSize; j++){
          dataStr += this.teams[i].archers[j].number + ":" + this.teams[i].archers[j].name + ",";
        }
      }
      if(dataStr.match(/,$/)){
        dataStr = dataStr.slice(0,-1);
      }
      return dataStr;
    }

    let index = this.getTeamIndex(indexOrName);
    if(index < 0 || this.teams.length <= index) return "";

    if(start == undefined)start = 0;
    if(end == undefined)end = this.teamSize - 1;
    if(start < 0 || this.teamSize <= start) return "";
    if(end < 0 || this.teamSize <= end) return "";
    if(end < start) return "";
    for(let i = start; i <= end; i++){
      dataStr += this.teams[index].archers[i].number + ":" + this.teams[index].archers[i].name + ",";
    }
    if(dataStr.match(/,$/)){
      dataStr = dataStr.slice(0,-1);
    }
    return dataStr;
  }

  getScoreData(indexOrName?:number|string, start?:number, end?:number):string{
    let dataStr = "";
    if(indexOrName == undefined){
      for(let i = 0; i < this.teamCount; i++){
        for(let j = 0; j < this.teamSize; j++){
          for(let k = 0; k < 4; k++){
            if(this.teams[i].archers[j].score[k]){
              dataStr += this.teams[i].archers[j].score[k];
            }else{
              dataStr += "#";
            }
          }
          dataStr += ",";
        }
      }
      if(dataStr.match(/,$/)){
        dataStr = dataStr.slice(0,-1);
      }
      return dataStr;
    }

    
    let index = this.getTeamIndex(indexOrName);
    if(index < 0 || this.teams.length <= index) return "";

    if(start == undefined)start = 0;
    if(end == undefined)end = this.teamSize - 1;
    if(start < 0 || this.teamSize <= start) return "";
    if(end < 0 || this.teamSize <= end) return "";
    if(end < start) return "";
    for(let i = start; i <= end; i++){
      for(let j = 0; j < 4; j++){
        if(this.teams[index].archers[i].score[j]){
          dataStr += this.teams[index].archers[i].score[j];
        }else{
          dataStr += "#";
        }
      }
      dataStr += ",";
    }
    if(dataStr.match(/,$/)){
      dataStr = dataStr.slice(0,-1);
    }
    return dataStr;
  }

  getDistanceData(indexOrName?:number|string, start?:number, end?:number):string{
    let dataStr = "";
    if(indexOrName == undefined){
      for(let i = 0; i < this.teams.length; i++){
        for(let j = 0; j < this.teamSize; j++){
          dataStr += this.teams[i].archers[j].distance + ",";
        }
      }
      if(dataStr.match(/,$/)){
        dataStr = dataStr.slice(0,-1);
      }
      return dataStr;
    }
    let index = this.getTeamIndex(indexOrName);
    if(index < 0 || this.teams.length <= index) return "";

    if(start == undefined)start = 0;
    if(end == undefined)end = this.teamSize - 1;
    if(start < 0 || this.teamSize <= start) return "";
    if(end < 0 || this.teamSize <= end) return "";
    if(end < start) return "";

    
    for(let i = start; i <= end; i++){
      dataStr += this.teams[index].archers[i].distance + ",";
    }

    if(dataStr.match(/,$/)){
      dataStr = dataStr.slice(0,-1);
    }
    return dataStr;
  }

  clearArchers(indexOrName?:number|string, index?:number) {
    if(indexOrName == undefined){
      for(let i = 0; i < this.teams.length; i++){
        for(let j = 0; j < this.teamSize; j++){
          this.teams[i].archers[j] = { name: "", number: 0, score: ["#","#","#","#"] , distance: 0};
        }
      }
      return;
    }
    if(index == undefined){
      let teamIndex = this.getTeamIndex(indexOrName);
      if(teamIndex < 0 || this.teams.length <= teamIndex) return;
      for(let i = 0; i < this.teamSize; i++){
        this.teams[teamIndex].archers[i] = { name: "", number: 0, score: ["#","#","#","#"] , distance: 0};
      }
      return;
    }
    if(index != undefined){
      let teamIndex = this.getTeamIndex(indexOrName);
      if(teamIndex < 0 || this.teams.length <= teamIndex) return;
      if(index < 0 || this.teams[teamIndex].archers.length <= index) return;
      if(this.teams[teamIndex].archers[index]) this.teams[teamIndex].archers[index] = { name: "", number: 0, score: ["#","#","#","#"] , distance: 0};
      return;
    }
  }

  clearScore(indexOrName?:number|string, index?:number) {
    if(indexOrName == undefined){
      for(let i = 0; i < this.teamCount; i++){
        for(let j = 0; j < this.teamSize; j++){
          if(this.teams[i].archers[j]){
            this.teams[i].archers[j].score = new Array(4).fill("#");
          }
        }
      }
      return;
    }
    if(index == undefined){
      let teamIndex = this.getTeamIndex(indexOrName);
      if(teamIndex < 0 || this.teams.length <= teamIndex) return;
      for(let i = 0; i < this.teamSize; i++){
        this.teams[teamIndex].archers[i].score = new Array(4).fill("#");
      }
      return
    }
    if(index != undefined){
      let teamIndex = this.getTeamIndex(indexOrName);
      if(teamIndex < 0 || this.teams.length <= teamIndex) return;
      if(index < 0 || this.teamSize <= index) return;
      this.teams[teamIndex].archers[index].score = new Array(4).fill("#");
    }
  }

  clearDistance(indexOrName?:number|string, index?:number) {
    if(indexOrName == undefined){
      for(let i = 0; i < this.teams.length; i++){
        for(let j = 0; j < this.teamSize; j++){
          this.teams[i].archers[j].distance = 0;
        }
      }
      return;
    }
    if(index == undefined){
      let teamIndex = this.getTeamIndex(indexOrName);
      if(teamIndex < 0 || this.teams.length <= teamIndex) return;
      for(let i = 0; i < this.teamSize; i++){
        this.teams[teamIndex].archers[i].distance = 0;
      }
      return
    }
    if(index != undefined){
      let teamIndex = this.getTeamIndex(indexOrName);
      if(teamIndex < 0 || this.teams.length <= teamIndex) return;
      if(index < 0 || this.teamSize <= index) return;
      this.teams[teamIndex].archers[index].distance = 0;
    }
  }

  getTeamIndex(indexOrName?:number|string):number{
    let index = -1;
    if(typeof indexOrName == "number"){
      index = indexOrName;
      return index;
    }
    if(typeof indexOrName == "string"){
      for(let i = 0; i < this.teams.length; i++){
        if(this.teams[i].name == indexOrName){
          index = i;
          break;
        }
      }
    }
    return index;
  }

  async compare(other:Scoreboard):Promise<string[]>{
    let misMatch:string[] = [];
    //基本情報比較
    if(this.sheetId != other.sheetId){
      misMatch.push("sheetId");
    }
    if(this.matchType != other.matchType){
      misMatch.push("matchType");
    }
    if(this.round != other.round){
      misMatch.push("round");
    }
    if(this.group != other.group){
      misMatch.push("group");
    }
    if(this.shajo != other.shajo){
      misMatch.push("shajo");
    }
    if(this.method != other.method){
      misMatch.push("method");
    }
    if(this.teamCount != other.teamCount){
      misMatch.push("teamCount");
    }
    if(this.teamSize != other.teamSize){
      misMatch.push("teamSize");
    }

    //要素数比較
    if(this.teams.length != other.teams.length){
      misMatch.push("teams_length");
      return misMatch;
    }
    for(let i = 0; i < this.teams.length; i++){
      if(this.teams[i].archers.length != other.teams[i].archers.length){
        misMatch.push("T"+i.toString()+"_archersLength");
      }
    }
    if(misMatch.length != 0) return misMatch;

    //内容比較
    for(let i = 0; i < this.teams.length; i++){
      if(this.teams[i].name != other.teams[i].name){
        misMatch.push("T"+i.toString()+"_name");
      }
      for(let j = 0; j < this.teams[i].archers.length; j++){
        if(this.teams[i].archers[j].name != other.teams[i].archers[j].name){
          misMatch.push("T"+i.toString()+"-A"+j.toString()+"_name");
        }
        if(this.teams[i].archers[j].number != other.teams[i].archers[j].number){
          misMatch.push("T"+i.toString()+"-A"+j.toString()+"_number");
        }
        for(let k = 0; k < 4; k++){
          if(this.teams[i].archers[j].score[k] != other.teams[i].archers[j].score[k]){
            misMatch.push("T"+i.toString()+"-A"+j.toString()+"_S"+k.toString());
          }
        }
        if(this.teams[i].archers[j].distance != other.teams[i].archers[j].distance){
          misMatch.push("T"+i.toString()+"-A"+j.toString()+"_distance");
        }
      }
    }
    return misMatch;
  }

  async copy():Promise<Scoreboard>{
    let newSB = new Scoreboard(this.sheetId, this.matchType, this.teamSize, this.teamCount);
    newSB.round = this.round;
    newSB.group = this.group;
    newSB.shajo = this.shajo;
    newSB.method = this.method;
    for(let i = 0; i < this.teams.length; i++){
      newSB.teams[i].name = this.teams[i].name;
      for(let j = 0; j < this.teamSize; j++){
        newSB.teams[i].archers[j].name = this.teams[i].archers[j].name;
        newSB.teams[i].archers[j].number = this.teams[i].archers[j].number;
        newSB.teams[i].archers[j].score = this.teams[i].archers[j].score.slice();
        newSB.teams[i].archers[j].distance = this.teams[i].archers[j].distance;
      }
    }
    return newSB;
  }
}
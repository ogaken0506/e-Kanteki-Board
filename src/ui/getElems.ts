export function scoreButtons(){
  return document.getElementsByClassName("square-button");
}
export function scoreButton(team:number, archer:number, index:number):HTMLButtonElement{
  let selectorStr = '#T'+team.toString()+' #A'+archer.toString()+' #B'+index.toString();
  let button = document.querySelector(selectorStr);
  if(button == null)throw new Error("HTMLElement(selector:"+selectorStr+") not found");
  return button as HTMLButtonElement;
}
export function scoreSlide(team:number, archer:number):HTMLInputElement{
  let selectorStr = '#T'+team.toString()+' #A'+archer.toString()+' .distance-input';
  let input = document.querySelector(selectorStr);
  if(input == null)throw new Error("HTMLElement(selector:"+selectorStr+") not found");
  return input as HTMLInputElement;
}
export function scoreSlideValue(team:number, archer:number):HTMLElement{
  let selectorStr = '#T'+team.toString()+' #A'+archer.toString()+' .distance-value';
  let elem = document.querySelector(selectorStr);
  if(elem == null)throw new Error("HTMLElement(selector:"+selectorStr+") not found");
  return elem as HTMLElement;
}
export function teamSelect(team:number):HTMLSelectElement{
  let id = "TS"+team.toString();
  let select = document.getElementById(id);
  if(select == null)throw new Error("HTMLElement(id:"+id+") not found");
  return select as HTMLSelectElement;
}
export function teamSelectLabel(team:number):HTMLSelectElement{
  let id = "TSL"+team.toString();
  let label = document.getElementById(id);
  if(label == null)throw new Error("HTMLElement(id:"+id+") not found");
  return label as HTMLSelectElement;
}
export function teamPlaceElem(team:number):HTMLElement{
  let id = 'TP' + team.toString();
  let placeElem = document.getElementById(id);
  if(placeElem == null)throw new Error("HTMLElement(id:"+id+") not found");
  return placeElem as HTMLElement;
}
export function teamNameElem(team:number):HTMLElement{
  let selectorStr = '#TH'+team.toString()+' .team-name';
  let header = document.querySelector(selectorStr) as HTMLElement;
  if(header == null)throw new Error("HTMLElement(selector:"+selectorStr+") not found");
  return header;
}
export function archerElem(team:number, archer:number):HTMLElement{
  let selectorStr = '#T'+team.toString()+' #A'+archer.toString();
  let archerElem = document.querySelector(selectorStr) as HTMLElement;
  if(archerElem == null)throw new Error("HTMLElement(selector:"+selectorStr+") not found");
  return archerElem;
}

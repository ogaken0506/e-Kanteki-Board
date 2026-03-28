export function scoreButtons(){
  return document.getElementsByClassName("square-button");
}
export function scoreButton(team:number, archer:number, index:number):HTMLButtonElement{
  const selectorStr = '#T'+team.toString()+' #A'+archer.toString()+' #B'+index.toString();
  const button = document.querySelector(selectorStr);
  if(button == null)throw new Error("HTMLElement(selector:"+selectorStr+") not found");
  return button as HTMLButtonElement;
}
export function scoreSlide(team:number, archer:number):HTMLInputElement{
  const selectorStr = '#T'+team.toString()+' #A'+archer.toString()+' .distance-input';
  const input = document.querySelector(selectorStr);
  if(input == null)throw new Error("HTMLElement(selector:"+selectorStr+") not found");
  return input as HTMLInputElement;
}
export function scoreSlideValue(team:number, archer:number):HTMLElement{
  const selectorStr = '#T'+team.toString()+' #A'+archer.toString()+' .distance-value';
  const elem = document.querySelector(selectorStr);
  if(elem == null)throw new Error("HTMLElement(selector:"+selectorStr+") not found");
  return elem as HTMLElement;
}
export function teamSelect(team:number):HTMLSelectElement{
  const id = "TS"+team.toString();
  const select = document.getElementById(id);
  if(select == null)throw new Error("HTMLElement(id:"+id+") not found");
  return select as HTMLSelectElement;
}
export function teamSelectLabel(team:number):HTMLSelectElement{
  const id = "TSL"+team.toString();
  const label = document.getElementById(id);
  if(label == null)throw new Error("HTMLElement(id:"+id+") not found");
  return label as HTMLSelectElement;
}
export function teamPlaceElem(team:number):HTMLElement{
  const id = 'TP' + team.toString();
  const placeElem = document.getElementById(id);
  if(placeElem == null)throw new Error("HTMLElement(id:"+id+") not found");
  return placeElem as HTMLElement;
}
export function teamNameElem(team:number):HTMLElement{
  const selectorStr = '#TH'+team.toString()+' .team-name';
  const header = document.querySelector(selectorStr) as HTMLElement;
  if(header == null)throw new Error("HTMLElement(selector:"+selectorStr+") not found");
  return header;
}
export function archerElem(team:number, archer:number):HTMLElement{
  const selectorStr = '#T'+team.toString()+' #A'+archer.toString();
  const archerElem = document.querySelector(selectorStr) as HTMLElement;
  if(archerElem == null)throw new Error("HTMLElement(selector:"+selectorStr+") not found");
  return archerElem;
}

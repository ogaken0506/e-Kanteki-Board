import info from '../class/info';

import DOMPurify from 'dompurify';


export function updateRoundOptions(categoryIndex:number) {
  const roundSelectElem  = document.getElementById('round-select' ) as HTMLSelectElement;
  roundSelectElem.innerHTML = "";
  if(!info.categories[categoryIndex]){
    console.warn('invalid index (categoryIndex:'+categoryIndex+')')
    console.log(info.categories);
    return;
  }
  let rounds = info.categories[categoryIndex].rounds;
  rounds.forEach((round, index) => {
    const opt = document.createElement('option');
    opt.textContent = DOMPurify.sanitize(round.name);
    opt.setAttribute("value", DOMPurify.sanitize(round.short_name));
    opt.dataset.method = DOMPurify.sanitize(round.method);
    roundSelectElem.appendChild(opt);
  })
  roundSelectElem.selectedIndex = -1;
}

export function updateTeamOptions(teamCount:number, teamList:string[], handler?: (this:HTMLSelectElement, e:Event) => any) {
  for(let i=0; i<teamCount; i++){
    let id = "TS"+(i+1).toString();
    let select = document.getElementById(id) as HTMLSelectElement;
    if(select == null){
      console.warn("HTMLElement(id:"+id+") not found");
      continue;
    }
    select.innerHTML = "";
    if(handler)select.addEventListener('change', handler);

    teamList.forEach((team, index) => {
      const opt = document.createElement('option');
      opt.textContent = DOMPurify.sanitize(team);
      opt.setAttribute("value", DOMPurify.sanitize(team));
      select.appendChild(opt);
      select.selectedIndex = -1;
    })
  }
}

export function updateGroupOptions(participatingTeams:number, maxActiveTeams:number) {
  const groupSelectElem  = document.getElementById('group-select') as HTMLSelectElement;
  groupSelectElem.innerHTML = "";
  let groupCount = Math.ceil( participatingTeams / maxActiveTeams );
  for(let i=0; i<groupCount; i++){
    const opt = document.createElement('option');
    opt.textContent = "第"+(i+1).toString()+"群";
    opt.setAttribute("value", i.toString());
    groupSelectElem.appendChild(opt);
  }
  groupSelectElem.selectedIndex = -1;
}

export function updateShajoOptions(numOfShajo:number) {
  const shajoSelectElem  = document.getElementById('shajo-select') as HTMLSelectElement;
  shajoSelectElem.innerHTML = "";
  for(let i=0; i< numOfShajo; i++){
    const opt = document.createElement('option');
    opt.textContent = "第"+(i+1).toString()+"射場";
    opt.setAttribute("value", i.toString());
    shajoSelectElem.appendChild(opt);
  }
}
import DOMPurify from 'dompurify';

export function addCategoryOption(nameStr:string, color:string, id:string){
  const categoryWrapper = document.getElementById('category-wrapper');
  if(!categoryWrapper){
    console.warn('categoryWrapper not found');
    return;
  }
  let label = document.createElement('label');
  let input = document.createElement('input');
  let nameElem = document.createElement('span');

  label.classList.add('category-label');
  label.style.backgroundColor = DOMPurify.sanitize(color);

  input.classList.add('category-input')
  input.setAttribute('type', 'radio');
  input.setAttribute('name', 'category');
  input.setAttribute('value', DOMPurify.sanitize(id));

  nameElem.textContent = DOMPurify.sanitize(nameStr);

  label.appendChild(input);
  label.appendChild(nameElem);
  categoryWrapper.appendChild(label)
}

export function clearCategoryOptions(){
  const categoryWrapper = document.getElementById('category-wrapper');
  if(!categoryWrapper){
    console.warn('categoryWrapper not found');
    return;
  }
  categoryWrapper.innerHTML = "";
}

export function addRoundOption(name:string, shortName:string, method:string){
  const roundSelectElem  = document.getElementById('round-select' ) as HTMLSelectElement;
  if(!roundSelectElem){
    console.warn('roundSelectElem not found');
    return;
  }
  const opt = document.createElement('option');
  opt.textContent = DOMPurify.sanitize(name);
  opt.setAttribute("value", DOMPurify.sanitize(shortName));
  opt.dataset.method = DOMPurify.sanitize(method);
  roundSelectElem.appendChild(opt);
}

export function clearRoundOptions(){
  const roundSelectElem  = document.getElementById('round-select' ) as HTMLSelectElement;
  if(!roundSelectElem){
    console.warn('roundSelectElem not found');
    return;
  }
  roundSelectElem.innerHTML = "";
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
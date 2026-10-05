import {calculate} from './engine.mjs';

export function timelineRows(o, retirementAge){
  const pensionStart=o.rows.find(r=>r.agePension>0)?.age;
  const ages=[retirementAge,pensionStart,retirementAge+10,85,95];
  return [...new Set(ages.filter(age=>Number.isFinite(age)&&age>=retirementAge&&age<=95))].sort((a,b)=>a-b).map(age=>o.rows.find(r=>r.age===age)).filter(Boolean);
}

export function shortfallOptions(profile,prefs,controls){
  const current=calculate(profile,prefs,controls),options=[];
  if(controls.enjoy<100)options.push({key:'enjoy',title:'Test more spending early',profile,controls:{...controls,enjoy:100}});
  if(profile.retirementAge>profile.age&&profile.retirementAge<89)options.push({key:'later',title:'Test retiring two years later',profile:{...profile,retirementAge:Math.min(89,profile.retirementAge+2)},controls});
  if(controls.legacy>0)options.push({key:'legacy',title:'Test keeping less for family',profile,controls:{...controls,legacy:0}});
  return {current,options:options.map(option=>({...option,outcome:calculate(option.profile,prefs,option.controls)}))};
}

export function lowerReturnScenario(profile,prefs,controls){return calculate({...profile,returnAdjustment:-.01},prefs,controls);}

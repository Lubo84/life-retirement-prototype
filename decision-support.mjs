import {calculate} from './engine.mjs?v=20261007-funding1';

export const fundingSources=[
  {key:'accountBasedIncome',label:'Account-based pension',colour:'#8eaeff'},
  {key:'lifetimeIncome',label:'Lifetime pension',colour:'#e9bd7c'},
  {key:'agePension',label:'Age Pension',colour:'#74c8c7'},
  {key:'otherSavingsIncome',label:'Other invested savings',colour:'#c3a3e8'},
  {key:'reserveIncome',label:'Accessible reserve',colour:'#8cb5c4'},
  {key:'otherIncome',label:'Other income',colour:'#adc98a'}
];

// Average exactly the years used by the headline; reconcile displayed $10
// rounding so the visible sources add to the visible funded income.
export function fundingBreakdown(rows){
  if(!rows.length)return null;
  const average=key=>rows.reduce((sum,r)=>sum+(r[key]||0),0)/rows.length;
  const total=average('spending'),planned=average('plannedIncome'),shortfall=average('shortfall');
  const sources=fundingSources.map(s=>({...s,amount:average(s.key)}));
  const displayedTotal=Math.round(total/10)*10;
  sources.forEach(s=>s.displayAmount=Math.floor(s.amount/10)*10);
  const order=[...sources].sort((a,b)=>(b.amount-b.displayAmount)-(a.amount-a.displayAmount));
  const remainder=Math.round((displayedTotal-sources.reduce((sum,s)=>sum+s.displayAmount,0))/10);
  for(let i=0;i<remainder;i++)order[i%order.length].displayAmount+=10;
  return {total,planned,shortfall,displayedTotal,displayedPlanned:Math.round(planned/10)*10,displayedShortfall:Math.max(0,Math.round(planned/10)*10-displayedTotal),sources};
}

export function timelineRows(o, retirementAge){
  const pensionStart=o.rows.find(r=>r.agePension>0)?.age;
  const ages=[retirementAge,pensionStart,retirementAge+10,85,95];
  return [...new Set(ages.filter(age=>Number.isFinite(age)&&age>=retirementAge&&age<=95))].sort((a,b)=>a-b).map(age=>o.rows.find(r=>r.age===age)).filter(Boolean);
}

export function shortfallOptions(profile,prefs,controls){
  const current=calculate(profile,prefs,controls),options=[];
  if(profile.desiredIncome>0)options.push({key:'lowerTarget',title:'Test a 10% lower spending target',profile:{...profile,desiredIncome:profile.desiredIncome*.9},controls});
  if(profile.retirementAge>profile.age&&profile.retirementAge<89)options.push({key:'later',title:'Test retiring two years later',profile:{...profile,retirementAge:Math.min(89,profile.retirementAge+2)},controls});
  if(controls.enjoy>0)options.push({key:'laterLife',title:'Test keeping more for later',profile,controls:{...controls,enjoy:0}});
  return {current,options:options.map(option=>({...option,outcome:calculate(option.profile,prefs,option.controls)}))};
}

export function lowerReturnScenario(profile,prefs,controls){return calculate({...profile,returnAdjustment:-.01},prefs,controls);}

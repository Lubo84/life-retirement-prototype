import assert from 'node:assert/strict';
import {defaults,defaultPreferences as prefs,initialControls,calculate,grossRetirementCapital} from '../engine.mjs';
import {timelineRows,shortfallOptions,lowerReturnScenario,fundingBreakdown} from '../decision-support.mjs';
const controls=initialControls(prefs),p={...defaults};
const base=calculate(p,prefs,controls),timeline=timelineRows(base,p.retirementAge);
assert.equal(timeline[0],base.rows[0]);
assert.ok(timeline.some(r=>r.age===base.rows.find(r=>r.agePension>0).age));
assert.ok(timeline.every((r,i)=>!i||r.age>timeline[i-1].age));
assert.equal(timelineRows(calculate({...p,age:89,retirementAge:89},prefs,controls),89).at(-1).age,95);
const comparison=shortfallOptions(p,prefs,controls);
for(const option of comparison.options)assert.deepEqual(option.outcome,calculate(option.profile,prefs,option.controls));
assert.ok(comparison.options.some(x=>x.key==='later'));
assert.ok(comparison.options.some(x=>x.key==='lowerTarget'));
assert.ok(!shortfallOptions(p,prefs,{...controls,enjoy:0}).options.some(x=>x.key==='laterLife'));
assert.ok(!shortfallOptions({...p,age:65},prefs,controls).options.some(x=>x.key==='later'),'already retired members should not be offered later retirement');

assert.equal(grossRetirementCapital({...p,age:65,annualContributions:20000}),grossRetirementCapital({...p,age:65,annualContributions:0}));
const contributionGrowth=grossRetirementCapital({...p,annualContributions:20000})-grossRetirementCapital(p);
assert.ok(Math.abs(contributionGrowth-20000*(1.02**5-1)/.02)<.01);
const low=lowerReturnScenario(p,prefs,controls);
assert.equal(low.s.capital,base.s.capital);
assert.equal(low.earlyDraw,base.earlyDraw);
assert.ok(low.futureBalance<base.futureBalance);
for(const r of low.rows){assert.ok(Math.abs(r.closingAbp-(r.openingAbp*1.01-r.withdrawal))<.01);assert.ok(r.closingAbp>=0&&r.closingCash>=0)}
const high=calculate({...p,desiredIncome:100000},prefs,controls);
assert.ok(high.rows[0].withdrawal>base.rows[0].withdrawal,'a higher target is funded by actual withdrawals');
assert.ok(high.futureBalance<=base.futureBalance);
assert.ok(high.shortfallAge,'an unaffordable target must expose depletion');
for(const o of [base,high,low])for(const rows of [o.rows.slice(0,10),o.rows.slice(10),...o.rows.map(r=>[r])]){const f=fundingBreakdown(rows);if(!f)continue;assert.ok(Math.abs(f.sources.reduce((sum,x)=>sum+x.amount,0)-f.total)<.01);assert.equal(f.sources.reduce((sum,x)=>sum+x.displayAmount,0),f.displayedTotal);assert.equal(f.displayedTotal+f.displayedShortfall,f.displayedPlanned);}
assert.equal(fundingBreakdown([]),null);
console.log('Decision comparisons, timeline, contribution growth, lower-return cash flows and target-funded withdrawals and reconciled funding averages passed.');

import assert from 'node:assert/strict';
import {RULES as R} from '../rules.mjs';
import {defaults,defaultPreferences as prefs,initialControls,calculate,deriveProductStructure,pensionAssessment,lifetimeAssessableAssets,minimumPensionRate,project} from '../engine.mjs';
let n=0;const near=(actual,expected,message)=>{n++;assert.ok(Math.abs(actual-expected)<.01,`${message}: ${actual} vs ${expected}`)};
const allocation={L:10,I:50,F:40,E:0},profile={...defaults,age:67,retirementAge:67,superBalance:0,otherAssets:0,nonFinancialAssets:0};
let s=deriveProductStructure(profile,allocation);
near(pensionAssessment(profile,s).payment,1237.7*26,'full single pension');
const rich={...profile,superBalance:600000};s=deriveProductStructure(rich,allocation);near(pensionAssessment(rich,s).assetTest,1237.7*26-(600000-333000)*.078,'assets taper');
let a=pensionAssessment(rich,s);near(a.payment,Math.min(a.assetTest,a.incomeTest),'lower test applies');
const incomeBound={...profile,superBalance:100000,otherIncome:30000};s=deriveProductStructure(incomeBound,allocation);a=pensionAssessment(incomeBound,s);assert.equal(a.limitingTest,'Income test');near(a.payment,a.incomeTest,'income test binding');
const couple={...profile,relationshipStatus:'couple',partnerAge:67,partnerSuper:0};s=deriveProductStructure(couple,allocation);near(pensionAssessment(couple,s).payment,1866*26,'full couple pension');
s=deriveProductStructure({...couple,partnerAge:60},allocation);near(pensionAssessment({...couple,partnerAge:60},s).payment,933*26,'only one partner eligible');
const before67={...profile,age:65,retirementAge:65};s=deriveProductStructure(before67,allocation);near(pensionAssessment(before67,s).payment,0,'below67');
const renter={...rich,homeowner:false};s=deriveProductStructure(renter,allocation);near(pensionAssessment(renter,s).assetTest,1237.7*26,'nonhomeowner assets threshold');
const lifeProfile={...profile,superBalance:100000};s=deriveProductStructure(lifeProfile,{L:10,I:30,F:20,E:40});near(lifetimeAssessableAssets(lifeProfile,s,67),24000,'60 percent lifetime purchase');near(lifetimeAssessableAssets(lifeProfile,s,84),24000/1.025**17,'60 percent before85 in real dollars');near(lifetimeAssessableAssets(lifeProfile,s,85),12000/1.025**18,'30 percent at85 in real dollars');near(pensionAssessment(lifeProfile,s).assessableIncome,Math.min(60000,66800)*.0175+2200*.6,'deeming plus 60 percent payments, no double count');
const oldPurchase={...lifeProfile,age:83,retirementAge:83};s=deriveProductStructure(oldPurchase,{L:10,I:30,F:20,E:40});near(lifetimeAssessableAssets(oldPurchase,s,87),24000/1.025**4,'five year minimum');near(lifetimeAssessableAssets(oldPurchase,s,88),12000/1.025**5,'stepdown after five years');
const excluded={...rich,pensionExpectation:'none'};s=deriveProductStructure(excluded,allocation);near(pensionAssessment(excluded,s).payment,0,'explicit pension exclusion');
// More lifetime commitment need not improve an income-tested pension.
const highPayout={...profile,superBalance:400000,lifetimePayout:10,otherIncome:15000};const zero=deriveProductStructure(highPayout,{L:10,I:45,F:45,E:0}),more=deriveProductStructure(highPayout,{L:10,I:25,F:25,E:40});assert.ok(pensionAssessment(highPayout,more).payment<pensionAssessment(highPayout,zero).payment);
near(minimumPensionRate(64),.04,'minimum64');near(minimumPensionRate(65),.05,'minimum65');near(minimumPensionRate(95),.14,'minimum95');
const controls=initialControls(prefs);
for(const relationshipStatus of ['single','couple'])for(const age of [60,67,83])for(const balance of [0,100000,600000,2000000])for(const key of Object.keys(controls)){let prev;for(let v=0;v<=100;v+=10){const p={...defaults,age,retirementAge:age,partnerAge:age,relationshipStatus,superBalance:balance,partnerSuper:balance,otherAssets:0};const o=calculate(p,prefs,{...controls,[key]:v});near(Object.values(o.a).reduce((a,b)=>a+b,0),100,'allocation total');assert.ok(o.a.L<=25&&o.a.E<=40);for(const row of o.rows){assert.ok(row.closingAbp>=0&&row.closingCash>=0);near(row.openingAbp* (1+{Growth:.03,Balanced:.02,Conservative:.01}[o.s.investmentOption])-row.withdrawal,row.closingAbp,'abp cash conservation');near(row.openingCash+row.reinvested-Math.max(0,row.actualOwn-Math.min(row.plannedOwn,row.withdrawal)),row.closingCash,'cash conservation');assert.ok(row.agePension>=0&&row.agePension<=(relationshipStatus==='couple'?R.maxFortnightCoupleEach*52:R.maxFortnightSingle*26));assert.ok(Number.isFinite(row.spending));near(row.accountBasedIncome+row.otherSavingsIncome+row.reserveIncome+row.lifetimeIncome+row.agePension+row.otherIncome,row.spending,'all income has a funding source');near(row.spending+row.shortfall,row.plannedIncome,'funded plus unfunded equals planned income');}const at90=o.rows.find(x=>x.age===90);near(o.futureBalance,at90.openingAbp+at90.openingCash,'90 balance from annual flows');near(o.earlyIncome,o.rows.slice(0,10).reduce((n,x)=>n+x.spending,0)/10,'first10 average');if(prev){if(key==='enjoy'){assert.ok(o.earlyDraw>=prev.earlyDraw-.01);assert.ok(o.futureBalance<=prev.futureBalance+.01)}if(key==='certainty'){assert.ok(o.lifetimeIncome>=prev.lifetimeIncome-.01);assert.ok(o.accessibleCapital<=prev.accessibleCapital+.01)}if(key==='legacy'){assert.ok(o.earlyDraw<=prev.earlyDraw+.01);assert.ok(o.futureBalance>=prev.futureBalance-.01)}}prev=o}}
console.log(`${n} calculation and cash-flow assertions passed`);
console.log('Example at 67, homeowner, $600k financial assets, no other assets or income:');
for(const certainty of [0,50,100]){const o=calculate({...profile,superBalance:600000},prefs,{...controls,certainty});console.log(JSON.stringify({lifetimeAllocation:o.s.lifetimeIncomeAllocation,agePension:Math.round(o.agePension),lifetimeIncome:Math.round(o.lifetimeIncome),limitingTest:o.assessment.limitingTest,earlyAverage:Math.round(o.earlyIncome),assets90:Math.round(o.futureBalance)}))}

// Concrete funding example: $50k total = $10k lifetime + $20k AP + $20k ABP.
const example={...profile,superBalance:500000,desiredIncome:50000,lifetimePayout:5.5};
const exampleAllocation={L:10,I:35,F:0,E:100*(10000/.055)/500000};
// $10,000 / 5.5% = $181,818.18, or 36.3636% of $500,000.
exampleAllocation.F=100-exampleAllocation.L-exampleAllocation.I-exampleAllocation.E;
const structure=deriveProductStructure(example,exampleAllocation);
example.nonFinancialAssets=R.assetsSingleHome+(R.maxFortnightSingle*26-20000)/R.assetsTaperAnnualPerDollar-(structure.capital-.4*structure.lifetimeIncomeAllocation);
const first=project(example,structure,prefs).rows[0];
near(first.spending,50000,'requested total is fully funded');near(first.lifetimeIncome,10000,'lifetime funding');near(first.agePension,20000,'Age Pension funding');near(first.accountBasedIncome,20000,'ABP fills the remainder');near(first.shortfall,0,'no hidden gap');
const unfunded=calculate({...profile,desiredIncome:50000},prefs,controls).rows[0];
near(unfunded.accountBasedIncome,0,'no imaginary withdrawals without savings');near(unfunded.spending+unfunded.shortfall,50000,'zero savings exposes the unfunded remainder');
const fallback=calculate({...defaults,desiredIncome:0},prefs,controls);near(fallback.rows[0].plannedOwn,fallback.earlyDraw,'no target retains the preference-based estimate');
console.log('Explicit $50k funding, zero-capital shortfall and no-target fallback passed.');

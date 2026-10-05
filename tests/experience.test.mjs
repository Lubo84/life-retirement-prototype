import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as engine from '../engine.mjs';
import * as experience from '../experience.mjs';
import * as decisionSupport from '../decision-support.mjs';
import {RULES,SOURCES} from '../rules.mjs';
assert.equal(experience.sameControls({enjoy:50,certainty:50,buffer:50,legacy:50},{enjoy:50,certainty:51,buffer:50,legacy:50}),false);
assert.equal(experience.deltaSentence('Income',1000,1001,true),'Income changes very little.');
assert.ok(!experience.deltaSentence('Income',1000,1001,true).includes('$0'));
const late=engine.calculate({...engine.defaults,age:89,retirementAge:89},engine.defaultPreferences,engine.initialControls(engine.defaultPreferences));
assert.equal(late.earlyYearsCount,7);assert.equal(late.laterIncome,null);assert.equal(experience.periodLabel(late,89),'Next 7 years, ages 89–95');
// Controller/rendering harness: exercises actual handlers and HTML templates.
// It does not emulate layout, a screen reader or a real browser.
const nodes=new Map();let activeElement=null;
function node(key){if(!nodes.has(key))nodes.set(key,{innerHTML:'',hidden:false,value:'',dataset:{},focus(){activeElement=this},setAttribute(k,v){this[k]=v},addEventListener(k,fn){this[k]=fn},scrollIntoView(){},closest(){return this},click(){this.onclick?.()},querySelector:sel=>node(key+sel),querySelectorAll:()=>[]});return nodes.get(key)}
const app=node('#app');app.querySelector=sel=>node(sel);app.querySelectorAll=sel=>{if(sel==='[data-control]')return ['enjoy','certainty','buffer','legacy'].map(k=>{const n=node('#'+k);n.dataset.control=k;return n});if(sel==='[data-edit-priorities]')return [node('editPriorities')];if(sel==='[data-choice]')return [0,1,2].map(i=>{const n=node('choice'+i);n.dataset.choice=String(i);return n});if(sel==='.inlineChange')return ['enjoy','certainty','buffer','legacy'].map(k=>node('#change-'+k));return []};
const dialog=node('#detail');dialog.showModal=()=>{dialog.open=true};dialog.close=()=>{dialog.open=false};
let downloaded='';class CaptureBlob extends Blob{constructor(parts,opt){super(parts,opt);downloaded=parts.join('')}}
const context={...engine,...experience,...decisionSupport,RULES,SOURCES,Intl,Math,Number,Object,Array,JSON,console,AbortController,Blob:CaptureBlob,URL:{createObjectURL:()=>'/download',revokeObjectURL:()=>{}},setTimeout:()=>{},FormData:class{constructor(form){this.form=form}*[Symbol.iterator](){yield* Object.entries(this.form.values)}},document:{querySelector:sel=>node(sel),createElement:()=>({click(){}})},window:{scrollTo(){},addEventListener(){}}};
vm.createContext(context);vm.runInContext(fs.readFileSync('app.mjs','utf8').replace(/^import .*;\n/gm,''),context);
const run=code=>vm.runInContext(code,context);
run("navigate('about')");assert.ok(app.innerHTML.includes('Annual retirement income target'));assert.ok(app.innerHTML.includes('What matters to you'));
const formValues=Object.fromEntries(Object.entries(engine.defaults).map(([k,v])=>[k,String(v)]));
node('#profileForm').onsubmit({preventDefault(){},target:{values:formValues}});assert.equal(run('screen'),'preference');
for(let q=0;q<6;q++){node('choice1').onclick();node('#nextQuestion').onclick()}
assert.equal(run('screen'),'starting');assert.equal(run('preferencesDone'),true);assert.ok(app.innerHTML.includes('Why this starting point?'));assert.ok(app.innerHTML.includes('readily available:'));
run("navigate('explore')");node('#certainty').pointerdown();node('#certainty').value='80';node('#certainty').oninput();assert.equal(run('controls.certainty'),80);assert.ok(node('#change-certainty').innerHTML.includes('More income certainty'));assert.equal(node('#change-certainty').hidden,false);assert.ok(node('#mobileSnapshot').innerHTML.includes('Accessible savings'));
run("navigate('changed')");assert.ok(app.innerHTML.includes('combined result'));assert.ok(app.innerHTML.includes('compareRow'));assert.ok(!app.innerHTML.includes('do not add together'));
run("navigate('about')");node('#profileForm').onsubmit({preventDefault(){},target:{values:{...formValues,superBalance:'650000'}}});assert.equal(run('screen'),'explore');assert.equal(run('controls.certainty'),80);assert.equal(run('prefs.lifetimeCertainty'),1);
run("navigate('summary')");node('#save').onclick();assert.ok(downloaded.includes('YOUR CURRENT PRIORITIES'));assert.ok(downloaded.includes('CHANGES FROM YOUR STARTING POINT'));assert.ok(downloaded.indexOf('YOUR CURRENT PRIORITIES')<downloaded.indexOf('ORIGINAL QUESTIONNAIRE ANSWERS'));
assert.ok(app.innerHTML.includes('Your income at key ages'));
assert.ok(app.innerHTML.includes('An illustration shaped by preferences'));
assert.ok(app.innerHTML.includes('Your next step'));
assert.ok(app.innerHTML.includes('financial-advice-options'));
assert.ok(downloaded.includes('QUESTIONS FOR YOUR ADVICE CONVERSATION'));
assert.ok(downloaded.includes('INCOME AT KEY AGES'));
assert.ok(downloaded.includes('LOWER RETURN SENSITIVITY'));
run('showShortfall()');assert.ok(node('#detailContent').innerHTML.includes('Compare ways to address the gap'));
run('controls={...controls,enjoy:100};showShortfall()');assert.ok(!node('#detailContent').innerHTML.includes('Test more spending early'));
assert.ok(node('#detailContent').innerHTML.includes('Lowering the target changes the comparison only'));
run("profile={...defaults,homeowner:false};navigate('about')");assert.ok(app.innerHTML.includes('Include rent in your target'));
run("profile={...defaults,age:89,retirementAge:89};navigate('summary')");assert.ok(app.innerHTML.includes('Next 7 years'));assert.ok(!app.innerHTML.includes('First 10 years'));assert.ok(!app.innerHTML.includes('Later: ages 99'));
run("profile={...defaults,age:67,retirementAge:67,superBalance:0,otherAssets:0};navigate('summary')");assert.ok(app.innerHTML.includes('No savings are available to allocate'));
node('editPriorities').onclick();assert.equal(run('screen'),'preference');assert.equal(run('chosen'),1);node('choice0').onclick();node('#nextQuestion').onclick();assert.equal(run('prefs.earlyLifestyle'),1,'draft edits do not alter active plan before completion');
console.log('Journey handlers, progress preservation, combined review, download, material-change copy and late/zero-capital cases passed.');

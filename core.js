/* Shared deterministic grading and validation; no network or AI service. */
(function(root){
'use strict';
const isObject=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const isDate=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(x)&&Number.isFinite(Date.parse(x))&&new Date(x).toISOString().slice(0,10)===x;
const expansions={"can't":"can not","cannot":"can not","won't":"will not","shan't":"shall not","i'm":"i am","you're":"you are","we're":"we are","they're":"they are","he's":"he is","she's":"she is","it's":"it is","that's":"that is","there's":"there is","i've":"i have","you've":"you have","we've":"we have","they've":"they have","i'll":"i will","you'll":"you will","we'll":"we will","they'll":"they will","let's":"let us"};
function normalize(text){
 let s=String(text??'').normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'");
 s=s.replace(/\b(i|you|we|they|he|she)'d (?=like|rather|prefer|appreciate)/g,'$1 would ').replace(/\b(he|she|it|that|there)'s (?=been|got)/g,'$1 has ');
 s=s.replace(/\b[a-z]+(?:'[a-z]+)?\b/g,w=>expansions[w]||(/n't$/.test(w)?w.slice(0,-3)+' not':w));
 return (s.match(/\d+(?:[.,]\d+)*(?:%)?|[a-z]+(?:'[a-z]+)?/g)||[]).join(' ');
}
function grade(q,answer){
 if(q.type==='choice')return typeof answer==='string'&&q.options.includes(answer)&&answer===q.answer;
 const a=normalize(answer);return !!a&&[q.answer,...(q.acceptedAnswers||[])].some(expected=>a===normalize(expected));
}
function correction(q,answer){
 if(grade(q,answer))return {correct:true,message:'Chính xác! Bạn đã dùng đúng đáp án.',missing:[],extra:[]};
 if(q.type==='choice')return {correct:false,message:'Nghĩa bạn chọn chưa phù hợp với từ/cụm từ trong ngữ cảnh này.',missing:[],extra:[]};
 const a=normalize(answer).split(' ').filter(Boolean),b=normalize(q.answer).split(' ').filter(Boolean);
 const subtract=(left,right)=>{const pool=[...right];return left.filter(w=>{const i=pool.indexOf(w);if(i<0)return true;pool.splice(i,1);return false})};
 const missing=subtract(b,a),extra=subtract(a,b);
 return {correct:false,message:missing.length||extra.length?'Hãy kiểm tra các từ còn thiếu hoặc chưa đúng bên dưới.':'Bạn đã có đủ từ nhưng thứ tự chưa đúng.',missing,extra};
}
function validV2(d){
 if(d.words===undefined&&d.answers===undefined)return true; // V1 compatibility.
 if(!isObject(d.words)||!isObject(d.answers))return false;
 if(!Object.entries(d.words).every(([k,v])=>/^v-[a-f0-9]{12}$/.test(k)&&isObject(v)&&['unknown','learning','known'].includes(v.status)&&Number.isInteger(v.step)&&v.step>=-1&&v.step<=4&&isDate(v.due)&&typeof v.updatedAt==='string'&&Number.isFinite(Date.parse(v.updatedAt))))return false;
 return Object.entries(d.answers).every(([k,v])=>/^(?:[1-9]|[1-9]\d|1\d\d)-(choice|cloze|order)$/.test(k)&&Number(k.split('-')[0])<=197&&isObject(v)&&typeof v.firstCorrect==='boolean'&&typeof v.lastCorrect==='boolean'&&typeof v.everWrong==='boolean'&&typeof v.firstAnswer==='string'&&typeof v.lastAnswer==='string'&&Number.isInteger(v.attempts)&&v.attempts>=1&&Number.isInteger(v.reviewStep)&&v.reviewStep>=-1&&v.reviewStep<=4&&isDate(v.due)&&typeof v.lastAt==='string'&&Number.isFinite(Date.parse(v.lastAt)));
}
function stats(records){const values=Object.values(records);const n=values.length;return {answered:n,attempts:values.reduce((s,v)=>s+v.attempts,0),first:n?Math.round(values.filter(v=>v.firstCorrect).length/n*100):0,latest:n?Math.round(values.filter(v=>v.lastCorrect).length/n*100):0,weak:values.filter(v=>v.everWrong).length};}
function validV21(d){
 const stamp=x=>typeof x==='string'&&Number.isFinite(Date.parse(x));
 const qid=x=>typeof x==='string'&&/^(?:[1-9]|[1-9]\d|1\d\d)-(choice|cloze|order)$/.test(x)&&Number(x.split('-')[0])<=197;
 const wid=x=>typeof x==='string'&&/^v-[a-f0-9]{12}$/.test(x);
 const integer=(x,min,max)=>Number.isInteger(x)&&x>=min&&x<=max;
 if(d.goals!==undefined&&(!isObject(d.goals)||!['lessons','words','questions'].every(k=>integer(d.goals[k],1,100))))return false;
 if(d.activity!==undefined&&(!isObject(d.activity)||!Object.entries(d.activity).every(([day,a])=>isDate(day)&&isObject(a)&&Array.isArray(a.lessons)&&a.lessons.every(x=>integer(x,1,197))&&Array.isArray(a.words)&&a.words.every(wid)&&Array.isArray(a.questions)&&a.questions.every(qid))))return false;
 if(d.reports!==undefined&&(!Array.isArray(d.reports)||!d.reports.every(r=>isObject(r)&&typeof r.id==='string'&&r.id.length<=100&&qid(r.questionId)&&typeof r.comment==='string'&&r.comment.trim().length>=5&&r.comment.length<=2000&&typeof r.prompt==='string'&&r.prompt.length<=2000&&typeof r.answer==='string'&&r.answer.length<=5000&&stamp(r.at))))return false;
 if(d.quizzes!==undefined&&(!Array.isArray(d.quizzes)||!d.quizzes.every(q=>isObject(q)&&typeof q.id==='string'&&q.id.length<=100&&typeof q.group==='string'&&q.group.length<=150&&stamp(q.at)&&integer(q.total,1,100)&&integer(q.correct,0,q.total)&&q.score===Math.round(q.correct/q.total*100))))return false;
 return true;
}
const api={validV21,normalize,grade,correction,validV2,stats,isDate};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.ECA=api;
})(typeof window!=='undefined'?window:globalThis);

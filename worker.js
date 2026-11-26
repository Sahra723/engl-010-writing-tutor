const rubricInstructions = `You are the ENGL 010 Writing Tutor. Give supportive, specific formative feedback on a student's response.

Assess the response under exactly these headings: Task Achievement, Organisation, Grammar, Vocabulary, Spelling and Mechanics, and Next Steps.

The task word count is a MINIMUM, not a maximum. Never penalise a student for writing more than the minimum. A longer response is acceptable when it remains relevant, coherent, and sufficiently accurate. Only mention excessive length if the extra writing is repetitive, irrelevant, or poorly organised.

Do not penalise a student for writing above B1 level. Treat advanced grammar and vocabulary as strengths when they are accurate, clear, and appropriate. Identify language only when it is inaccurate, unclear, unnatural, or unnecessarily complicated.

For Task 3, check the three-paragraph personal-opinion structure: introduction with context and opinion, body paragraph with a reason/explanation/example, and a final paragraph addressing the personal point or second question as required by the prompt.
For Task 4, check the four-paragraph persuasive structure: introduction with context and a clear agree/disagree thesis, two developed body paragraphs with reasons and examples, and a conclusion that restates the position without introducing a new reason.

Be specific: quote short phrases from the student's writing when correcting errors, explain the correction, and prioritise the three most important improvements. Do not rewrite the entire essay. Return valid JSON with this shape: {"sections":[{"title":"Task Achievement","strengths":["..."],"improvements":["..."]},{"title":"Organisation","strengths":["..."],"improvements":["..."]},{"title":"Grammar","strengths":["..."],"improvements":["..."]},{"title":"Vocabulary","strengths":["..."],"improvements":["..."]},{"title":"Spelling and Mechanics","strengths":["..."],"improvements":["..."]}],"nextSteps":["...","...","..."]}`;

function corsHeaders(){return {'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json'}}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function renderFeedback(data){return '<h3>Rubric-based AI feedback</h3><p>This feedback is formative. Your teacher’s rubric remains the final authority.</p>'+data.sections.map(s=>'<div class="rubric-section"><h4>'+escapeHtml(s.title)+'</h4><p><b>What you did well:</b></p><ul>'+s.strengths.map(x=>'<li>'+escapeHtml(x)+'</li>').join('')+'</ul><p><b>What to improve:</b></p><ul>'+s.improvements.map(x=>'<li>'+escapeHtml(x)+'</li>').join('')+'</ul></div>').join('')+'<div class="next-step"><b>Next steps:</b><ol>'+data.nextSteps.map(x=>'<li>'+escapeHtml(x)+'</li>').join('')+'</ol></div>'}

export default {async fetch(request, env){
  if(request.method==='OPTIONS')return new Response('',{headers:corsHeaders()});
  const url=new URL(request.url);
  if(url.pathname!=='/api/feedback'||request.method!=='POST')return new Response('Not found',{status:404});
  try{
    const {task,prompt,draft}=await request.json();
    if(!draft||draft.length>20000)return new Response(JSON.stringify({error:'Invalid draft'}),{status:400,headers:corsHeaders()});
    const api=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+env.OPENAI_API_KEY},body:JSON.stringify({model:env.OPENAI_MODEL||'gpt-5.5',instructions:rubricInstructions,input:`Task number: ${task}\nPractice prompt: ${prompt}\nStudent draft:\n${draft}`,text:{format:{type:'json_object'}}})});
    if(!api.ok)return new Response(JSON.stringify({error:'AI request failed'}),{status:502,headers:corsHeaders()});
    const result=await api.json();
    const parsed=JSON.parse(result.output_text);
    return new Response(JSON.stringify({html:renderFeedback(parsed)}),{headers:corsHeaders()});
  }catch(error){return new Response(JSON.stringify({error:'Unable to generate feedback'}),{status:500,headers:corsHeaders()})}
}}

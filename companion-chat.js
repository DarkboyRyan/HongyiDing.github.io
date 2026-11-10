(() => {
  'use strict';
  const storageKey='portfolio-companion-chat-v1';
  const config=window.PORTFOLIO_COMPANION || {};
  const locale=()=>document.documentElement.lang.startsWith('zh')?'zh':'en';
  const names={zh:config.nameZh||'矢本小季',en:config.name||'Yamoto Koki'};
  const copy={
    zh:{contact:'要发邮件问站长吗？',subject:'主题',body:'邮件内容',review:'填写你的回复邮箱，确认后由矢本小季发送给站长；站长可直接回复你。',openMail:'确认发送邮件',replyEmail:'你的回复邮箱',mailSending:'正在发送……',mailSent:'邮件已交给邮件服务，站长可通过你填写的邮箱回复。',invalidMail:'请填写有效的回复邮箱，并检查主题和正文。',mailNotConfigured:'专用邮箱尚未完成授权，暂时无法发送。草稿已保留。',mailUnavailable:'邮件服务暂不可用，草稿已保留。',mailAuth:'发件邮箱授权需要更新，请联系站长。',mailUncertain:'无法确认是否已发出，请勿重复发送，联系站长核实。',mailRate:'发送次数较多，请稍后再试。',mailConflict:'该草稿已提交，请不要重复修改发送。',mailSession:'请先重新发送一条聊天消息，再提交邮件。',cancelMail:'暂不询问',sources:'源码参考',new:'开启新对话',close:'收起聊天',log:'聊天记录',label:'想说什么？',placeholder:'说点什么吧……',hint:'Enter 发送 · Shift + Enter 换行',send:'发送 ↗',trigger:'聊两句 ↗',you:'你',welcome:'……来都来了，说点什么吧。先声明，我可不是一直在等你。',fresh:'新对话已开启。',unavailable:'聊天尚在测试，稍后再来找我吧。',thinking:'正在想怎么回答你……',failed:'暂时没有连上聊天服务。原消息已保留，可以重试。',timeout:'这次等得有些久，消息已放回输入框，可以重试。',busy:'上一条还在回复，请稍等。',rate:'消息有点密，稍等一分钟再聊。',invalid:'请输入不超过 2000 字的消息。'},
    en:{contact:'Ask the site owner by email?',subject:'Subject',body:'Message',review:'Enter your reply email, then confirm. Yamoto Koki will email the owner, who can reply directly to you.',openMail:'Confirm and send email',replyEmail:'Your reply email',mailSending:'Sending…',mailSent:'Accepted by the mail service. The owner can reply to your email.',invalidMail:'Enter a valid reply email and check the subject and message.',mailNotConfigured:'The dedicated mailbox is not authorized yet. Your draft is saved.',mailUnavailable:'Mail is temporarily unavailable. Your draft is saved.',mailAuth:'The sender’s authorization needs updating.',mailUncertain:'Delivery could not be confirmed. Please do not resend; contact the owner.',mailRate:'Too many email attempts. Please try later.',mailConflict:'This draft was already submitted. Please do not resubmit edits.',mailSession:'Send a new chat message before submitting this email.',cancelMail:'Not now',sources:'Source excerpts',new:'New conversation',close:'Close chat',log:'Conversation',label:'What’s on your mind?',placeholder:'Say something…',hint:'Enter to send · Shift + Enter for a new line',send:'Send ↗',trigger:'Let’s chat ↗',you:'You',welcome:'…Well, you’re here. Say something. It’s not as if I’ve been waiting for you.',fresh:'New conversation started.',unavailable:'Chat is still being tested. Come back soon.',thinking:'Thinking of a reply…',failed:'Couldn’t reach the chat service. Your message is ready to retry.',timeout:'That took a little too long. Your message is ready to retry.',busy:'Still replying to the previous message. Please wait.',rate:'A little too fast. Please wait a minute.',invalid:'Please enter a message of up to 2,000 characters.'}
  };
  const t=key=>copy[locale()][key]||copy[locale()].failed;
  let mailStatusPromise;
  let statusKey='';
  const setStatus=key=>{statusKey=key;status.textContent=key?t(key):'';};
  let conversation=crypto.randomUUID(), messages=[], busy=false, lastFocus;
  try { const saved=JSON.parse(sessionStorage.getItem(storageKey)); if(saved && /^[a-f0-9-]{36}$/.test(saved.conversation) && Array.isArray(saved.messages)) { conversation=saved.conversation; messages=saved.messages.filter(m=>['user','assistant'].includes(m.role)&&typeof m.text==='string').slice(-40); } } catch {}
  const panel=document.createElement('section');
  panel.id='companion-chat'; panel.className='companion-chat'; panel.hidden=true;
  panel.setAttribute('role','dialog'); panel.setAttribute('aria-label','Companion chat');
  panel.innerHTML=`<header class="cc-header"><div class="cc-avatar" aria-hidden="true"><img alt="" decoding="async"></div><div class="cc-heading"><strong></strong></div><button type="button" class="cc-new" title="开启新对话" aria-label="开启新对话">↻</button><button type="button" class="cc-close" aria-label="收起聊天">×</button></header><div class="cc-log" role="log" aria-label="聊天记录" aria-live="polite" aria-relevant="additions"></div><p class="cc-status" role="status"></p><form class="cc-form"><label class="cc-sr" for="cc-input">想说什么？</label><textarea id="cc-input" rows="2" maxlength="2000" placeholder="说点什么吧……" enterkeyhint="send"></textarea><div class="cc-form-footer"><span>Enter 发送 · Shift + Enter 换行</span><button type="submit" class="cc-send">发送 <span aria-hidden="true">↗</span></button></div></form>`;
  
  panel.querySelector('.cc-avatar img').src=config.portraitUrl||'assets/characters/yamoto-koki/standing.png';
  document.body.append(panel);
  const log=panel.querySelector('.cc-log'), input=panel.querySelector('textarea'), send=panel.querySelector('.cc-send'), status=panel.querySelector('.cc-status');
  const trigger=document.createElement('button'); trigger.type='button'; trigger.className='cc-trigger'; trigger.textContent='聊两句 ↗'; trigger.setAttribute('aria-controls',panel.id); trigger.setAttribute('aria-expanded','false');
  const slot=document.querySelector('.companion-actions');
  if(slot) slot.append(trigger); else {trigger.classList.add('cc-trigger-fallback');document.body.append(trigger);}
  function save(){try{sessionStorage.setItem(storageKey,JSON.stringify({conversation,messages:messages.slice(-40)}));}catch{}}
  function bubble(role,text,sources=[],draft=null){const row=document.createElement('div');row.className=`cc-row cc-${role}`; const label=document.createElement('span');label.className='cc-speaker';label.textContent=role==='user'?t('you'):names[locale()]; const content=document.createElement('div');content.className='cc-message';if(role==='assistant'){for(const part of text.split(/(\*\*[^*\n]+\*\*|`[^`\n]+`)/g)){if(part.startsWith('**')&&part.endsWith('**')){const el=document.createElement('strong');el.textContent=part.slice(2,-2);content.append(el);}else if(part.startsWith('`')&&part.endsWith('`')){const el=document.createElement('code');el.textContent=part.slice(1,-1);content.append(el);}else content.append(document.createTextNode(part));}}else content.textContent=text; row.append(label,content);
    if(role==='assistant'&&Array.isArray(sources)){
      const valid=sources.filter(ref=>ref&&typeof ref.url==='string'&&/^https:\/\/github\.com\/DarkboyRyan\/[A-Za-z0-9_.-]+\/blob\/[a-f0-9]{40}\//.test(ref.url)&&typeof ref.path==='string'&&typeof ref.commit==='string'&&Number.isInteger(ref.startLine)&&Number.isInteger(ref.endLine)).slice(0,10);
      if(valid.length){
        const details=document.createElement('details');details.className='cc-sources';
        const summary=document.createElement('summary');summary.dataset.count=String(valid.length);summary.textContent=`${t('sources')} · ${valid.length}`;details.append(summary);
        for(const ref of valid){const link=document.createElement('a');link.href=ref.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=`${ref.path} · L${ref.startLine}–${ref.endLine} · ${ref.commit.slice(0,7)}`;details.append(link);}
        row.append(details);
      }
    }
    if(role==='assistant'&&draft&&!draft.dismissed)appendContact(row,draft);
    log.append(row); log.scrollTop=log.scrollHeight;return row;}
  function appendContact(row,draft){
    if(typeof draft.subject!=='string'||typeof draft.body!=='string')return;
    for(const key of ['subject','body'])draft[key]=draft[key].replace(/丁泓邑|Hongyi\s+Ding|Ding\s+Hongyi/gi,'sakana雫');
    draft.id=draft.id||crypto.randomUUID();
    save();
    const details=document.createElement('details');details.className='cc-contact';
    const summary=document.createElement('summary');summary.dataset.ccText='contact';summary.textContent=t('contact');details.append(summary);
    const field=(key,value,multiline)=>{
      const label=document.createElement('label');const caption=document.createElement('span');caption.dataset.ccText=key;caption.textContent=t(key);
      const control=document.createElement(multiline?'textarea':'input');if(!multiline)control.type='text';control.value=value;control.maxLength=multiline?3000:key==='replyEmail'?254:150;if(key==='replyEmail'){control.type='email';control.autocomplete='email';control.required=true;}
      control.addEventListener('input',()=>{draft[key]=control.value;save();});
      label.append(caption,control);details.append(label);return control;
    };
    const subject=field('subject',draft.subject,false),body=field('body',draft.body,true);
    const replyEmail=field('replyEmail',draft.replyEmail||'',false);
    const note=document.createElement('p');note.dataset.ccText='review';note.textContent=t('review');details.append(note);
    const actions=document.createElement('div');actions.className='cc-contact-actions';
    const openMail=document.createElement('button');openMail.type='button';openMail.dataset.ccText='openMail';openMail.textContent=t('openMail');openMail.className='cc-mail-send';
    const delivery=document.createElement('p');delivery.setAttribute('role','status');
    const showDelivery=key=>{delivery.dataset.ccText=key;delivery.textContent=t(key);};
    if(draft.sent){openMail.disabled=true;showDelivery('mailSent');}
    openMail.addEventListener('click',async()=>{
      if(draft.sent||draft.sending)return;
      if(!replyEmail.value.trim()||!replyEmail.checkValidity()||!subject.value.trim()||!body.value.trim()){showDelivery('invalidMail');replyEmail.reportValidity();return;}
      draft.sending=true;openMail.disabled=true;showDelivery('mailSending');
      try{
        const response=await fetch('/api/companion/mail',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-Companion-Chat':'1'},body:JSON.stringify({id:draft.id,subject:subject.value,body:body.value,replyEmail:replyEmail.value.trim(),confirmed:true}),signal:AbortSignal.timeout(50000)});
        const data=await response.json();
        if(!response.ok||!data.ok){const key=['invalidMail','mailNotConfigured','mailUnavailable','mailAuth','mailUncertain','mailRate','mailConflict','mailSession'].includes(data.code)?data.code:'mailUnavailable';showDelivery(key);if(key==='mailUncertain')draft.uncertain=true;}
        else{draft.sent=true;showDelivery('mailSent');subject.disabled=true;body.disabled=true;replyEmail.disabled=true;}
      }catch{draft.uncertain=true;showDelivery('mailUncertain');}
      finally{draft.sending=false;openMail.disabled=!!(draft.sent||draft.uncertain);save();}
    });
    const cancel=document.createElement('button');cancel.type='button';cancel.dataset.ccText='cancelMail';cancel.textContent=t('cancelMail');cancel.addEventListener('click',()=>{draft.dismissed=true;details.remove();save();});
    actions.append(openMail,cancel);details.append(actions,delivery);row.append(details);
    if(draft.uncertain){openMail.disabled=true;showDelivery('mailUncertain');}
    (mailStatusPromise||=fetch('/api/companion/mail-status').then(r=>r.json())).then(data=>{if(!data.configured&&!draft.sent&&!draft.uncertain)showDelivery('mailNotConfigured');}).catch(()=>{});
  }
  function draw(){log.replaceChildren();if(!messages.length)bubble('assistant',t('welcome'));else messages.forEach(m=>bubble(m.role,m.text,m.sources,m.contactDraft));}
  function open(){lastFocus=document.activeElement;panel.hidden=false;document.body.classList.add('companion-chat-open');trigger.setAttribute('aria-expanded','true'); input.focus();log.scrollTop=log.scrollHeight;}
  function close(){panel.hidden=true;document.body.classList.remove('companion-chat-open');trigger.setAttribute('aria-expanded','false');lastFocus?.focus();}
  trigger.addEventListener('click',open);
  document.querySelectorAll('[data-open-companion-chat]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();open();}));
  document.querySelector('.companion-stage')?.addEventListener('click',open);
  panel.querySelector('.cc-close').addEventListener('click',close);
  panel.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close();}});
  input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();panel.querySelector('form').requestSubmit();}});
  panel.querySelector('.cc-new').addEventListener('click',()=>{if(busy)return;conversation=crypto.randomUUID();messages=[];save();draw();setStatus('fresh');input.focus();});
  panel.querySelector('form').addEventListener('submit',async e=>{
    e.preventDefault(); const text=input.value.trim();if(!text||busy)return;
    if(!['127.0.0.1','localhost'].includes(location.hostname) && !config.chatEndpoint){setStatus('unavailable');return;}
    busy=true;send.disabled=true; panel.querySelector('.cc-new').disabled=true; input.value='';
    messages.push({role:'user',text});bubble('user',text);save();setStatus('thinking');
    document.dispatchEvent(new CustomEvent('companion:chat-state',{detail:{state:'thinking'}}));
    const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),135000);
    try{
      const res=await fetch(config.chatEndpoint||'/api/companion/chat',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-Companion-Chat':'1'},body:JSON.stringify({message:text,conversation,language:locale()}),signal:controller.signal});
      let data;try{data=await res.json();}catch{throw new Error('failed');}
      if(!res.ok||typeof data.reply!=='string')throw new Error(data.code||'failed');
      messages.push({role:'assistant',text:data.reply,sources:data.sourceReferences,contactDraft:data.contactDraft});bubble('assistant',data.reply,data.sourceReferences,data.contactDraft);save();setStatus('');
      document.dispatchEvent(new CustomEvent('companion:chat-state',{detail:{state:'replied'}}));
    }catch(error){messages.pop();log.lastElementChild?.remove();save();input.value=text;setStatus(error.name==='AbortError'?'timeout':(['busy','rate','invalid'].includes(error.message)?error.message:'failed'));}
    finally{clearTimeout(timer);busy=false;send.disabled=false;panel.querySelector('.cc-new').disabled=false;document.dispatchEvent(new CustomEvent('companion:chat-state',{detail:{state:'idle'}}));if(!panel.hidden)input.focus();}
  });
  function translate(){
    panel.lang=locale()==='zh'?'zh-CN':'en';
    panel.setAttribute('aria-label',locale()==='zh'?`和${names.zh}聊天`:`Chat with ${names.en}`);
    panel.querySelector('.cc-heading strong').textContent=names[locale()];
    for(const [selector,key] of [['.cc-new','new'],['.cc-close','close'],['.cc-log','log']]){
      const el=panel.querySelector(selector);el.setAttribute('aria-label',t(key));el.title=t(key);
    }
    panel.querySelector('.cc-form label').textContent=t('label');input.placeholder=t('placeholder');
    panel.querySelector('.cc-form-footer > span').textContent=t('hint');send.textContent=t('send');
    trigger.textContent=t('trigger');
    log.querySelectorAll('[data-cc-text]').forEach(el=>el.textContent=t(el.dataset.ccText));
    log.querySelectorAll('.cc-sources summary').forEach(el=>el.textContent=`${t('sources')} · ${el.dataset.count}`);
    setStatus(statusKey);
    if(!messages.length)draw();else log.querySelectorAll('.cc-row').forEach(row=>row.querySelector('.cc-speaker').textContent=row.classList.contains('cc-user')?t('you'):names[locale()]);
  }
  draw();translate();
  new MutationObserver(translate).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
})();

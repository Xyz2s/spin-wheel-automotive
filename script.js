(function(){
  var $=function(s){return document.querySelector(s)};
  var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* wheel spokes */
  var r=$('#rotor'),s='';
  for(var i=0;i<10;i++){s+='<path d="M200 200 L'+(200-14)+' 52 Q200 40 '+(200+14)+' 52 Z" fill="#c9cedf" transform="rotate('+(i*36)+' 200 200)"/>';}
  r.innerHTML='<circle cx="200" cy="200" r="150" fill="#1b2040"/>'+s+'<circle cx="200" cy="200" r="52" fill="#3342f5"/>';

  /* ticker */
  var t='Inspected cars<i> ● </i>Clear pricing<i> ● </i>Fast trade-in offers<i> ● </i>Test drives by appointment<i> ● </i>';
  $('#tick').innerHTML=('<span>'+t+'</span>').repeat(8);

  /* scroll-linked wheel */
  if(!reduce){
    var tick=false;
    addEventListener('scroll',function(){
      if(tick)return;tick=true;
      requestAnimationFrame(function(){r.style.transform='rotate('+(scrollY*.35)+'deg)';tick=false;});
    },{passive:true});
  }

  /* nav */
  var menu=$('#menu'),nav=$('#nav');
  menu.onclick=function(){var o=nav.classList.toggle('open');menu.setAttribute('aria-expanded',o)};
  nav.addEventListener('click',function(e){if(e.target.tagName==='A'){nav.classList.remove('open');menu.setAttribute('aria-expanded',false)}});
  addEventListener('keydown',function(e){if(e.key==='Escape'){nav.classList.remove('open');menu.setAttribute('aria-expanded',false)}});
  $('#yr').textContent=new Date().getFullYear();

  /* inventory */
  var cars=[
    {n:'Tesla Model 3',y:2021,p:39000,t:'Sedan',m:28000,c:'#3342f5',b:'#dfe3ff'},
    {n:'BMW 3 Series',y:2019,p:28500,t:'Sedan',m:46000,c:'#1d2a6b',b:'#e4e8f2'},
    {n:'Ford Mustang',y:2020,p:35000,t:'Coupe',m:31000,c:'#d63a2f',b:'#fde5e0'},
    {n:'Audi A4',y:2018,p:25000,t:'Sedan',m:58000,c:'#6b7280',b:'#e8eaee'},
    {n:'Toyota RAV4',y:2022,p:31500,t:'SUV',m:19000,c:'#0f8a6d',b:'#d9f3ea'},
    {n:'Ford F-150',y:2020,p:37800,t:'Truck',m:42000,c:'#101428',b:'#dde0ee'},
    {n:'Honda Civic',y:2021,p:22900,t:'Sedan',m:24000,c:'#e08a00',b:'#fdefd0'},
    {n:'Jeep Grand Cherokee',y:2019,p:29900,t:'SUV',m:51000,c:'#4d5a2e',b:'#e6ebd5'}
  ];
  var types=['All'].concat(cars.map(function(c){return c.t}).filter(function(v,i,a){return a.indexOf(v)===i}));
  var active='All',chips=$('#chips');
  types.forEach(function(t){
    var b=document.createElement('button');b.className='chip';b.textContent=t;b.setAttribute('aria-pressed',t==='All');
    b.onclick=function(){active=t;[].forEach.call(chips.children,function(x){x.setAttribute('aria-pressed',x===b)});draw()};
    chips.appendChild(b);
  });
  var usd=function(n){return '$'+n.toLocaleString('en-US')};
  function draw(){
    var q=$('#q').value.trim().toLowerCase(),so=$('#sort').value;
    var list=cars.filter(function(c){return (active==='All'||c.t===active)&&(c.y+' '+c.n).toLowerCase().indexOf(q)>-1});
    list.sort(function(a,b){return so==='low'?a.p-b.p:so==='high'?b.p-a.p:b.y-a.y});
    $('#count').textContent=list.length+(list.length===1?' car':' cars');
    $('#grid').innerHTML=list.length?list.map(function(c){
      return '<article class="car"><div class="pic" style="--tint:'+c.b+';--paint:'+c.c+'"><svg viewBox="0 0 220 90" role="img" aria-label="'+c.n+'"><use href="#car"/></svg></div>'+
      '<div class="info"><h3>'+c.y+' '+c.n+'</h3><span class="meta">'+c.t+' · '+c.m.toLocaleString('en-US')+' miles</span>'+
      '<div class="row"><span class="price">'+usd(c.p)+'</span><button class="btn" data-car="'+c.y+' '+c.n+'">Enquire</button></div></div></article>';
    }).join(''):'<div class="empty">No cars match that search. Clear the filter or try another name.</div>';
  }
  $('#q').oninput=draw;$('#sort').onchange=draw;
  $('#grid').addEventListener('click',function(e){
    var b=e.target.closest('[data-car]');if(!b)return;
    $('#msg').value="Hi, I'm interested in the "+b.dataset.car+". Is it still available, and can I book a test drive?";
    $('#contact').scrollIntoView();$('#name').focus({preventScroll:true});
  });
  draw();

  /* estimator */
  var yr=$('#year'),now=new Date().getFullYear();
  for(var y=now;y>=now-15;y--){yr.add(new Option(y,y))}
  yr.value=now-5;
  function est(){
    var age=now-yr.value,mi=+$('#miles').value;
    $('#milesOut').textContent=mi.toLocaleString('en-US');
    var v=34000*Math.pow(.88,age)*(+$('#body').value)*(+$('#cond').value)*(1-Math.min(mi/320000,.45));
    v=Math.max(v,1500);
    var lo=Math.round(v*.93/100)*100,hi=Math.round(v*1.07/100)*100;
    $('#val').textContent=usd(lo)+' – '+usd(hi);
  }
  ['#year','#body','#miles','#cond'].forEach(function(k){$(k).addEventListener('input',est)});est();
  $('#sendEst').onclick=function(){
    var bs=$('#body');
    $('#msg').value='I would like a firm offer for my '+yr.value+' '+bs.options[bs.selectedIndex].text.toLowerCase()+' with about '+(+$('#miles').value).toLocaleString('en-US')+' miles. Estimate shown: '+$('#val').textContent+'.';
  };

  /* contact form */
  var form=$('#form');
  function setErr(id,m){document.querySelector('[data-for='+id+']').textContent=m;$('#'+id).setAttribute('aria-invalid',!!m)}
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var ok=true,n=$('#name').value.trim(),em=$('#email').value.trim(),m=$('#msg').value.trim();
    setErr('name',n?'':'Enter your name.');
    setErr('email',/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)?'':'Enter a valid email address.');
    setErr('msg',m.length>=10?'':'Write at least 10 characters.');
    if(form.querySelector('[aria-invalid=true]'))return;
    var btn=$('#send'),st=$('#status');
    btn.disabled=true;st.textContent='Sending…';
    /* Replace this block with your real endpoint, e.g. fetch('https://formspree.io/f/your-id',{method:'POST',body:new FormData(form)}) */
    setTimeout(function(){
      st.textContent='Thanks, '+n.split(' ')[0]+'. We will reply within one business day.';
      form.reset();btn.disabled=false;
    },700);
  });
})();
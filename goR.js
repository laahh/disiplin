new Promise(res=>{const w=m=>new Promise(r=>setTimeout(r,m));(async()=>{ try{ await w(2000);document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await w(300);
 const sl=[...document.querySelectorAll('.slide')]; const i=sl.findIndex(s=>s.id==='slideRoad'); document.querySelectorAll('#nav .dot')[i].click(); await w(4500);
 const S=document.querySelector('.slide.active'); let extra='';
 if(window.__OPEN!=null){ S.querySelectorAll('.rm-dot')[window.__OPEN].click(); await w(1600); }
 const g=S.querySelector('.rm-grid').getBoundingClientRect(); res(S.id+' idx='+i+' bottom='+Math.round(g.bottom)+'/'+innerHeight);
 }catch(e){res('ERR '+e.message)} })()})

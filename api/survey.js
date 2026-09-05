import { put, list, del } from '@vercel/blob';

const LEVELS = ['Reaktif', 'Bergantung', 'Mandiri', 'Interdependen'];
const PREFIX = 'survey/resp-';

function parseLevel(pathname){
  const base = String(pathname || '').split('/').pop() || '';
  const m = base.match(/^resp-(Reaktif|Bergantung|Mandiri|Interdependen)-/);
  return m ? m[1] : null;
}

async function listAll(){
  const out = [];
  let cursor;
  do {
    const page = await list({ prefix: PREFIX, cursor, limit: 1000 });
    out.push(...(page.blobs || []));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return out;
}

function tallyFrom(blobs){
  const tally = { Reaktif:0, Bergantung:0, Mandiri:0, Interdependen:0 };
  const keys = [];
  blobs.forEach((b)=>{
    const level = parseLevel(b.pathname);
    if(!level) return;
    tally[level]++;
    keys.push('resp:'+level+':'+b.pathname);
  });
  return { keys, tally, total: keys.length };
}

export default async function handler(req, res){
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if(req.method === 'OPTIONS') return res.status(204).end();

  try{
    if(req.method === 'GET'){
      const blobs = await listAll();
      return res.status(200).json(tallyFrom(blobs));
    }

    if(req.method === 'POST'){
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const level = body.level;
      if(!LEVELS.includes(level)) return res.status(400).json({ ok:false, error:'level' });
      const id = Date.now()+'-'+Math.random().toString(36).slice(2, 8);
      const pathname = PREFIX+level+'-'+id+'.json';
      await put(pathname, JSON.stringify({ level, t: Date.now() }), {
        access: 'private',
        addRandomSuffix: false,
        contentType: 'application/json',
      });
      return res.status(200).json({ ok:true, key:'resp:'+level+':'+id });
    }

    if(req.method === 'DELETE'){
      const blobs = await listAll();
      if(blobs.length) await del(blobs.map((b)=> b.url));
      return res.status(200).json({ ok:true, deleted: blobs.length });
    }

    return res.status(405).json({ ok:false });
  }catch(err){
    console.error(err);
    return res.status(500).json({ ok:false, error: err.message || 'blob' });
  }
}

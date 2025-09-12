## server.js (Express backend proxy)

```js
// server.js
import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3001;
const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY; // required

app.use(express.json());
// serve frontend (place index.html in same folder)
app.use(express.static(path.join(process.cwd())));

app.post('/api/compile', async (req,res)=>{
  try{
    if(!RAPIDAPI_KEY) return res.status(500).json({output:'Server misconfigured: RAPIDAPI_KEY missing'});
    const { language_id, source_code, stdin } = req.body;
    const payload = {
      language_id,
      source_code: Buffer.from(source_code || '').toString('base64'),
      stdin: Buffer.from(stdin || '').toString('base64')
    };

    const r = await fetch('https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=true&wait=true',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com'
      },
      body: JSON.stringify(payload)
    });

    if(!r.ok){ const txt = await r.text(); return res.status(500).json({output:'Judge0 error: '+txt}); }
    const data = await r.json();
    const decode = s => s ? Buffer.from(s,'base64').toString() : '';
    const out = `${decode(data.compile_output)}${decode(data.stderr)}${decode(data.stdout)}`;
    res.json({ output: out });
  }catch(err){ console.error(err); res.status(500).json({output:'Server error'}); }
});

app.listen(PORT, ()=>console.log(`Server running on http://localhost:${PORT}`));
```

---

## .env.example

```
RAPIDAPI_KEY=your_rapidapi_key_here
PORT=3001
```

---

## How to run (quick)
1. Put `index.html` and `server.js` in the same folder. Copy `.env.example` to `.env` and set `RAPIDAPI_KEY`.
2. `npm init -y` then `npm i express node-fetch dotenv` (or `npm i` if package.json provided).
3. Run: `node server.js` (or `node --experimental-modules server.js` if using older Node; recommended Node 18+).
4. Open `http://localhost:3001` and test.

---

## Notes & security
- **Do not** expose your RapidAPI key in client-side code — server proxy keeps it secret.
- Judge0 public endpoints have rate limits; for heavy use host your own Judge0.
- The privacy modal is intentionally minimal; include more legal text if you plan to publish.

---

If you want, I can now:
- Add a ready `package.json` and `start` script.
- Create a Docker Compose file that runs the frontend static server + a self-hosted Judge0 (heavy, but possible).
- Improve the UI further with icons and a prettier editor (Monaco) embedded (will increase bundle size).

Tell me which of the above you want next and I’ll add it to this canvas (no React, plain Node.js).



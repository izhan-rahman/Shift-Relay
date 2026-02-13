const http = require('http');

// ─── Shared State (in-memory, shared across ALL browsers) ───
let loggedInEmployees = [];
let pauseState = {};

function cors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function readBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', c => body += c);
        req.on('end', () => resolve(JSON.parse(body || '{}')));
    });
}

function send(res, data) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
    cors(res);
    if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

    // GET /api/state — returns current shared state
    if (req.method === 'GET' && req.url === '/api/state') {
        return send(res, { loggedInEmployees, pauseState });
    }

    // POST /api/login — mark employee as logged in
    if (req.method === 'POST' && req.url === '/api/login') {
        const { username } = await readBody(req);
        if (!loggedInEmployees.includes(username)) {
            loggedInEmployees.push(username);
        }
        // Return pause info (for "was away" notification) then clear it
        const pauseInfo = pauseState[username] || null;
        delete pauseState[username];
        console.log(`✅ ${username} logged in. Online: [${loggedInEmployees}]`);
        return send(res, { loggedInEmployees, pauseState, resumeInfo: pauseInfo });
    }

    // POST /api/logout — mark employee as logged out
    if (req.method === 'POST' && req.url === '/api/logout') {
        const { username, progress, isActiveShift } = await readBody(req);
        loggedInEmployees = loggedInEmployees.filter(n => n !== username);
        if (isActiveShift && progress !== undefined) {
            pauseState[username] = { pausedAtTime: Date.now(), pausedProgress: progress };
        }
        console.log(`🔴 ${username} logged out. Online: [${loggedInEmployees}]`);
        return send(res, { loggedInEmployees, pauseState });
    }

    res.writeHead(404); res.end('Not Found');
});

server.listen(3001, () => {
    console.log('');
    console.log('  🔄 Shift Relay State Server');
    console.log('  ─────────────────────────────');
    console.log('  Running on http://localhost:3001');
    console.log('  All browsers poll this for shared state');
    console.log('');
});

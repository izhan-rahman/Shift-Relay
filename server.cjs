const http = require('http');
const fs = require('fs');
const path = require('path');

// ─── File Paths ──────────────────────────────────────────────
const DATA_DIR = path.join(__dirname, 'data');
const EMPLOYEES_FILE = path.join(DATA_DIR, 'employees.json');
const SHIFTS_FILE = path.join(DATA_DIR, 'shifts.json');

// ─── Ensure data directory exists ────────────────────────────
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// ─── Read/Write JSON helpers ─────────────────────────────────
function readJSON(filePath) {
    try { return JSON.parse(fs.readFileSync(filePath, 'utf8')); }
    catch { return []; }
}
function writeJSON(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ─── Shared State (in-memory, shared across ALL browsers) ───
let loggedInEmployees = [];
let pauseState = {};

// ─── HTTP Helpers ────────────────────────────────────────────
function cors(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function readBody(req) {
    return new Promise((resolve) => {
        let body = '';
        req.on('data', c => body += c);
        req.on('end', () => resolve(JSON.parse(body || '{}')));
    });
}

function send(res, data, status = 200) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

function parseUrl(url) {
    const [pathname, query] = (url || '').split('?');
    const parts = pathname.split('/').filter(Boolean);  // ['api', 'employees', 'SUHAIL']
    return { pathname, parts, query };
}

// ─── Generate next shift ID ─────────────────────────────────
function nextShiftId() {
    const shifts = readJSON(SHIFTS_FILE);
    return shifts.length === 0 ? 1 : Math.max(...shifts.map(s => s.id)) + 1;
}

// ─── Get today's active schedule ─────────────────────────────
function getTodaySchedule() {
    const shifts = readJSON(SHIFTS_FILE);
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    return shifts.filter(s => {
        const from = s.effectiveFrom || '2000-01-01';
        const until = s.effectiveUntil || '2099-12-31';
        return today >= from && today <= until;
    }).sort((a, b) => a.order - b.order);
}

// ─── Server ──────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
    cors(res);
    if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

    const { pathname, parts } = parseUrl(req.url);

    // ═══════ REAL-TIME STATE ═══════

    // GET /api/state — returns current shared state
    if (req.method === 'GET' && pathname === '/api/state') {
        return send(res, { loggedInEmployees, pauseState });
    }

    // POST /api/login — validate credentials & register login
    if (req.method === 'POST' && pathname === '/api/login') {
        const { username, password } = await readBody(req);
        const employees = readJSON(EMPLOYEES_FILE);
        const found = employees.find(
            e => e.name.toLowerCase() === (username || '').toLowerCase() && e.password === password
        );
        if (!found) {
            return send(res, { success: false, error: 'Invalid credentials' }, 401);
        }
        // Register login for non-master users
        if (found.role !== 'master' && !loggedInEmployees.includes(found.name)) {
            loggedInEmployees.push(found.name);
        }
        // Return pause info then clear it
        const pauseInfo = pauseState[found.name] || null;
        delete pauseState[found.name];
        console.log(`✅ ${found.name} logged in (${found.role}). Online: [${loggedInEmployees}]`);
        return send(res, {
            success: true,
            user: { name: found.name, email: found.email, role: found.role },
            loggedInEmployees,
            pauseState,
            resumeInfo: pauseInfo
        });
    }

    // POST /api/logout — mark employee as logged out
    if (req.method === 'POST' && pathname === '/api/logout') {
        const { username, progress, isActiveShift } = await readBody(req);
        loggedInEmployees = loggedInEmployees.filter(n => n !== username);
        if (isActiveShift && progress !== undefined) {
            pauseState[username] = { pausedAtTime: Date.now(), pausedProgress: progress };
        }
        console.log(`🔴 ${username} logged out. Online: [${loggedInEmployees}]`);
        return send(res, { loggedInEmployees, pauseState });
    }

    // ═══════ EMPLOYEES CRUD ═══════

    // GET /api/employees — list all employees
    if (req.method === 'GET' && pathname === '/api/employees') {
        const employees = readJSON(EMPLOYEES_FILE);
        // Don't send passwords to frontend (except master needs them for management)
        const safe = employees.map(e => ({ name: e.name, email: e.email, role: e.role }));
        return send(res, { employees: safe });
    }

    // POST /api/employees — create employee
    if (req.method === 'POST' && pathname === '/api/employees') {
        const { name, email, password, role } = await readBody(req);
        if (!name || !password) return send(res, { error: 'Name and password required' }, 400);
        const employees = readJSON(EMPLOYEES_FILE);
        if (employees.find(e => e.name.toLowerCase() === name.toLowerCase())) {
            return send(res, { error: 'Employee already exists' }, 400);
        }
        const newEmp = { name: name.toUpperCase(), email: email || '', password, role: role || 'employee' };
        employees.push(newEmp);
        writeJSON(EMPLOYEES_FILE, employees);
        console.log(`👤 Created employee: ${newEmp.name}`);
        return send(res, { success: true, employee: { name: newEmp.name, email: newEmp.email, role: newEmp.role } }, 201);
    }

    // PUT /api/employees/:name — update employee
    if (req.method === 'PUT' && parts[0] === 'api' && parts[1] === 'employees' && parts[2]) {
        const targetName = decodeURIComponent(parts[2]).toUpperCase();
        const updates = await readBody(req);
        const employees = readJSON(EMPLOYEES_FILE);
        const idx = employees.findIndex(e => e.name === targetName);
        if (idx === -1) return send(res, { error: 'Employee not found' }, 404);
        if (updates.name) employees[idx].name = updates.name.toUpperCase();
        if (updates.email !== undefined) employees[idx].email = updates.email;
        if (updates.password) employees[idx].password = updates.password;
        if (updates.role) employees[idx].role = updates.role;
        writeJSON(EMPLOYEES_FILE, employees);
        console.log(`✏️  Updated employee: ${employees[idx].name}`);
        return send(res, { success: true, employee: { name: employees[idx].name, email: employees[idx].email, role: employees[idx].role } });
    }

    // DELETE /api/employees/:name — delete employee
    if (req.method === 'DELETE' && parts[0] === 'api' && parts[1] === 'employees' && parts[2]) {
        const targetName = decodeURIComponent(parts[2]).toUpperCase();
        let employees = readJSON(EMPLOYEES_FILE);
        const before = employees.length;
        employees = employees.filter(e => e.name !== targetName);
        if (employees.length === before) return send(res, { error: 'Employee not found' }, 404);
        writeJSON(EMPLOYEES_FILE, employees);
        // Also remove from logged in
        loggedInEmployees = loggedInEmployees.filter(n => n !== targetName);
        delete pauseState[targetName];
        console.log(`🗑️  Deleted employee: ${targetName}`);
        return send(res, { success: true });
    }

    // ═══════ SHIFTS CRUD ═══════

    // GET /api/shifts — list all shifts
    if (req.method === 'GET' && pathname === '/api/shifts') {
        const shifts = readJSON(SHIFTS_FILE);
        return send(res, { shifts });
    }

    // GET /api/schedule — get today's active schedule
    if (req.method === 'GET' && pathname === '/api/schedule') {
        const schedule = getTodaySchedule();
        return send(res, { schedule, date: new Date().toISOString().slice(0, 10) });
    }

    // POST /api/shifts — create shift
    if (req.method === 'POST' && pathname === '/api/shifts') {
        const { name, startHour, endHour, label, order, effectiveFrom, effectiveUntil } = await readBody(req);
        if (!name || startHour === undefined || endHour === undefined) {
            return send(res, { error: 'name, startHour, endHour required' }, 400);
        }
        const shifts = readJSON(SHIFTS_FILE);
        const newShift = {
            id: nextShiftId(),
            name: name.toUpperCase(),
            startHour: Number(startHour),
            endHour: Number(endHour),
            label: label || `${startHour}:00 – ${endHour}:00`,
            order: order || shifts.length + 1,
            effectiveFrom: effectiveFrom || new Date().toISOString().slice(0, 10),
            effectiveUntil: effectiveUntil || null
        };
        shifts.push(newShift);
        writeJSON(SHIFTS_FILE, shifts);
        console.log(`⏰ Created shift: ${newShift.name} (${newShift.label})`);
        return send(res, { success: true, shift: newShift }, 201);
    }

    // PUT /api/shifts/:id — update shift
    if (req.method === 'PUT' && parts[0] === 'api' && parts[1] === 'shifts' && parts[2]) {
        const id = parseInt(parts[2]);
        const updates = await readBody(req);
        const shifts = readJSON(SHIFTS_FILE);
        const idx = shifts.findIndex(s => s.id === id);
        if (idx === -1) return send(res, { error: 'Shift not found' }, 404);
        if (updates.name !== undefined) shifts[idx].name = updates.name.toUpperCase();
        if (updates.startHour !== undefined) shifts[idx].startHour = Number(updates.startHour);
        if (updates.endHour !== undefined) shifts[idx].endHour = Number(updates.endHour);
        if (updates.label !== undefined) shifts[idx].label = updates.label;
        if (updates.order !== undefined) shifts[idx].order = Number(updates.order);
        if (updates.effectiveFrom !== undefined) shifts[idx].effectiveFrom = updates.effectiveFrom;
        if (updates.effectiveUntil !== undefined) shifts[idx].effectiveUntil = updates.effectiveUntil;
        writeJSON(SHIFTS_FILE, shifts);
        console.log(`✏️  Updated shift #${id}: ${shifts[idx].name}`);
        return send(res, { success: true, shift: shifts[idx] });
    }

    // DELETE /api/shifts/:id — delete shift
    if (req.method === 'DELETE' && parts[0] === 'api' && parts[1] === 'shifts' && parts[2]) {
        const id = parseInt(parts[2]);
        let shifts = readJSON(SHIFTS_FILE);
        const before = shifts.length;
        shifts = shifts.filter(s => s.id !== id);
        if (shifts.length === before) return send(res, { error: 'Shift not found' }, 404);
        writeJSON(SHIFTS_FILE, shifts);
        console.log(`🗑️  Deleted shift #${id}`);
        return send(res, { success: true });
    }

    res.writeHead(404); res.end('Not Found');
});

server.listen(3001, () => {
    console.log('');
    console.log('  🔄 Shift Relay State Server');
    console.log('  ─────────────────────────────');
    console.log('  Running on http://localhost:3001');
    console.log('  Endpoints:');
    console.log('    GET  /api/state         — real-time state');
    console.log('    POST /api/login         — authenticate');
    console.log('    POST /api/logout        — log out');
    console.log('    CRUD /api/employees     — manage users');
    console.log('    CRUD /api/shifts        — manage shifts');
    console.log('    GET  /api/schedule      — today\'s schedule');
    console.log('');
});

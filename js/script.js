import { db } from "./firebase-init.js";
import { ref, get, set, remove, onValue } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
    // Navigation Logic
    const menuItems = document.querySelectorAll('.menu-item:not(#btn-logout)');
    const sections = document.querySelectorAll('.view-section');

    // Mobile Sidebar Logic
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const btnOpen = document.getElementById('open-sidebar');
    const btnCloseMenu = document.getElementById('close-sidebar');

    const toggleMenu = () => {
        if(sidebar) sidebar.classList.toggle('open');
        if(overlay) overlay.classList.toggle('active');
    };

    if(btnOpen) btnOpen.addEventListener('click', toggleMenu);
    if(btnCloseMenu) btnCloseMenu.addEventListener('click', toggleMenu);
    if(overlay) overlay.addEventListener('click', toggleMenu);

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            menuItems.forEach(m => m.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            if(targetId && document.getElementById(targetId)) {
                document.getElementById(targetId).classList.add('active');
            }

            if(targetId === 'users' || targetId === 'dashboard') window.fetchUsers();

            if(window.innerWidth <= 900) toggleMenu();
        });
    });

    // Modal Logic
    const initModal = () => {
        const modal = document.getElementById('user-modal');
        const btnAdd = document.getElementById('btn-add-user');
        const btnClose = document.querySelectorAll('.close-modal');
        const form = document.getElementById('user-form');
        const roleSelect = document.getElementById('inp-role');
        const scheduleToggle = document.getElementById('inp-schedule');
        const timeInputs = document.getElementById('time-inputs');
        const visitorSettings = document.getElementById('visitor-settings');

        const openModal = () => modal.classList.add('active');
        const closeModal = () => {
            modal.classList.remove('active');
            form.reset();
            document.getElementById('inp-uid').readOnly = false;
            const uid2Field = document.getElementById('inp-uid2');
            if(uid2Field) {
                uid2Field.readOnly = false;
                uid2Field.placeholder = "e.g. 10";
            }
            roleSelect.dispatchEvent(new Event('change'));
            scheduleToggle.dispatchEvent(new Event('change'));
        };

        btnAdd.addEventListener('click', openModal);
        btnClose.forEach(btn => btn.addEventListener('click', closeModal));

        roleSelect.addEventListener('change', (e) => {
            if(e.target.value === 'admin') {
                visitorSettings.style.display = 'none';
                scheduleToggle.checked = false;
            } else {
                visitorSettings.style.display = 'block';
            }
        });

        scheduleToggle.addEventListener('change', (e) => {
            timeInputs.style.display = e.target.checked ? 'flex' : 'none';
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const uid = document.getElementById('inp-uid').value;
            const uid2Element = document.getElementById('inp-uid2');
            const uid2 = uid2Element ? uid2Element.value : "";
            const data = {
                name: document.getElementById('inp-name').value,
                role: roleSelect.value,
                type: document.getElementById('inp-type').value,
                allowed: document.getElementById('inp-allowed').checked,
                schedule_enabled: scheduleToggle.checked,
                start_time: document.getElementById('inp-start').value || "00:00",
                end_time: document.getElementById('inp-end').value || "23:59"
            };

            try {
                // Save directly to Firebase Database for primary UID
                await set(ref(db, 'users/' + uid), data);
                
                // Save identical configuration for the secondary UID parallelly if provided!
                if (uid2 && uid2.trim() !== '') {
                    await set(ref(db, 'users/' + uid2.trim()), data);
                }
                
                closeModal();
                window.fetchUsers();
            } catch(e) {
                alert("Error saving user to database: " + e.message);
            }
        });
    };

    initModal();
    
    // === REMOTE OTA ENROLL LOGIC ===
    const initEnrollModal = () => {
        const modal = document.getElementById('enroll-modal');
        const btnOpen = document.getElementById('btn-remote-enroll');
        const btnClose = document.getElementById('close-enroll');
        const form = document.getElementById('enroll-form');
        const body = document.getElementById('enroll-body');
        
        if(!modal || !btnOpen) return;

        btnOpen.addEventListener('click', () => modal.classList.add('active'));
        if(btnClose) btnClose.addEventListener('click', () => {
            modal.classList.remove('active');
            window.location.reload(); // Hard reset struct for future renders securely
        });

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('inp-enroll-id').value;
            if(!id) return;
            
            try {
                await set(ref(db, 'system_state/enroll_target_id'), parseInt(id));
                
                // Switch UI rendering block to listening tracking mode natively
                body.innerHTML = `
                    <div style="text-align:center; padding: 20px 0px;">
                        <ion-icon name="wifi" class="pulse-icon" style="color:var(--warning); font-size: 60px;"></ion-icon>
                        <h3 style="margin-top:15px; font-weight:bold; color:var(--warning);">OTA Signal Broadcasted!</h3>
                        <p style="color:var(--text-main); margin-top:10px; line-height:1.5;">Please direct your visitor to follow the exact physical instructions dynamically rendering <b>on the Door's OLED Screen right now!</b></p>
                        <p style="color:var(--success); font-weight:bold; margin-top: 15px; display:none;" id="enroll-success-msg">Handshake intercepted successfully! You can register Key ID ${id} below.</p>
                    </div>
                `;
                
                // Firebase DB Listener confirming Device intercept
                const stateRef = ref(db, 'system_state/enroll_target_id');
                const unsubscribe = onValue(stateRef, (snapshot) => {
                    const val = snapshot.val();
                    // ESP8266 explicitly zeroes this database payload confirming handshake interception naturally
                    if (val === 0) {
                        const msg = document.getElementById('enroll-success-msg');
                        if(msg) msg.style.display = 'block';
                        unsubscribe();
                    }
                });

            } catch (err) {
                alert("Error broadcasting framework hook: " + err.message);
            }
        });
    };
    initEnrollModal();
    // === END OTA ENROLL ===
    
    // === REMOTE RFID ENROLL LOGIC ===
    const btnRemoteRfid = document.getElementById('btn-remote-rfid');
    if(btnRemoteRfid) {
        btnRemoteRfid.addEventListener('click', async () => {
            try {
                await set(ref(db, 'system_state/enroll_rfid_target'), "true");
                await set(ref(db, 'system_state/last_scanned_rfid'), "");
                
                let attempts = 0;
                btnRemoteRfid.innerHTML = '<ion-icon name="sync-outline" class="pulse-icon"></ion-icon> Scanning...';
                btnRemoteRfid.disabled = true;
                
                const pollTimer = setInterval(async () => {
                    attempts++;
                    const snapshot = await get(ref(db, 'system_state/last_scanned_rfid'));
                    const scannedUid = snapshot.val();
                    if (scannedUid && scannedUid.length > 0) {
                        clearInterval(pollTimer);
                        await set(ref(db, 'system_state/last_scanned_rfid'), ""); // flush
                        
                        btnRemoteRfid.innerHTML = '<ion-icon name="card-outline"></ion-icon> Scan RFID on Door';
                        btnRemoteRfid.disabled = false;
                        
                        document.getElementById('btn-add-user').click();
                        document.getElementById('inp-uid').value = scannedUid;
                        document.getElementById('inp-type').value = 'rfid';
                        alert('Success! RFID Card ' + scannedUid + ' was captured by the door securely and autofilled for you.');
                    } else if (attempts > 20) { // 20 secs
                        clearInterval(pollTimer);
                        await set(ref(db, 'system_state/enroll_rfid_target'), "false");
                        btnRemoteRfid.innerHTML = '<ion-icon name="card-outline"></ion-icon> Scan RFID on Door';
                        btnRemoteRfid.disabled = false;
                        alert('Scanner timed out. No card was presented at the door.');
                    }
                }, 1000);
            } catch(e) {
                alert("Error triggering remote scanner: " + e.message);
                btnRemoteRfid.innerHTML = '<ion-icon name="card-outline"></ion-icon> Scan RFID on Door';
                btnRemoteRfid.disabled = false;
            }
        });
    }

    // Initial fetch / Subscribe to Realtime Updates
    window.fetchUsers();
    window.listenToLogs();
    
    document.getElementById('btn-refresh-logs').addEventListener('click', () => { window.listenToLogs() });
});

// Fetch Users logic mapped globally
window.fetchUsers = async function() {
    try {
        const snapshot = await get(ref(db, 'users'));
        const usersObj = snapshot.val() || {};
        
        const tbody = document.getElementById('users-table-body');
        if(!tbody) return;
        tbody.innerHTML = '';
        let count = 0;

        for (const [uid, user] of Object.entries(usersObj)) {
            count++;
            
            const allowBadge = user.allowed 
                ? '<span class="badge success">Allowed</span>' 
                : '<span class="badge danger">Disallowed</span>';
                
            let scheduleText = "Always Allowed";
            if(user.role === 'visitor' && user.schedule_enabled) {
                scheduleText = `${user.start_time || '00:00'} - ${user.end_time || '23:59'}`;
            } else if(user.role === 'admin') {
                scheduleText = "Admin Access";
            }

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${uid}</strong></td>
                <td>${user.name}</td>
                <td style="text-transform: capitalize;">${user.role}</td>
                <td style="text-transform: capitalize;">${user.type || 'rfid'}</td>
                <td>${allowBadge}</td>
                <td>${scheduleText}</td>
                <td>
                    <button class="btn btn-secondary" onclick="window.editUser('${uid}')" style="display:inline-flex; padding: 6px 12px;">Edit</button>
                    <button class="btn btn-danger" onclick="window.deleteUser('${uid}')" style="display:inline-flex; padding: 6px 12px; margin-left: 5px;">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        }
        
        document.getElementById('stat-total-users').innerText = count;

    } catch (e) {
        console.error("Error fetching users", e);
    }
}

// Fetch Logs mapped globally - Using onValue for realtime dashboard updates naturally!
let isFirstLoad = true;
let notifiedLogs = new Set();

window.listenToLogs = function() {
    // Request permission purely cleanly natively
    if (Notification && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
    
    const logsRef = ref(db, 'logs');
    
    onValue(logsRef, (snapshot) => {
        const logsObj = snapshot.val() || {};
        const tbody = document.getElementById('logs-table-body');
        if(!tbody) return;
        tbody.innerHTML = '';
        
        // Convert to array and sort heavily descending based on Time
        const logsArr = Object.keys(logsObj).map(key => ({ id: key, ...logsObj[key] }));
        logsArr.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        let allowedCount = 0;
        let deniedCount = 0;

        logsArr.forEach(log => {
            if(log.action === 'UNLOCK' || log.action === 'LOCK' || log.status === 'UNLOCK') allowedCount++;
            else deniedCount++;
            
            // Notification Security Tracker
            if(log.action === 'INTRUDER_ALARM' && !notifiedLogs.has(log.id)) {
                notifiedLogs.add(log.id);
                if(!isFirstLoad) {
                    if (Notification && Notification.permission === 'granted') {
                        new Notification("⚠️ SECURITY ALERT!", { body: log.message });
                    } else {
                        alert("⚠️ INTRUDER ALARM: " + log.message);
                    }
                }
            }

            let actionBadge = "";
            let actionText = log.action || log.status || "UNKNOWN";
            
            if(actionText === 'UNLOCK') actionBadge = '<span class="badge success">UNLOCKED</span>';
            else if(actionText === 'LOCK') actionBadge = '<span class="badge warning" style="background:rgba(59,130,246,0.1); color:#3b82f6;">LOCKED</span>';
            else if(actionText === 'INTRUDER_ALARM') actionBadge = '<span class="badge danger" style="animation: pulse 1s infinite;">INTRUDER</span>';
            else actionBadge = '<span class="badge danger">DENIED</span>';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${log.timestamp}</td>
                <td><strong>${log.uid}</strong></td>
                <td>${log.name}</td>
                <td style="text-transform: capitalize;">${log.type}</td>
                <td>${actionBadge}</td>
                <td>${log.message}</td>
            `;
            tbody.appendChild(tr);
        });
        
        isFirstLoad = false;
        if(document.getElementById('stat-allowed')) document.getElementById('stat-allowed').innerText = allowedCount;
        if(document.getElementById('stat-denied')) document.getElementById('stat-denied').innerText = deniedCount;
    });
}

window.deleteUser = async function(uid) {
    if(confirm(`Are you sure you want to delete identity UID config ${uid}?`)) {
        await remove(ref(db, 'users/' + uid));
        window.fetchUsers();
    }
}

window.editUser = async function(uid) {
    const snapshot = await get(ref(db, 'users/' + uid));
    const user = snapshot.val();
    
    if(user) {
        document.getElementById('inp-uid').value = uid;
        document.getElementById('inp-uid').readOnly = true;
        
        const uid2Element = document.getElementById('inp-uid2');
        if (uid2Element) {
            uid2Element.value = "";
            uid2Element.readOnly = true; 
            uid2Element.placeholder = "Disabled in Edit Mode";
        }
        
        document.getElementById('inp-name').value = user.name;
        document.getElementById('inp-role').value = user.role || 'visitor';
        document.getElementById('inp-type').value = user.type || 'rfid';
        document.getElementById('inp-allowed').checked = user.allowed;
        document.getElementById('inp-schedule').checked = user.schedule_enabled || false;
        document.getElementById('inp-start').value = user.start_time || '';
        document.getElementById('inp-end').value = user.end_time || '';
        
        document.getElementById('inp-role').dispatchEvent(new Event('change'));
        document.getElementById('inp-schedule').dispatchEvent(new Event('change'));
        
        document.getElementById('modal-title').innerText = "Edit User Settings";
        document.getElementById('user-modal').classList.add('active');
    }
}

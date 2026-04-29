import { auth } from "./firebase-init.js";
import { db } from "./firebase-init.js";
import { get, set, ref } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    sendPasswordResetEmail,
    onAuthStateChanged,
    signOut,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js";

// Identify route securely
const isLoginPage = window.location.pathname.includes('login.html');

if (!isLoginPage) {
    // Routine for protected Dashboard (index.html)
    const loader = document.getElementById('auth-loader');
    const mainApp = document.getElementById('main-app');
    const adminName = document.getElementById('admin-user-name');

    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in.
            if(loader) loader.style.display = 'none';
            if(mainApp) mainApp.style.display = 'flex';
            if (adminName && user.displayName) {
                adminName.innerText = user.displayName;
            } else if (adminName) {
                adminName.innerText = user.email.split('@')[0];
            }
        } else {
            // No user is signed in, force redirect cleanly matching relative schemas
            window.location.replace('login.html');
        }
    });

    // Attach Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            signOut(auth).then(() => {
                window.location.replace('login.html');
            });
        });
    }

} 
// Routine for login.html
else {
    
    // UI Elements
    const btnShowLogin = document.getElementById('btn-show-login');
    const btnShowSignup = document.getElementById('btn-show-signup');
    const form = document.getElementById('auth-form');
    const nameGroup = document.getElementById('name-group');
    const deviceGroup = document.getElementById('device-group');
    const authDevice = document.getElementById('auth-device');
    const btnForgot = document.getElementById('btn-forgot-password');
    const authSubmitBtn = document.getElementById('auth-submit');
    const authError = document.getElementById('auth-error');
    
    let isLoginMode = true;

    // Fast Forward if already logged in
    onAuthStateChanged(auth, (user) => {
        if (user) window.location.href = 'index.html';
    });

    btnShowSignup.addEventListener('click', () => {
        isLoginMode = false;
        btnShowSignup.classList.add('active');
        btnShowLogin.classList.remove('active');
        nameGroup.style.display = 'block';
        if(deviceGroup) deviceGroup.style.display = 'block';
        if(btnForgot) btnForgot.parentElement.style.display = 'none';
        authSubmitBtn.innerHTML = '<ion-icon name="person-add-outline"></ion-icon> Register Admin';
        authError.style.color = "var(--danger)";
        authError.innerText = '';
    });

    btnShowLogin.addEventListener('click', () => {
        isLoginMode = true;
        btnShowLogin.classList.add('active');
        btnShowSignup.classList.remove('active');
        nameGroup.style.display = 'none';
        if(deviceGroup) deviceGroup.style.display = 'none';
        if(btnForgot) btnForgot.parentElement.style.display = 'block';
        authSubmitBtn.innerHTML = '<ion-icon name="log-in-outline"></ion-icon> Login Securely';
        authError.style.color = "var(--danger)";
        authError.innerText = '';
    });

    if(btnForgot) {
        btnForgot.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = document.getElementById('auth-email').value;
            if(!email) {
                authError.style.color = "var(--warning)";
                authError.innerText = "Please type your email above and click 'Forgot Password' again.";
                return;
            }
            try {
                await sendPasswordResetEmail(auth, email);
                authError.style.color = "var(--success)";
                authError.innerText = "Password reset sent! Check your inbox.";
            } catch(err) {
                authError.style.color = "var(--danger)";
                authError.innerText = err.message.replace("Firebase:", "").trim();
            }
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        authError.innerText = '';
        
        const email = document.getElementById('auth-email').value;
        const pass = document.getElementById('auth-password').value;
        const name = document.getElementById('auth-name').value;
        const devName = authDevice ? authDevice.value.trim() : "";

        // Visual Loading
        let initialBtnText = authSubmitBtn.innerHTML;
        authSubmitBtn.innerHTML = '<ion-icon name="refresh-outline" class="pulse-icon" style="font-size:20px; animation-duration:0.8s;"></ion-icon> Processing...';

        try {
            if (isLoginMode) {
                await signInWithEmailAndPassword(auth, email, pass);
                window.location.replace('index.html');
            } else {
                if(!devName) throw new Error("Firebase: Device Serial Key is required to authorize the hardware.");
                
                const deviceRef = ref(db, `devices/${devName}`);
                const deviceSnap = await get(deviceRef);
                
                if(deviceSnap.exists() && deviceSnap.val().registered) {
                    throw new Error("Firebase: This Device has already been claimed and registered securely!");
                }
                
                const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
                await updateProfile(userCredential.user, { displayName: name });
                
                // Map the device to this Admin
                await set(deviceRef, { registered: true, email: email, timestamp: new Date().toISOString() });
                
                window.location.replace('index.html');
            }
        } catch (error) {
            let rawMessage = error.message.replace("Firebase:", "").trim();
            
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
                rawMessage = "Wrong email or password. Please try again.";
            } else if (error.code === 'auth/email-already-in-use') {
                rawMessage = "This email is already registered.";
            } else if (error.code === 'auth/weak-password') {
                rawMessage = "Password is too weak. Please use at least 6 characters.";
            } else if (error.code === 'auth/invalid-email') {
                rawMessage = "Please enter a valid email address.";
            } else if (error.code === 'auth/too-many-requests') {
                rawMessage = "Too many failed attempts. Please try again later.";
            }

            authError.innerText = rawMessage;
            authSubmitBtn.innerHTML = initialBtnText;
            
            // Backup alert box in case HTML error div is not visible to the user locally
            if(!authError.innerText || authError.offsetHeight === 0) {
                alert("Authentication Failed: " + rawMessage);
            }
        }
    });
}

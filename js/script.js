/*******************************************
 * script.js - Versión Corregida
 *******************************************/
// Configuración REAL (para fines educativos)
const CLIENT_ID = '457814444040-rg8994mjpjf4l3crqvtqqs7takbqbdmm.apps.googleusercontent.com';
const BLOG_ID = '3894102744035730320';
let accessToken = null;

// 1. Inicialización de la API de Google
function initGoogleAPI() {
    gapi.load('client:auth2', () => {
        gapi.client.init({
            clientId: CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/blogger',
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/blogger/v3/rest'],
            redirect_uri: window.location.origin // Importante para OAuth
        }).then(() => {
            console.log('API de Google inicializada correctamente');
            checkAuthStatus();
        }).catch(error => {
            console.error('Error de inicialización:', error);
            showError('Error al cargar la API: ' + error.details);
        });
    });
}

// 2. Verificar estado de autenticación al cargar
function checkAuthStatus() {
    const auth = gapi.auth2.getAuthInstance();
    const user = auth.currentUser.get();
    
    if (user && user.hasGrantedScopes('https://www.googleapis.com/auth/blogger')) {
        accessToken = user.getAuthResponse().access_token;
        toggleUI(true);
    } else {
        toggleUI(false);
    }
}

// 3. Autenticación con Google
function authenticate() {
    gapi.auth2.getAuthInstance().signIn({
        prompt: 'select_account' // Fuerza a seleccionar cuenta
    }).then(() => {
        checkAuthStatus();
    }).catch(error => {
        showError('Error de autenticación: ' + error.error);
    });
}

// 4. Funciones CRUD mejoradas
async function executeBloggerAction(method, endpoint, data = null) {
    try {
        const response = await fetch(`https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}${endpoint}`, {
            method: method,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: data ? JSON.stringify(data) : null
        });
        
        const result = await response.json();
        
        if (!response.ok) throw new Error(result.error.message);
        return result;
        
    } catch (error) {
        throw new Error(`Operación fallida: ${error.message}`);
    }
}

// 5. Funciones específicas
async function createPost() {
    try {
        const result = await executeBloggerAction('POST', '/posts', {
            title: document.getElementById('postTitle').value,
            content: document.getElementById('postContent').value
        });
        showSuccess(`Post creado: ${result.url}`);
    } catch (error) {
        showError(error.message);
    }
}

// ... (similar para editPost y deletePost) ...

// 6. Helpers
function toggleUI(authenticated) {
    document.getElementById('auth-section').classList.toggle('d-none', authenticated);
    document.getElementById('editor-section').classList.toggle('d-none', !authenticated);
    document.querySelectorAll('#createButton, #editButton, #deleteButton')
           .forEach(btn => btn.disabled = !authenticated);
}

function showSuccess(message) {
    const status = document.getElementById('editorStatus');
    status.textContent = message;
    status.classList.remove('text-danger');
    status.classList.add('text-success');
}

function showError(message) {
    const status = document.getElementById('authStatus');
    status.textContent = message;
    status.classList.remove('text-success');
    status.classList.add('text-danger');
}

// Inicialización al cargar
window.addEventListener('load', initGoogleAPI);
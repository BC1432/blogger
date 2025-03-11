/*******************************************
 * Configuración Global
 *******************************************/
const CLIENT_ID = 'TU_CLIENT_ID';  // ¡Reemplazar!
const BLOG_ID = 'TU_BLOG_ID';      // ¡Reemplazar!
let accessToken = null;

/*******************************************
 * Inicialización de Google API
 *******************************************/
window.onload = () => {
    gapi.load('client:auth2', initializeGapi);
};

function initializeGapi() {
    gapi.client.init({
        clientId: CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/blogger',
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/blogger/v3/rest']
    }).then(() => {
        console.log('GAPI inicializado');
        updateAuthUI();
    }).catch(handleGapiError);
}

/*******************************************
 * Manejo de Autenticación
 *******************************************/
function authenticate() {
    const authInstance = gapi.auth2.getAuthInstance();
    authInstance.signIn()
        .then(updateAuthUI)
        .catch(handleAuthError);
}

function updateAuthUI() {
    const authInstance = gapi.auth2.getAuthInstance();
    const user = authInstance.currentUser.get();
    const isAuth = user?.hasGrantedScopes('https://www.googleapis.com/auth/blogger');

    if (isAuth) {
        accessToken = user.getAuthResponse().access_token;
        document.getElementById('auth-section').classList.add('d-none');
        document.getElementById('editor-section').classList.remove('d-none');
        enableButtons(true);
    } else {
        accessToken = null;
        document.getElementById('auth-section').classList.remove('d-none');
        document.getElementById('editor-section').classList.add('d-none');
        enableButtons(false);
    }
}

/*******************************************
 * Funciones CRUD Optimizadas
 *******************************************/
async function executeBloggerRequest(method, endpoint, data = null) {
    const url = `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}${endpoint}`;
    
    const config = {
        method: method,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: data ? JSON.stringify(data) : null
    };

    try {
        const response = await fetch(url, config);
        return await response.json();
    } catch (error) {
        throw new Error(`Error en la solicitud: ${error.message}`);
    }
}

// Funciones específicas para cada operación
async function createPost() {
    const postData = {
        title: document.getElementById('postTitle').value,
        content: document.getElementById('postContent').value
    };
    
    const result = await executeBloggerRequest('POST', '/posts', postData);
    handleOperationResult(result, 'Post creado exitosamente');
}

async function editPost() {
    const postId = document.getElementById('postId').value;
    const postData = {
        title: document.getElementById('postTitle').value,
        content: document.getElementById('postContent').value
    };
    
    const result = await executeBloggerRequest('PUT', `/posts/${postId}`, postData);
    handleOperationResult(result, 'Post actualizado exitosamente');
}

async function deletePost() {
    const postId = document.getElementById('postId').value;
    const result = await executeBloggerRequest('DELETE', `/posts/${postId}`);
    handleOperationResult(result, 'Post eliminado exitosamente');
}

/*******************************************
 * Helpers
 *******************************************/
function enableButtons(enabled) {
    ['createButton', 'editButton', 'deleteButton'].forEach(id => {
        document.getElementById(id).disabled = !enabled;
    });
}

function handleOperationResult(result, successMessage) {
    const statusElement = document.getElementById('editorStatus');
    
    if (result.error) {
        statusElement.textContent = `Error: ${result.error.message}`;
        statusElement.classList.add('text-danger');
    } else {
        statusElement.textContent = successMessage;
        statusElement.classList.remove('text-danger');
        statusElement.classList.add('text-success');
    }
}

function handleAuthError(error) {
    document.getElementById('authStatus').textContent = 
        `Error de autenticación: ${error.error || error.details}`;
}

function handleGapiError(error) {
    console.error('Error GAPI:', error);
    document.getElementById('authStatus').textContent = 
        'Error al cargar la API de Google. Recarga la página.';
}
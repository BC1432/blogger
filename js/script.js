/*******************************************
 * script.js
 * Ajustado para:
 * - Autenticación con Google (gapi)
 * - Crear / Editar / Borrar Posts en Blogger
 * - Uso de una política CSP que permite scripts de Google
 *******************************************/

// Reemplaza con tus datos
const CLIENT_ID = 'TU_CLIENT_ID.apps.googleusercontent.com';
const BLOG_ID   = 'TU_BLOG_ID';

// Token de acceso global
let accessToken = null;

/**
 * Se llama al cargar la ventana. Inicializa la API gapi.
 */
window.onload = initClient;

/**
 * Inicializa la librería gapi, configurando Auth2.
 */
function initClient() {
    gapi.load('client:auth2', () => {
        gapi.auth2.init({
            client_id: CLIENT_ID,
            scope: 'https://www.googleapis.com/auth/blogger'
        })
            .then(() => {
                console.log('API de Google inicializada');
                updateAuthStatus(); // Verifica si ya estamos autenticados
            })
            .catch(error => {
                console.error('Error al inicializar la API:', error);
                document.getElementById('authStatus').innerText =
                    'Error al inicializar la API: ' + (error.details || error.message || 'Desconocido');
            });
    });
}

/**
 * Inicia el proceso de autenticación con Google.
 */
function authenticate() {
    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance) {
        document.getElementById('authStatus').innerText =
            'Error: Auth2 no inicializado.';
        return;
    }

    // Llamamos a signIn() en respuesta a un clic del usuario
    authInstance.signIn()
        .then(() => {
            updateAuthStatus();
        })
        .catch(error => {
            // Este catch se activa, por ejemplo, si el usuario cierra el popup
            console.error('Error de autenticación:', error);
            document.getElementById('authStatus').innerText =
                'Error de Autenticación: ' + (error.error || error.message || 'Desconocido');
        });
}

/**
 * Actualiza la interfaz según el estado de autenticación.
 */
function updateAuthStatus() {
    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance) {
        document.getElementById('authStatus').innerText =
            'Error: Auth2 no inicializado.';
        return;
    }

    const user = authInstance.currentUser.get();
    const isAuthorized = user.hasGrantedScopes('https://www.googleapis.com/auth/blogger');

    if (isAuthorized) {
        // Almacena el token
        accessToken = user.getAuthResponse().access_token;

        document.getElementById('authStatus').innerText =
            'Autenticado correctamente.';
        document.getElementById('editor-section').classList.remove('hidden');
        document.getElementById('auth-section').classList.add('hidden');

        // Habilita los botones de CRUD
        document.getElementById('createButton').disabled = false;
        document.getElementById('editButton').disabled   = false;
        document.getElementById('deleteButton').disabled = false;
    } else {
        accessToken = null;
        document.getElementById('authStatus').innerText =
            'No Autenticado. Haz clic en "Iniciar Sesión con Google".';
        document.getElementById('editor-section').classList.add('hidden');
        document.getElementById('auth-section').classList.remove('hidden');

        // Deshabilita los botones
        document.getElementById('createButton').disabled = true;
        document.getElementById('editButton').disabled   = true;
        document.getElementById('deleteButton').disabled = true;
    }
}

/**
 * Crear un nuevo Post en Blogger.
 */
async function createPost() {
    if (!accessToken) {
        document.getElementById('editorStatus').innerText =
            'Error: No estás autenticado. Inicia sesión primero.';
        return;
    }

    const title   = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();

    if (!title || !content) {
        document.getElementById('editorStatus').innerText =
            'Error: Debes ingresar Título y Contenido para crear un Post.';
        return;
    }

    document.getElementById('editorStatus').innerText = 'Creando Post...';

    try {
        const response = await gapi.client.request({
            path: `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts`,
            method: 'POST',
            body: { title, content },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (response.status === 200) {
            document.getElementById('editorStatus').innerText =
                'Post Creado Exitosamente: ' + response.result.url;
        } else {
            document.getElementById('editorStatus').innerText =
                'Error al Crear Post: ' + response.status + ' ' + response.statusText;
            console.error('Error al crear Post:', response);
        }

    } catch (error) {
        document.getElementById('editorStatus').innerText =
            'Error al Crear Post: ' + error.message;
        console.error('Error al crear post:', error);
    }
}

/**
 * Editar un Post existente.
 */
async function editPost() {
    if (!accessToken) {
        document.getElementById('editorStatus').innerText =
            'Error: No estás autenticado. Inicia sesión primero.';
        return;
    }

    const postId  = document.getElementById('postId').value.trim();
    const title   = document.getElementById('postTitle').value.trim();
    const content = document.getElementById('postContent').value.trim();

    if (!postId) {
        document.getElementById('editorStatus').innerText =
            'Error: Necesitas el ID del Post para poder editarlo.';
        return;
    }

    if (!title && !content) {
        document.getElementById('editorStatus').innerText =
            'Error: Debes ingresar Título y/o Contenido para editar el Post.';
        return;
    }

    document.getElementById('editorStatus').innerText = 'Editando Post...';

    try {
        const response = await gapi.client.request({
            path: `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts/${postId}`,
            method: 'PUT',
            body: { title, content },
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        if (response.status === 200) {
            document.getElementById('editorStatus').innerText =
                'Post Editado Exitosamente: ' + response.result.url;
        } else {
            document.getElementById('editorStatus').innerText =
                'Error al Editar Post: ' + response.status + ' ' + response.statusText;
            console.error('Error al editar Post:', response);
        }

    } catch (error) {
        document.getElementById('editorStatus').innerText =
            'Error al Editar Post: ' + error.message;
        console.error('Error al editar post:', error);
    }
}

/**
 * Borrar un Post existente.
 */
async function deletePost() {
    if (!accessToken) {
        document.getElementById('editorStatus').innerText =
            'Error: No estás autenticado. Inicia sesión primero.';
        return;
    }

    const postId = document.getElementById('postId').value.trim();
    if (!postId) {
        document.getElementById('editorStatus').innerText =
            'Error: Debes ingresar el ID del Post para borrarlo.';
        return;
    }

    document.getElementById('editorStatus').innerText = 'Borrando Post...';

    try {
        const response = await gapi.client.request({
            path: `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts/${postId}`,
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        // DELETE puede devolver status 200 o 204 en caso de éxito
        if (response.status === 200 || response.status === 204) {
            document.getElementById('editorStatus').innerText =
                'Post Borrado Exitosamente.';
        } else {
            document.getElementById('editorStatus').innerText =
                'Error al Borrar Post: ' + response.status + ' ' + response.statusText;
            console.error('Error al borrar post:', response);
        }

    } catch (error) {
        document.getElementById('editorStatus').innerText =
            'Error al Borrar Post: ' + error.message;
        console.error('Error al borrar post:', error);
    }
}
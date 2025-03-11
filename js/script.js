/*******************************************
 * Ajustado para el nuevo HTML con:
 * - Campo de ID del post (postId)
 * - Campo de Título (postTitle)
 * - Campo de Contenido (postContent)
 * - Botones Crear / Editar / Borrar Post
 *******************************************/

// Reemplaza con tus propios datos si fuera necesario
const CLIENT_ID = '453533828701-l7rm9i7ved0mg7kvfu0oksq4t9smbakb.apps.googleusercontent.com';
const BLOG_ID   = '3894102744035730320';

// Variable global para almacenar el token de acceso
let accessToken = null;

// Inicializa el cliente de Google API al cargar la página
window.onload = initClient;

/**
 * Carga las librerías de Google y prepara la autenticación.
 */
function initClient() {
  gapi.load('client:auth2', () => {
    gapi.auth2.init({
      client_id: CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/blogger'
    })
    .then(() => {
      console.log('API de Google inicializada correctamente');
      updateAuthStatus();
    })
    .catch(error => {
      console.error('Error al inicializar la API:', error);
      document.getElementById('authStatus').innerText =
        'Error al inicializar la API: ' + (error.details || error.message || 'Desconocido');
    });
  });
}

/**
 * Inicia la autenticación con Google.
 */
function authenticate() {
  const authInstance = gapi.auth2.getAuthInstance();
  if (!authInstance) {
    document.getElementById('authStatus').innerText = 'Error: Auth2 no inicializado.';
    return;
  }

  authInstance.signIn()
    .then(() => {
      updateAuthStatus();
    })
    .catch(error => {
      console.error('Error de autenticación:', error);
      document.getElementById('authStatus').innerText =
        'Error de Autenticación: ' + (error.error || error.message || 'Desconocido');
    });
}

/**
 * Verifica si el usuario está autenticado y actualiza la interfaz.
 */
function updateAuthStatus() {
  const authInstance = gapi.auth2.getAuthInstance();
  if (!authInstance) {
    document.getElementById('authStatus').innerText = 'Error: Auth2 no inicializado.';
    return;
  }

  const user = authInstance.currentUser.get();
  const isAuthorized = user.hasGrantedScopes('https://www.googleapis.com/auth/blogger');
  
  if (isAuthorized) {
    // Obtenemos el token de acceso
    accessToken = user.getAuthResponse().access_token;

    // Mensaje de éxito y ajustes en la interfaz
    document.getElementById('authStatus').innerText = 'Autenticado Correctamente.';
    document.getElementById('editor-section').classList.remove('hidden');
    document.getElementById('auth-section').classList.add('hidden');

    // Habilitar botones de edición
    document.getElementById('createButton').disabled = false;
    document.getElementById('editButton').disabled   = false;
    document.getElementById('deleteButton').disabled = false;

  } else {
    // Usuario NO autenticado
    accessToken = null;
    document.getElementById('authStatus').innerText =
      'No Autenticado. Haz clic en "Iniciar Sesión con Google".';
    
    // Ocultar sección del editor y mostrar login
    document.getElementById('editor-section').classList.add('hidden');
    document.getElementById('auth-section').classList.remove('hidden');

    // Deshabilitar botones
    document.getElementById('createButton').disabled = true;
    document.getElementById('editButton').disabled   = true;
    document.getElementById('deleteButton').disabled = true;
  }
}

/**
 * Crea un nuevo Post en Blogger.
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
      'Error: Debes ingresar Título y Contenido para crear un post.';
    return;
  }

  document.getElementById('editorStatus').innerText = 'Creando Post...';

  try {
    const response = await gapi.client.request({
      path: `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts`,
      method: 'POST',
      body: { title, content },
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (response.status === 200) {
      document.getElementById('editorStatus').innerText =
        'Post Creado Exitosamente: ' + response.result.url;
    } else {
      document.getElementById('editorStatus').innerText =
        'Error al Crear Post: ' + response.status + ' ' + response.statusText;
      console.error('Error al crear post:', response);
    }
  } catch (error) {
    document.getElementById('editorStatus').innerText =
      'Error al Crear Post: ' + error.message;
    console.error('Error al crear post:', error);
  }
}

/**
 * Edita un Post existente en Blogger.
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
      'Error: Debes ingresar el ID del Post que deseas editar.';
    return;
  }

  if (!title && !content) {
    document.getElementById('editorStatus').innerText =
      'Error: Debes ingresar al menos Título o Contenido para editar el Post.';
    return;
  }

  document.getElementById('editorStatus').innerText = 'Editando post...';

  try {
    const response = await gapi.client.request({
      path: `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts/${postId}`,
      method: 'PUT',
      body: { title, content },
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    if (response.status === 200) {
      document.getElementById('editorStatus').innerText =
        'Post Editado Exitosamente: ' + response.result.url;
    } else {
      document.getElementById('editorStatus').innerText =
        'Error al Editar Post: ' + response.status + ' ' + response.statusText;
      console.error('Error al editar post:', response);
    }
  } catch (error) {
    document.getElementById('editorStatus').innerText =
      'Error al Editar Post: ' + error.message;
    console.error('Error al editar post:', error);
  }
}

/**
 * Elimina un Post existente en Blogger.
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
      'Error: Debes ingresar el ID del Post que deseas borrar.';
    return;
  }

  document.getElementById('editorStatus').innerText = 'Borrando post...';

  try {
    const response = await gapi.client.request({
      path: `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts/${postId}`,
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    // DELETE suele devolver un objeto vacío con status 204 en caso de éxito
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

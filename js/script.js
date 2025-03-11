let accessToken = null;
        const CLIENT_ID = '453533828701-l7rm9i7ved0mg7kvfu0oksq4t9smbakb.apps.googleusercontent.com'; // ¡REEMPLAZA con tu ID de cliente de Google Cloud!
        const BLOG_ID = '3894102744035730320'; // ¡REEMPLAZA con el ID de tu blog de Blogger!

        function initClient() {
            gapi.load('client:auth2', () => {
                gapi.auth2.init({
                    client_id: CLIENT_ID,
                    scope: 'https://www.googleapis.com/auth/blogger',
                }).then(() => {
                    console.log('API inicializada correctamente');
                    updateAuthStatus();
                }).catch(error => {
                    console.error('Error al inicializar la API:', error);
                    document.getElementById('authStatus').innerText = 'Error al inicializar la API: ' + error.details;
                });
            });
        }

        function authenticate() {
            const authInstance = gapi.auth2.getAuthInstance();
            if (!authInstance) {
                document.getElementById('authStatus').innerText = 'Error: Auth2 no inicializado.';
                return;
            }

            authInstance.signIn().then(() => {
                updateAuthStatus();
            }).catch(error => {
                console.error('Error de autenticación:', error);
                document.getElementById('authStatus').innerText = 'Error de Autenticación: ' + (error.error || error.message || 'Desconocido');
            });
        }

        function updateAuthStatus() {
            const authInstance = gapi.auth2.getAuthInstance();
            if (!authInstance) {
                document.getElementById('authStatus').innerText = 'Error: Auth2 no inicializado.';
                return;
            }

            const user = authInstance.currentUser.get();
            const isAuthorized = user.hasGrantedScopes('https://www.googleapis.com/auth/blogger');
            if (isAuthorized) {
                accessToken = user.getAuthResponse().access_token;
                document.getElementById('authStatus').innerText = 'Autenticado Correctamente.';
                document.getElementById('editButton').disabled = false; // Habilitar el botón de edición
                document.getElementById('editor-section').classList.remove('hidden'); // Mostrar la sección del editor
                document.getElementById('auth-section').classList.add('hidden'); // Ocultar el botón de autenticación
            } else {
                document.getElementById('authStatus').innerText = 'No Autenticado. Haz clic en "Iniciar Sesión con Google".';
                document.getElementById('editButton').disabled = true; // Deshabilitar el botón de edición
                document.getElementById('editor-section').classList.add('hidden'); // Ocultar la sección del editor
                document.getElementById('auth-section').classList.remove('hidden'); // Mostrar el botón de autenticación
            }
        }

        async function editPost() {
            if (!accessToken) {
                document.getElementById('editStatus').innerText = 'Error: No estás autenticado. Inicia sesión primero.';
                return;
            }

            const postId = document.getElementById('postId').value;
            const content = document.getElementById('content').value;

            if (!postId || !content) {
                document.getElementById('editStatus').innerText = 'Error: Por favor, ingresa el ID del Post y el Nuevo Contenido.';
                return;
            }

            document.getElementById('editStatus').innerText = 'Editando post...';

            try {
                const response = await gapi.client.request({
                    path: `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts/${postId}`,
                    method: 'PUT',
                    body: {
                        content: content,
                    },
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (response.status === 200) {
                    document.getElementById('editStatus').innerText = 'Post Editado Exitosamente: ' + response.result.url;
                } else {
                    document.getElementById('editStatus').innerText = 'Error al Editar Post: ' + response.status + ' ' + response.statusText;
                    console.error('Error al editar post:', response);
                }
            } catch (error) {
                document.getElementById('editStatus').innerText = 'Error al Editar Post: ' + error.message;
                console.error('Error al editar post:', error);
            }
        }

        // Inicializar el cliente al cargar la página
        window.onload = initClient;
const API_KEY = 'AIzaSyAxnLLHBgT8l4Y60Kov6M_C9mYvoIV06II';
const BLOG_ID = '2499792346422287330'; // Replace with your actual Blog ID
const BASE_URL = `https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts`;


function authenticate() {
    return gapi.auth2.getAuthInstance()
        .signIn({scope: "https://www.googleapis.com/auth/blogger"})
        .then(() => { console.log("Authenticated successfully!"); },
              (err) => { console.error("Error during authentication", err); });
  }
  
  function loadClient() {
    gapi.client.setApiKey(${API_KEY});  // Puedes añadir la clave de API aquí
    return gapi.client.load("https://content.googleapis.com/discovery/v1/apis/blogger/v3/rest")
        .then(() => { console.log("API client loaded successfully"); },
              (err) => { console.error("Error loading API client", err); });
  }
  
  // Llama a authenticate() primero, luego loadClient()
  authenticate().then(loadClient);


  function createPost(token, title, content, labels) {
    fetch(`https://www.googleapis.com/blogger/v3/blogs/${BLOG_ID}/posts`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: title,
            content: content,
            labels: labels
        })
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
  }




document.getElementById('postForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const postId = document.getElementById('postId').value;
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const labels = document.getElementById('postLabels').value.split(',');

    if (!postId) {
        createPost(title, content, labels);
    }
});

document.getElementById('editBtn').addEventListener('click', function () {
    const postId = document.getElementById('postId').value;
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const labels = document.getElementById('postLabels').value.split(',');

    if (postId) {
        editPost(postId, title, content, labels);
    } else {
        alert('Please enter a Post ID to edit.');
    }
});

document.getElementById('deleteBtn').addEventListener('click', function () {
    const postId = document.getElementById('postId').value;

    if (postId) {
        deletePost(postId);
    } else {
        alert('Please enter a Post ID to delete.');
    }
});

function createPost(title, content, labels) {
    const data = {
        title: title,
        content: content,
        labels: labels
    };

    fetch(`${BASE_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('result').textContent = `Post created successfully! ID: ${data.id}`;
        })
        .catch(error => {
            document.getElementById('result').textContent = `Error creating post: ${error.message}`;
        });
}

function editPost(postId, title, content, labels) {
    const data = {
        title: title,
        content: content,
        labels: labels
    };

    fetch(`${BASE_URL}/${postId}?key=${API_KEY}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById('result').textContent = `Post edited successfully! ID: ${data.id}`;
        })
        .catch(error => {
            document.getElementById('result').textContent = `Error editing post: ${error.message}`;
        });
}

function deletePost(postId) {
    fetch(`${BASE_URL}/${postId}?key=${API_KEY}`, {
        method: 'DELETE'
    })
        .then(() => {
            document.getElementById('result').textContent = `Post deleted successfully!`;
        })
        .catch(error => {
            document.getElementById('result').textContent = `Error deleting post: ${error.message}`;
        });
}
import { createClient } from '@supabase/supabase-js'; // Import the createClient function from Supabase

// Initialize Supabase
const supabaseUrl = 'https://wvgwihqldnhbcjszgqoi.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2Z3dpaHFsZG5oYmNqc3pncW9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzczMzUwNjIsImV4cCI6MjA1MjkxMTA2Mn0.iiUN_RR85G4X9XtI731iJ94CoE1svkVzY19pQr-9oc0';
const supabase = createClient(supabaseUrl, supabaseKey); // Initialize Supabase client

let page = 0;
const pageSize = 5;

// Fetch posts with infinite scroll
async function loadPosts() {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize);

    if (error) {
      throw error;
    }

    // Loop through posts and display them
    posts.forEach(post => {
      const postElement = document.createElement('div');
      postElement.className = 'post';
      postElement.id = `post-${post.id}`;
      postElement.innerHTML = `
        <p>${post.content}</p>
        <div class="actions">
          <button onclick="likePost(${post.id})">Like</button>
          <button onclick="commentPost(${post.id})">Comment</button>
          <button onclick="removePost(${post.id})">Remove</button>
        </div>
      `;
      document.getElementById('posts').appendChild(postElement);
    });

    // Hide loading when done
    document.getElementById('loading').style.display = 'none';
  } catch (error) {
    console.error('Error loading posts:', error);
  }
}

// Like a post
async function likePost(postId) {
  try {
    const { data, error } = await supabase
      .from('likes')
      .insert([{ user_id: supabase.auth.user().id, post_id: postId }]);

    if (error) {
      throw error;
    }

    alert('Liked!');
  } catch (error) {
    console.error('Error liking post:', error);
  }
}

// Comment on a post
async function commentPost(postId) {
  const comment = prompt('Enter your comment:');
  if (comment) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([{ user_id: supabase.auth.user().id, post_id: postId, comment }]);

      if (error) {
        throw error;
      }

      alert('Commented!');
    } catch (error) {
      console.error('Error commenting on post:', error);
    }
  }
}

// Remove a post
async function removePost(postId) {
  try {
    const { data, error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) {
      throw error;
    }

    alert('Post removed!');
    const postElement = document.getElementById(`post-${postId}`);
    if (postElement) {
      postElement.remove();
    }
  } catch (error) {
    console.error('Error removing post:', error);
  }
}

// Infinite scroll logic
window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 100) {
    page++;
    document.getElementById('loading').style.display = 'block';
    loadPosts();
  }
});

// Load initial posts
loadPosts();

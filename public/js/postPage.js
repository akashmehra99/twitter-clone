$(document).ready(() => {
  $.get(`/api/posts/${postID}`, (post) => {
    displayPostsWithReplies(post, $(".postsContainer"));
  });
});

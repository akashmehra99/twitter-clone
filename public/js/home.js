$(document).ready(() => {
  $.get("/api/posts", (posts) => {
    displayPosts(posts, $(".postsContainer"));
  });
});

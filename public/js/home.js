$(document).ready(() => {
  $.get("/api/posts", { followingOnly: true }, (posts) => {
    displayPosts(posts, $(".postsContainer"));
  });
});

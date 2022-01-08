$(document).ready(() => {
  loadPosts();
});

const loadPosts = () => {
  $.get(
    "/api/posts",
    { postedBy: profileUserId, isReply: selectedTab === "replies" },
    (posts) => {
      displayPosts(posts, $(".postsContainer"));
    }
  );
};

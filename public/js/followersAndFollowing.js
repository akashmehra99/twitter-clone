$(document).ready(() => {
  if (selectedTab === "following") {
    loadFollowing();
  } else {
    loadFollowers();
  }
});

const loadFollowing = () => {
  $.get(`/api/users/${profileUserId}/following`, (user) => {
    displayUsers(user.following, $(".resultsContainer"));
  });
};

const loadFollowers = () => {
  $.get(`/api/users/${profileUserId}/followers`, (user) => {
    displayUsers(user.followers, $(".resultsContainer"));
  });
};

const displayUsers = (users, container) => {
  container.html("");
  users.forEach((user) => {
    const userHtml = createUserHTML(user, true);
    container.append(userHtml);
  });
  if (!users.length) {
    container.append("<span class='no-results'>No results found</span>");
  }
};

const createUserHTML = (user, showFollowButton) => {
  const { firstName, lastName, profilePic, username, _id } = user;
  let followBtn = "";
  if (showFollowButton && userLoggedIn._id !== _id) {
    let isFollowing =
      userLoggedIn.following && userLoggedIn.following.includes(_id);
    let text = isFollowing ? "Following" : "Follow";
    let buttonClass = isFollowing ? "followButton following" : "followButton";
    followBtn = `
        <div class="followBtnContainer">
            <button class="${buttonClass}" data-user="${_id}">${text}</button>
        </div>
    `;
  }
  return `
        <div class="user">
            <div class="userImageContainer">
                <img src="${profilePic}" />
            </div>
            <div class="userDetailsContainer">
                <div class="header">
                    <a href="/profile/${username}">${firstName} ${lastName}</a>
                    <span class="username">@${username}</span>
                </div>
            </div>
            ${followBtn}
        <div>
    `;
};

$("#postTextarea, #replyTextarea").keyup((event) => {
  const textareaElm = $(event.target);
  const postTextValue = textareaElm.val().trim();
  const isModal = textareaElm.parents(".modal").length > 0;
  const submitPostButton = isModal
    ? $("#submitReplyButton")
    : $("#submitPostButton");
  if (submitPostButton) {
    postTextValue
      ? submitPostButton.prop("disabled", false)
      : submitPostButton.prop("disabled", true);
  }
});

$("#submitPostButton, #submitReplyButton").click((event) => {
  const submitButton = $(event.target);
  const isModal = submitButton.parents(".modal").length > 0;
  const textareaElm = isModal ? $("#replyTextarea") : $("#postTextarea");
  let data = {
    content: textareaElm.val(),
  };
  if (isModal) {
    data.replyTo = submitButton.data().id;
  }
  $.post("/api/posts", data, (postData, status, xhr) => {
    if (postData.replyTo) {
      location.reload();
    } else {
      let postHTMLContent = createPostHTML(postData);
      $(".postsContainer").prepend(postHTMLContent);
      textareaElm.val("");
      submitButton.prop("disabled", true);
    }
  });
});

$("#replyModal").on("show.bs.modal", (event) => {
  const commentButton = $(event.relatedTarget);
  const postID = getPostIDfromElement(commentButton);
  $("#submitReplyButton").data("id", postID);
  $.get("/api/posts/" + postID, (post) => {
    displayPosts([post.post], $("#originalPostContainer"));
  });
});

$("#deletePostModal").on("show.bs.modal", (event) => {
  const deletePostButton = $(event.relatedTarget);
  const postID = getPostIDfromElement(deletePostButton);
  $("#deletePostButton").data("id", postID);
});

$("#deletePostButton").click((event) => {
  const postID = $(event.target).data("id");
  $.ajax({
    url: `/api/posts/${postID}`,
    type: "DELETE",
    success: () => {
      location.reload();
    },
    error: (error) => console.log("Error in Delete -> ", error),
  });
});

$("#replyModal").on("hidden.bs.modal", () => {
  displayPosts([], $("#originalPostContainer"));
});

$(document).on("click", ".likeButton", (event) => {
  const likeButton = $(event.target);
  const postID = getPostIDfromElement(likeButton);
  const likeButtonParent = likeButton.closest(".postButtonContainer");
  if (postID) {
    $.ajax({
      url: `/api/posts/${postID}/like`,
      type: "PUT",
      success: (postData) => {
        likeButtonParent.find(".likeCount").text(postData.likes.length || "");
        if (postData.likes.includes(userLoggedIn._id)) {
          likeButtonParent.addClass("active");
        } else {
          likeButtonParent.removeClass("active");
        }
      },
      error: (error) => console.log("Error in like -> ", error),
    });
  } else {
    console.log("Post id -> ", postID);
  }
});

$(document).on("click", ".retweetButton", (event) => {
  const retweetButton = $(event.target);
  const postID = getPostIDfromElement(retweetButton);
  const retweetButtonParent = retweetButton.closest(".postButtonContainer");
  if (postID) {
    $.ajax({
      url: `/api/posts/${postID}/retweet`,
      type: "POST",
      success: (postData) => {
        retweetButtonParent
          .find(".retweetCount")
          .text(postData.retweetUsers.length || "");
        if (postData.retweetUsers.includes(userLoggedIn._id)) {
          retweetButtonParent.addClass("active");
        } else {
          retweetButtonParent.removeClass("active");
        }
      },
      error: (error) => console.log("Error in like -> ", error),
    });
  } else {
    console.log("Post id -> ", postID);
  }
});

$(document).on("click", ".post", (event) => {
  const postCard = $(event.target);
  const postID = getPostIDfromElement(postCard);
  if (postID && !postCard.is("button") && !postCard.is("i")) {
    window.location.href = `post/${postID}`;
  }
});

$(document).on("click", ".followButton", (event) => {
  const followBtn = $(event.target);
  const userID = followBtn.data().user;
  if (userID) {
    $.ajax({
      url: `/api/users/${userID}/follow`,
      type: "PUT",
      success: (data, status, xhr) => {
        if (xhr.status === 404) {
          console.log("user not found");
          return;
        }
        let diff = 1;
        if (data.following && data.following.includes(userID)) {
          followBtn.addClass("following");
          followBtn.text("Following");
        } else {
          followBtn.removeClass("following");
          followBtn.text("Follow");
          diff = -1;
        }
        const followersCountElm = $("#followersCount");
        if (followersCountElm.length) {
          followersCountElm.text(+followersCountElm.text() + diff);
        }
      },
      error: (error) => console.log("Error in follow -> ", error),
    });
  } else {
    console.log("Post id -> ", postID);
  }
});

const getPostIDfromElement = (element) => {
  const isRootElement = element.hasClass("post");
  const rootElement = isRootElement ? element : element.closest(".post");
  const postID = rootElement && rootElement.data().id;
  return postID;
};

const createPostHTML = (postData, largeFont = false) => {
  const isRetweet = !!postData.retweetData;
  const retweetBy = isRetweet ? postData.postedBy.username : null;
  postData = isRetweet ? postData.retweetData : postData;
  const { postedBy, content, createdAt, _id, likes, retweetUsers, replyTo } =
    postData;
  const {
    profilePic,
    username,
    firstName,
    lastName,
    _id: postedById,
  } = postedBy;
  const timestamp = timeDifference(new Date(), new Date(createdAt));
  const postLikedCSS = likes.includes(userLoggedIn._id) ? "active" : "";
  const postRetweetCSS = retweetUsers.includes(userLoggedIn._id)
    ? "active"
    : "";
  const largeFontClass = largeFont ? "largeFont" : "";
  let retweetText = "";
  if (isRetweet) {
    retweetText = `<span>
                    <i class="fas fa-retweet"></i>
                    Retweeted by <a href="/profile/${retweetBy}">@${retweetBy}</a>
                </span>`;
  }
  let replyFlag = "";
  if (replyTo) {
    if (replyTo._id && replyTo.postedBy) {
      const { username } = replyTo.postedBy;
      replyFlag = `
        <div class="replyFlag">
          Replying to <a href="/profile/${username}">@${username}</a>
        </div>
      `;
    }
  }

  let deleteButton = "";
  if (postedById === userLoggedIn._id) {
    deleteButton = `<button data-id="${_id}" data-toggle="modal" data-target="#deletePostModal">
      <i class="far fa-trash-alt"></i>
    </button>`;
  }
  return `<div class="post ${largeFontClass}" data-id='${_id}'>
            <div class="postActionContainer">
                ${retweetText}
            </div>
            <div class="mainContentContainer">
                <div class="userImageContainer">
                    <img src="${profilePic}">
                </div>
                <div class="postContentContainer">
                    <div class="postHeader">
                        <a href="/profile/${username}" class="fullName"> ${firstName} ${lastName}</a>
                        <span class="username">@${username}</span>
                        <span class="date">${timestamp}</span>
                        ${deleteButton}
                    </div>
                    ${replyFlag}
                    <div class="postBody">
                        <span>${content}</span>
                    </div>
                    <div class="postFooter">
                        <div class="postButtonContainer">
                            <button data-toggle="modal" data-target="#replyModal">
                                <i class="far fa-comment"></i>
                            </button>
                        </div>
                        <div class="postButtonContainer green ${postRetweetCSS}">
                            <button class="retweetButton">
                                <i class="fas fa-retweet"></i>
                            </button>
                            <span class="retweetCount">${
                              retweetUsers.length || ""
                            }</span>
                        </div>
                        <div class="postButtonContainer red ${postLikedCSS}">
                            <button class="likeButton">
                                <i class="far fa-heart"></i>
                            </button>
                            <span class="likeCount">${likes.length || ""}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
};

const displayPosts = (posts, containerElement) => {
  containerElement.html("");
  let postsHTML = "";
  posts.forEach((post) => {
    postsHTML += createPostHTML(post);
  });
  if (postsHTML) {
    containerElement.append(postsHTML);
  } else {
    const noPostsHTML = `<span class="noPosts">Nothing to show.</span>`;
    containerElement.append(noPostsHTML);
  }
};

const displayPostsWithReplies = (posts, containerElement) => {
  containerElement.html("");
  let postsHTML = "";
  if (posts.replyTo && posts.replyTo._id) {
    postsHTML += createPostHTML(posts.replyTo);
  }
  postsHTML += createPostHTML(posts.post, true);
  posts &&
    posts.replies &&
    posts.replies.forEach((reply) => {
      postsHTML += createPostHTML(reply);
    });
  if (postsHTML) {
    containerElement.append(postsHTML);
  } else {
    const noPostsHTML = `<span class="noPosts">Nothing to show.</span>`;
    containerElement.append(noPostsHTML);
  }
};

const timeDifference = (current, previous) => {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    if (elapsed / 1000 < 30) {
      return "Just Now";
    } else {
      return Math.round(elapsed / 1000) + " seconds ago";
    }
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + " minutes ago";
  } else if (elapsed < msPerDay) {
    return Math.round(elapsed / msPerHour) + " hours ago";
  } else if (elapsed < msPerMonth) {
    return Math.round(elapsed / msPerDay) + " days ago";
  } else if (elapsed < msPerYear) {
    return Math.round(elapsed / msPerMonth) + " months ago";
  } else {
    return Math.round(elapsed / msPerYear) + " years ago";
  }
};

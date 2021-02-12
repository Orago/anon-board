// client-side js, loaded by index.html
// run by the browser each time the page is loaded

console.log("hello world :o");

// define variables that reference elements on our page
const postsList = document.getElementById("posts");
const type = document.getElementById("type");
const options = document.getElementById("options");
const Name = document.getElementById(`${type.innerHTML}Name`);
const postsForm = document.querySelector("form");
// a helper function that creates a list item for a given dream
function appendNewPost(post,number) {
  const newListItem = document.createElement("li");
  if (post.name === "anon"){newListItem.innerText = `#${number} Anon: ${post.text}`;}
  else if (post.name){newListItem.innerText = `#${number} Fake Anon (${post.name}): ${post.text}`;}
  postsList.appendChild(newListItem);
}

// fetch the initial list of dreams
fetch("/postlist")
  .then(response => response.json()) // parse the JSON from the server
  .then(data => {
  
  if (data.options.names === "true"){document.getElementById(`nameInput`).style.display ='inline-block';}
  if (data.options.names === "hidden"){document.getElementById("assets").innerHTML+=`<button class="easter_egg" onclick="document.getElementById('nameInput').style.display ='block';alert('Shhh')">You found me!</button>`}
  var posts = data.database[Name.text];
    // remove the loading text
    postsList.firstElementChild.remove();
  
    // iterate through every dream and add it to our page
    //posts.forEach(appendNewPost);
    var post_number = 0;
    while (post_number < posts.length){
      var num = posts.length-post_number-1;
      appendNewPost(posts[num],num);
      post_number++
      
    }
  
    // listen for the form to be submitted and add a new dream when it is
    postsForm.addEventListener("submit", event => {
      // stop our form submission from refreshing the page
      //event.preventDefault();

      // get dream value and add it to the list
      let newPost = postsForm.elements.text.value;
      posts.push(newPost);
      appendNewPost(newPost);

      // reset form
      postsForm.reset();
      postsForm.elements.post.focus();
    });
  });
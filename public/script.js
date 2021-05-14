// client-side js, loaded by index.html
// run by the browser each time the page is loaded

  async function Api(input){
    var o=o||"";
    var r = await fetch(`/api/${input}`).then(l => l.json()).then(l => l.response)
    return r;
  }
// define variables that reference elements on our page
var postsList,
    type,
    options,
    Name,
    postsForm;
function getUrl(url){ var parser = document.createElement('a'); parser.href = url; parser.path = parser.pathname.substring(0, parser.pathname.lastIndexOf('/')) + "/"; return parser; }
function search(param){ let paramQuery = (new URL(document.location)).searchParams; function getUrl(url){ var parser = document.createElement('a'); parser.href = url; parser.path = parser.pathname.substring(0, parser.pathname.lastIndexOf('/')) + "/"; return parser; } var result = {}; if ( paramQuery.get( param ) !== null) result.query = paramQuery.get( param ); if ( getUrl(window.location.href).hash !== null) result.hash = getUrl(window.location.href).hash; if ( getUrl(window.location.href).protocol !== null) result.protocol = getUrl(window.location.href).protocol; if ( getUrl(window.location.href).pathname !== null){ var items = getUrl(window.location.href).pathname.split("/"); items.forEach((e,i)=>{ if (e.length <=0) items.splice(i,1) }); result.path = items; } return result; }

window.addEventListener("load", async function() {
  postsList = document.getElementById("posts");
  type = await Api(`options/`).then((res)=>{return res.communityType;});
  options = await Api(`options/`).then((res)=>{return res});
  Name = search("search").query || search("search").path[1] || "general";
  document.getElementById("inputName").value = Name;
  document.getElementById("inputName").setAttribute("name",type);
  document.getElementById("textTitle").innerHTML = `${caps(type)}: ${caps(Name)}`
  
  postsForm = document.querySelector("form");
  loadPosts();
  
});
// a helper function that creates a list item for a given dream
function appendNewPost(post,number) {
  const newListItem = document.createElement("li");
  if (post.name === "anon"){newListItem.innerText = `#${number} Anon: ${post.text}`;}
  else if (post.name){newListItem.innerText = `#${number} Fake Anon (${post.name}): ${post.text}`;}
  postsList.appendChild(newListItem);
  
}

// fetch the initial list of dreams
function loadPosts(){
  fetch("/postlist")
  .then(response => response.json()) // parse the JSON from the server
  .then(data => {
  
  if (data.options.names === "true"){document.getElementById(`nameInput`).style.display ='inline-block';}
  if (data.options.names === "hidden"){document.getElementById("assets").innerHTML+=`<button class="easter_egg" onclick="document.getElementById('nameInput').style.display ='block';alert('Shhh')">You found me!</button>`}
  var posts = data.database[Name];
console.log(Name); 
  console.log(data); 
    if (postsList.firstElementChild)
    postsList.firstElementChild.remove();
    
    var post_number = 0;
    
    while (post_number < posts.length){
      var num = posts.length-post_number-1;
      appendNewPost(posts[num],num);
      post_number++
      
    }

    postsForm.addEventListener("submit", event => {
      let newPost = postsForm.elements.text.value;
      posts.push(newPost);
      appendNewPost(newPost);

      // reset form
      postsForm.reset();
      postsForm.elements.post.focus();
    });
  });
}
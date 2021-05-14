// Setup basic express server
const express = require("express");
const fs = require("fs");
const database_location = __dirname + "/database.json";
const database = JSON.parse(fs.readFileSync(database_location));
const app = express();
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: true });

var port = process.env.PORT || 3232;

function html_check(x) {return /<\s*[^>]*>/g.test(x);}
function a0(x) {return /[^a-z0-9]/i.test(x);}
var options = database.options;
setInterval(function(){ 
  fs.writeFileSync(database_location, JSON.stringify(database, null, 2));
  console.log(`Saving Database on bot server!`);
}, 180000);
if (database.options.env_overide === true && process.env.env_overide === "true"){
  options = {
  "passcode":process.env.passcode,
  "env_overide":process.env.envOveride,
  "owner": process.env.owner,
  "creator": database.options.creator,
    "communityType": process.env.communityType,
    "support":{"text":process.env.supportText,"link":process.env.supportLink},
    "homepage":{"text":process.env.homepageText,"link":process.env.homepageLink},
  "names":process.env.names,
  "default":process.env.default
  }
}

const communityType = options.communityType;
const communityTypePlural = options.communityTypePlural;
// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

function msg(text,url,queries) {
  var text;
  if (!text) {
    text = "ERROR";
  }
  if (!queries){
    queries = "";
  }
  if (!url) {
    url = "";
  }
  return `<meta http-equiv="Refresh" content="0; url='/${url}?notification=${text}${queries}'"/>`;
}


// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
return response.render("slash.ejs",{values:{title:`${options.owner}'s Anon${communityType}`},options:options,communityType:communityType});
});


app.get(`/${communityType}`, (request, response) => {
  var Name = request.query.search;
  if (!Name) return response.send(msg(`Please search for a specific ${communityType}.`));
  if (!database[communityType][Name]) response.send(`There is no ${communityType} with the name ${Name}`);
  //"communityName":Name,"type":communityType,
  var values = {title:`${options.owner}'s ${communityType}: ${Name}`}
  return response.render("community.ejs",{"values":values});
});

app.post("/new-post", urlencodedParser, (request, response) => {
var name = request.body.name,
    text = request.body.body,
    extra_notification="";
  
  if (!name) name = "anon";
  
  if (options.names === "false"){
    if (name){
      name = "anon";
      extra_notification+=`(Btw. your name wasn't set because the custom name option was disabled).`;
    }
  }
  
  if (!text)return response.send( msg("Missing Text") );
  
  if (request.body[communityType]){
    if (a0(request.body[communityType])) return response.send(msg(`A ${communityType} cannot include custom characters`));
  }
  
if (!request.body[communityType]) request.body[communityType] = "general";
  
if(!database[communityType][request.body[communityType]]) database[communityType][request.body[communityType]]=[]
  
database[communityType][request.body[communityType]].push({"name":name,"text":text});
  
return response.send(msg("Post Created!",`${communityType}`,`${extra_notification}&search=${request.body[communityType]}`));
});


app.get("/postlist", (request, response) => {response.send({database:database.board,options:options});});

app.get("/settings",  (request, response) => {
return response.render("settings.ejs");
})

app.post("/settings", urlencodedParser, (request, response) => {
  var setting = request.body.setting,
      variables = {
        [communityType]:request.body[communityType],
        passcode:request.body.passcode,
        number:request.body
      }
  
  if (!database[communityType][variables[communityType]]) response.send(msg("Invalid Board!"));
  
  if (variables.passcode !== options.passcode) return response.send(msg("Invalid Password!"));
  
  switch (setting) {
  case `delete-post`: 
      if (isNaN(variables.number)){return response.send(msg("No numbers please!","settings")); }
      database[communityType][variables[communityType]].splice(variables.number,1);
      return response.send(msg("Successful!","settings")); 
  break;
      
  case `reset-${communityType}`: 
      database[communityType][variables[communityType]];
      return response.send(msg("Successful!","settings"));
  break;
}
return response.send(msg("No Setting found for that!","settings"));
});


// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});


app.post(`/new-${communityType}`, urlencodedParser, (request, response) => {
  console.log(msg(`${communityType} Created successfully`,`${communityType}`,`&search=${request.body[communityType]}`))
  
  if (!request.body[communityType]) return response.send(msg(`Huh there should be a ${communityType} Input here.`));
  if (database[communityType][request.body[communityType]]) return response.send(msg(`There is already a ${communityType} with this name.`));
  
  else
  {
    database[communityType][request.body[communityType]]=[]; 
    return response.send(msg(`${communityType} Created successfully`,`${communityType}`,`&search=${request.body[communityType]}`));
  }
})

app.get("/api/:method?/:search?/:query?",  (request, response) => {
  var search = request.params.search||request.query.search,
      method = request.params.method||request.query.method,
      query = request.params.query||request.query.query,
      res = "response";
  
  if (!method) {return response.json({ error: "method" });}
  
  if (method) {
    if (method === "page"){
      if (search===communityType){
        if (!search) return response.send(msg(`Please search for a specific ${communityType}.`));
        if (!database[communityType][search]) return response.json({status:200, [res]: "id_from_database", "id":query});
        var values = {"communityName":search,"type":communityType}
        var vals = {
          values:values
        }
      return response.json({status:200,[res]:vals||"error"});
      }
    
    }
    else
    if (method==="settings"){
      var vals = {
        "type":communityType
      }
    
      return response.json({status:200,[res]:vals||"error"});
    }
    else
    if (method==="slash"){
      var vals = {
        communityType:communityType,
        [communityTypePlural]:JSON.stringify(database[communityType])
      }
    
      return response.json({status:200,[res]:vals||"error"});
    }
    else
    if (method==="options"){
      var vals = Object.assign({}, options)||"error";
      delete vals.passcode;
      
      return response.json({status:200,[res]:vals||"error"});
    }
    else
    if (method === `${communityTypePlural}`){
      if (search === `${communityType}`){
        var ob = database[communityType][query];
        if (typeof ob == "undefined"){return response.json({status:200, [res]: "id_from_database", "id":query});}
        var vals = ob;
        
        return response.json({status:200,[res]:vals||"error"});
      }
      else
      if (search === `${communityType}List`||search === `${communityType}list`){
        var vals = Object.keys(database[communityType]);
      
        return response.json({status:200,[res]:vals||"error"});
      }
      return response.json({status:500,[res]: "invalid option", options:[`${communityType}`,`${communityType}List`] });
    }
  }
  
  return response.json({status:500,[res]: "no_results" });
})
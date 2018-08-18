var router  = require("./router.js");
var fs      = require("fs");
var path    = 'data';
// Problem: We need a simple way to look at a user's badge count, JavaScrip points from a web browser
// Solution: Use Node.js to perform the profile look ups and serve our template via HTTP

// Create a web server
const http = require('http');

//const hostname = '127.0.0.1';
const hostname = '';
const port = 3000;

const server = http.createServer((request, response) => {

});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  router.crawl();
});

function createErrorLog(){
  // If the error log file doesn't exist, then we create it
  if(fs.existsSync(path+'/scraper-error.log') === false){
    console.log('Creating Error file');
    fs.writeFileSync(path+'/scraper-error.log','');
  }
}

//If the data folder doesn't exist then we create it
if(fs.existsSync(path)){
  console.log('Data folder exists');
  createErrorLog();
} else {
  console.log('Creating Data folder');
  fs.mkdirSync(path);
  createErrorLog();
}

var Crawler = require("crawler");
var fs = require("fs");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

var commonHeader = 'text/html';

var startUrl  = 'http://shirts4mike.com/shirts.php';
// Single timestamp used in each of the prouducts
var timestamp = Date.now();

function printErrorLog(errorMsg) {
    var fPath = 'data/scraper-error.log';
    fs.readFile(fPath, 'utf8', function (err, data) {
        if (err) throw err;
        var errorDate = new Date();
        // If the file already has content then we want to append the new error
        data = (data === "undefined") ?  errorDate.toGMTString() : data + '\n' + errorDate.toGMTString();
        data += ': ' + errorMsg;
        fs.writeFile (fPath, data, function(err) {
            if (err) throw err;
            console.log('Error written to log file.');
        });
    });
}


function printError(error,res){
  var errorMsg = '';
  if(res){
    errorMsg = `ERROR: There was a problem. The error is: ${res.statusMessage} (${res.statusCode})`;
  } else {
    errorMsg = 'ERROR: We could not crawl the requested page. The error code is '+error.code;
  }
  console.log(errorMsg);
  printErrorLog(errorMsg);
}

function writeCSV(records,urls,counter){
  // Only progress if we've got the expected number of results
  if(counter==urls.length){
    // Build the date elements for the filename
    var today   = new Date();
    var year    = today.getFullYear();
    var month   = today.getMonth();
    var day     = today.getDate();
    var csvName = (year+"-"+month+"-"+day);

    // NPM csv package for creating the file
    const csvWriter = createCsvWriter({
      path: 'data/'+csvName+'.csv',
      header: [
          {id: 'title', title: 'Title'},
          {id: 'price', title: 'Price'},
          {id: 'imageURL', title: 'ImageURL'},
          {id: 'URL', title: 'URL'},
          {id: 'time', title: 'Time'}
        ]
    });

    console.log('Writing CVS file...');

    csvWriter.writeRecords(records)
    // returns a promise
        .then(() => {
          console.log('CSV Has been successfully written!');
        });
  }

}

function getInfo(urls,error){
  if(error === null){
    var products = [];
    // counter will be used so that we only execute the 'done' function once we've finished with all the pages
    var counter  = 0;

    var c = new Crawler({
      maxConnections : 1,
      // This will be called for each crawled page
      callback : function (error, res, done) {
          if(error){
              printError(error);

          } else{
              var $ = res.$;

              // get the h1 that contains both price and title then split them on the first space
              var titlePrice  = $(".shirt-details h1").text().split(/ (.+)/);
              var path        = res.request.path;
              var hostURL     = "http://" + res.request.host;

              var productDetail = {
              // $ is Cheerio by default - a lean implementation of core jQuery
                'title'     : titlePrice[1],
                'price'     : titlePrice[0],
                'imageURL'  : hostURL + '/' + $(".shirt-picture img").attr('src'),
                'URL'       : hostURL + path,
                'time'      : timestamp
              };
              products.push(productDetail);
          }
          counter++;
          done(writeCSV(products,urls,counter));
      }
    });
    c.queue(urls);
  }
}


function crawl(){
  var c = new Crawler({
    maxConnections : 1,
    // This will be called for each crawled page
    callback : function (error, res, done) {
        if(error){
          printError(error);
        } else{

            if(res.statusCode < 600 && res.statusCode > 299){
              printError(error,res);

              // Assign an error value to stop further processing
              error = res.statusCode;
            } else {
              var $ = res.$;
              var productUrls = [];
              // $ is Cheerio by default
              //a lean implementation of core jQuery designed specifically for the server
              $(".products li").each(function( index ) {
                var url = $( this ).children('a').attr('href');
                productUrls.push("http://" + res.request.host+"/"+url);
              });
            }
        }
        done(getInfo(productUrls,error));
    }
  });
  c.queue(startUrl);

}

module.exports.crawl = crawl;

var request = require('request');
var stdio = require('stdio');
var cheerio = require('cheerio');
var jsonfile = require('jsonfile');
// var Iconv = require('iconv');
var async = require('async');
var _ = require('lodash');
var Utils = require('./utils/url-utils');

var ops = stdio.getopt({
    'host': {key: 'h', args: 1, description: 'Host name'},
    'log': {key: 'l', description: 'Write to log (true/false)'}
});

var PageCounter = 0;
var LinkCollection = {};
var WordCollection = {};
var RootUrl;
var Total = 0;
var Complete = 0;

var regExps = {
    noScripts: /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    noStyles: /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
    noTags: /<(?:.|\n)*?>/gm,
    oneSpace: /\s\s+/g
};

var queue = async.queue(function crawl(url, next) {
    if (!url || LinkCollection[url]) {
        showProgress();
        return next(null);
    }

    PageCounter++;
    Total++;

    request(url, function(err, response, body){

        if (err) {
            Complete++;
            showProgress();
            return next(err);
        }

        LinkCollection[url] = {
            _id: PageCounter,
            links: {
                internal: 0,
                outdoor: 0
            },
            outdoorList: {}
        };

        // body = new Buffer(body, 'binary');
        // var conv = new iconv.Iconv('windows-1251', 'utf8');
        // body = conv.convert(body).toString();

        var $ = cheerio.load(body);
        if (ops.log) {
            console.log('>>>>>>>>>>>>>>>>>>>>>>>>>', url);
        }

        _.forEach(
            body
                .replace(regExps.noScripts, ' ')
                .replace(regExps.noStyles, ' ')
                .replace(regExps.noTags, ' ')
                .replace(regExps.oneSpace, ' ')
                .split(' ')
            ,
            function (string) {
                if (string.length > 2 &&
                    !parseInt(string)
                ) {
                    if (!WordCollection.hasOwnProperty(string)) {
                        WordCollection[string] = {
                            total: 0,
                            urls: {}
                        };
                    }
                    if (!WordCollection[string].urls.hasOwnProperty(PageCounter)) {
                        WordCollection[string].urls[PageCounter] = 0;
                    }
                    WordCollection[string].total++;
                    WordCollection[string].urls[PageCounter]++;
                }
            }
        );

        $('a').map(
          function(i, e){
            var link = $(e).attr('href');
            if (link &&
                RootUrl == Utils.getHost(link)
            ) {
                queue.push(link);
                LinkCollection[url].links.internal++;
            } else if (link) {
                if ((link.indexOf('/') + 1) == 1) {  
                    queue.push('http://' + RootUrl + link);
                    LinkCollection[url].links.internal++;
                } else {
                    LinkCollection[url].links.outdoor++;
                    if (!LinkCollection[url].outdoorList.hasOwnProperty(link)) {
                        LinkCollection[url].outdoorList[link] = 0;
                    }
                    LinkCollection[url].outdoorList[link] = 1;
                }
            }
          }
        );

        Complete++;
        showProgress();
        return next(null);
    });
}, 2);

queue.drain = save;

if (ops.host) {
    RootUrl = Utils.getHost(ops.host);
    queue.push(
        'http://' + ops.host
    );
} else {
    console.log('No site name!');
}

process.on('SIGINT', function() {
    save(function () {
        process.exit();
    });
});

function save(callback) {
    if (ops.log) {
        console.log('WordCollection', WordCollection);
        console.log('LinkCollection', LinkCollection);
        console.log('PageCounter', PageCounter);
    } else {
        var fileWords = './resFiles/' + RootUrl + '_words.json';
        var filePages = './resFiles/' + RootUrl + '_pages.json';
        jsonfile.writeFile(fileWords, WordCollection, {spaces: 4}, function(err) {
            if (err) {
                console.error('error write res!', err);
            } else {
                jsonfile.writeFile(filePages, LinkCollection, {spaces: 4}, function(err) {
                    if (err) {
                        console.log('error write res!', err);
                    } else {
                        console.log('DONE.');
                    }

                    if (callback) {
                        callback();
                    }
                });
            }
        });
    }
}

function showProgress() {
    if (Total) {
        var percent = ((Complete*100)/Total).toFixed(2) + "%";
        console.log(percent, "(" + Complete + "/" + Total + ")");
    }
};

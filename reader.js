var fs = require('fs');
var stdio = require('stdio');
var _ = require('lodash');

var ops = stdio.getopt({
    'host': {key: 'h', args: 1, description: 'Host name', mandatory: true},
    'word': {key: 'w', args: 1, description: 'Search word', mandatory: true},
    'showlinks': {key: 's', description: 'Show outter links (true/false)'},
    'log': {key: 'l', description: 'Write to log (true/false)'}
});

var Pages;
var Words;

var pagesFile = './resFiles/' + ops.host + '_pages.json';
var wordsFile = './resFiles/' + ops.host + '_words.json';
var stream;
var msg;
var postF = "\n";

if (ops.log) {
    stream = fs.createWriteStream("./resFiles/" + ops.host +"_search_res_" + ops.word + ".txt");
}

console.log('read pages...');
fs.readFile(pagesFile, 'utf8', function (errP, dataP) {
    if (errP) throw errP;
    Pages = JSON.parse(dataP);
    console.log('read words...');
    fs.readFile(wordsFile, 'utf8', function (errW, dataW) {
        if (errW) throw errW;
        Words = JSON.parse(dataW);

        _.forEach(
            Words,
            function (wordData, word) {
                if (word.indexOf(ops.word) + 1) {
                    msg = word + " find on " + wordData.total + " pages as '" + word + "'";
                    console.log(msg);
                    if (ops.log) {
                        stream.write(msg + postF);
                    }
                    _.forEach(
                        wordData.urls,
                        function (urlCount, urlId) {
                            var URL = {};
                             _.forEach(
                                Pages,
                                function (pageData, pageName) {
                                    if (pageData._id == urlId) {
                                        URL.name = pageName;
                                        URL.data = pageData;
                                    }
                                }
                            );
                            if (URL.name) {
                                if (ops.log) {
                                    stream.write(URL.name + postF);
                                } else {
                                    console.log(URL.name);
                                }
                                if (ops.showlinks) {
                                    msg = URL.data.links.outdoor + ' links:';
                                    if (ops.log) {
                                        stream.write(msg + postF);
                                    } else {
                                        console.log(msg);
                                    }
                                    _.forEach(
                                        URL.data.outdoorList,
                                        function (linkCount, linkName) {
                                            if (ops.log) {
                                                stream.write('-' + linkName + postF);
                                            } else {
                                                console.log('-' + linkName);
                                            }
                                        }
                                    );
                                    msg = '------';
                                    if (ops.log) {
                                        stream.write(msg + postF);
                                    } else {
                                        console.log(msg);
                                    }
                                }
                            }
                        }
                    );
                    if (ops.log) {
                        stream.write(postF);
                        stream.write(postF);
                        stream.write(postF);
                    } else {
                        console.log('------');
                        console.log('------');
                        console.log('------');
                    }
                }
            }
        );

        if (ops.log) {
            stream.end();
        }
    });
});

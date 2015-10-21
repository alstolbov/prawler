var request = require('request')
    , cheerio = require('cheerio')
    , async = require('async')
    , seen = {}
    , _ = require('lodash')
;

var queue = async.queue(function crawl(url, next) {
    if (!url || seen[url]) return next(null);

    request(url, function(err, response, body){
        if (err) return next(err);
        var WordCollection = {};
        seen[url] = true;
        var $ = cheerio.load(body);
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>', url);
        console.log('links:', $('a').length);

        _.forEach(
            $('body').text().replace(/\s\s+/g, ' ').split(' '),
            function (string) {
                if (string.length > 2 &&
                    !parseInt(string)
                ) {
                    if (!WordCollection.hasOwnProperty(string)) {
                        WordCollection[string] = 1;
                    } else {
                        WordCollection[string]++;
                    }
                }
            }
        );

        console.log(WordCollection);
    // $('a').map(
    //   function(i, e){
    //     queue.push($(e).attr('href'));
    //   }
    // );

        next(null);
    });
}, 2);

// queue.push('http://www.youtube.com/');
if (process.argv[2]) {
    queue.push('http://' + process.argv[2]);
} else {
    console.log('No site name!');
}

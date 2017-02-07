var client = require('cheerio-httpcli');

var level, words;
words = 'こんにちは';
level = '4';
var uri = '';

client.setBrowser('chrome'); 

client.fetch('http://racing-lagoon.info/nomu/translate.php').then(function (result) {
    var form = result.$('form[name=form]');

    form.field({
        before: 'こんにちは',
        level: 4,
        options: 'nochk'
    });

    form.find('input[type=submit]').click(function (err, $, res, body) {
        console.log($('textarea[name=after1]').val());
    });
})

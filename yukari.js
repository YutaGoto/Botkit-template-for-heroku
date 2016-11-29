var http = require('http');
http.get("http://yukari-factory.com/api/v1/yukari_sentences/random?word=" + "ごはん", function (result) { 
    result.setEncoding('utf8');
    var body = "";
    result.on('data', function(data) {
        body += data;
    });
    result.on('end', function(data) {
        var m = JSON.parse(body);
        console.log(m.result);
    });
}); 
/////////////// localStorageDB ///////////////
if (typeof localStorage === "undefined" || localStorage === null) {
    console.log("///////////////////// init ////////////////////////////");
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./db');
    window = global;
    require('../bower_components/localStorageDB/localstoragedb.min');
}


//////////////////////////////////////////////


var obj = require('../libs/common');
obj.storage = null;
var fs = require('fs');
var testJson = JSON.parse(fs.readFileSync('./spec/test.json', 'utf8'));


function unittest(name){

    it(name,function(){
        console.log("\ntest name:",name);
        if(testJson[name] !== void 0){
            for(var i=0;i<testJson[name].length;++i){
                expect(obj[name](testJson[name][i]).code).toEqual(obj.code.Success.code);
            }
        }else{
            console.log("test data is not found,this test skip.");
        }
        
    });
}

describe('unittest',function(){
    
    for(var key in obj){
        if(typeof(obj[key]) === "function"){
            unittest(key);
        }        
    }
    
});


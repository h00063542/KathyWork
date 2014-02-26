console.log("1111");
//生成产品大类表
//生成产品小类表
//生成产品信息

var fs = require("fs");
var path = require("path");
var _ = require("underscore");
var async = require("async");



var cateMap  = {

}
async.series([loadAllCate],function(error){
   console.log("loaded!");
})

function loadAllCate(callback){
    var rootpath= __dirname+"/resume/big";

    fs.readdir(rootpath, function(error,files){
        if(error){
            callback(error);
        }else{
            async.each(files,function(file,subcallback){
                fs.stat(rootpath+"/"+file, function(error,stat){
                    if(error){
                        subcallback(error);
                    }else{
                        if(stat.isDirectory()){
                            path.exists(rootpath+"/"+file+".json", function(exists) {
                                if (exists) {
                                    var json = readJsonFileSync(rootpath+"/"+file+".json");
                                    console.log(json);
                                    //生成小类sql语句
                                    buildSmallCate(rootpath+"/"+file,subcallback);
                                }else{
                                    subcallback(null);
                                }
                            });
                        }else{
                            subcallback(null);
                        }
                    }
                })
            },function(error){
                callback(error);
            });
        }
    })
}

function buildSmallCate(catePath,callback){
    fs.readdir(catePath, function(error,files){
        if(error){
            callback(error);
        }else{
            async.each(files,function(file,subcallback){
                fs.stat(catePath+"/"+file, function(error,stat){
                    if(error){
                        subcallback(error);
                    }else{
                        if(stat.isDirectory()){
                            path.exists(catePath+"/"+file+".json", function(exists) {
                                if (exists) {
                                    var json = readJsonFileSync(catePath+"/"+file+".json");
                                    console.log(json);
                                    //生成小类sql语句
                                    buildProduct(catePath+"/"+file,subcallback);
                                }else{
                                    subcallback(null);
                                }
                            });
                        }else{
                            subcallback(null);
                        }
                    }
                })
            },function(error){
                callback(error);
            });
        }
    })
}

function buildProduct(catePath,callback){
    fs.readdir(catePath, function(error,files){
        if(error){
            callback(error);
        }else{
            async.each(files,function(file,subcallback){
                fs.stat(catePath+"/"+file, function(error,stat){
                    if(error){
                        subcallback(error);
                    }else{
                        if(stat.isFile() && endsWith(file,".jpg")){
                            var fileshortName =  file.substring(0,file.lastIndexOf("_0.jpg"));
                            path.exists(catePath+"/"+fileshortName+".json", function(exists) {
                                if (exists) {
                                    var json = readJsonFileSync(catePath+"/"+fileshortName+".json");
                                    console.log(json);
                                    //生成小类sql语句
                                    subcallback(null);
                                }else{
                                    subcallback(null);
                                }
                            });
                        }else{
                            subcallback(null);
                        }
                    }
                })
            },function(error){
                callback(error);
            });
        }
    })
}


function buildSql(callback){

}


function endsWith(str, substring, position) {
    substring = String(substring);

    var subLen = substring.length | 0;

    if (!subLen)return true;//Empty string

    var strLen = str.length;

    if (position === void 0)position = strLen;
    else position = position | 0;

    if (position < 1)return false;

    var fromIndex = (strLen < position ? strLen : position) - subLen;

    return (fromIndex >= 0 || subLen === -fromIndex)
        && (
        position === 0
            // if position not at the and of the string, we can optimise search substring
            //  by checking first symbol of substring exists in search position in current string
            || str.charCodeAt(fromIndex) === substring.charCodeAt(0)//fast false
        )
        && str.indexOf(substring, fromIndex) === fromIndex
        ;
}
function readJsonFileSync(cfgPath) {
    var data = fs.readFileSync(cfgPath, "UTF-8");
    return JSON.parse(data);
}
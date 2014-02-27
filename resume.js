//生成产品大类表
//生成产品小类表
//生成产品信息

var fs = require("fs");
var path = require("path");
var _ = require("underscore");
var async = require("async");



var bigCateMap  = {

}
async.series([loadAllCate],function(error){

    buildSql(bigCateMap,function(){

    })
    console.log(sqls);
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
                            fs.exists(rootpath+"/"+file+".json", function(exists) {
                                if (exists) {
                                    var json = readJsonFileSync(rootpath+"/"+file+".json");
                                    if(!bigCateMap[file]){
                                        bigCateMap[file] = {
                                            meta:json,
                                            smallCateMap:{}
                                        };
                                    }
                                    //生成小类sql语句
                                    buildSmallCate(rootpath+"/"+file,bigCateMap[file],subcallback);
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

function buildSmallCate(catePath,bigCate,callback){
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
                            fs.exists(catePath+"/"+file+".json", function(exists) {
                                if (exists) {
                                    var json = readJsonFileSync(catePath+"/"+file+".json");
                                    if(!bigCate.smallCateMap[file]){
                                        bigCate.smallCateMap[file] = {
                                            meta:json,
                                            productMap:{}
                                        };
                                    }
                                    //生成小类sql语句
                                    buildProduct(catePath+"/"+file,bigCate.smallCateMap[file],subcallback);
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

function buildProduct(catePath,smallCate,callback){
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
                            fs.exists(catePath+"/"+fileshortName+".json", function(exists) {
                                if (exists) {
                                    var json = readJsonFileSync(catePath+"/"+fileshortName+".json");
                                    if(!smallCate.productMap[fileshortName]){
                                        smallCate.productMap[fileshortName] = {
                                            meta:json
                                        };
                                    }
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

var sqls = [];
function buildSql(bigCateMap,callback){
    _.each(bigCateMap,function(bigCate,bigCateName){
        buildBigCateSql(bigCate);
    })

    function buildBigCateSql(bigCate){
        var sqltemp = "insert into yuzhiguo_big_class ({0}) values ({1})";
        var fields = "";
        var values = "";
        _.each(bigCate.meta,function(value,key){
            fields = fields+","+key+"";
            values = values+",'"+value+"'";
        });
        fields = fields.substring(1);
        values = values.substring(1);
        sqls.push(sqltemp.format(fields,values));

        _.each(bigCate.smallCateMap,function(smallCate,bigCateName){
            buildSmallCateSql(smallCate);
        })


    }
    function buildSmallCateSql(smallCate){
        var sqltemp = "insert into yuzhiguo_small_class ({0}) values ({1})";
        var fields = "";
        var values = "";
        _.each(smallCate.meta,function(value,key){
            fields = fields+","+key+"";
            values = values+",'"+value+"'";
        });
        fields = fields.substring(1);
        values = values.substring(1);
        sqls.push(sqltemp.format(fields,values));


        _.each(smallCate.productMap,function(product,productName){
            buildProductSql(product);
        })

    }
    function buildProductSql(product){
        var sqltemp = "insert into yuzhiguo_products ({0}) values ({1})";
        var fields = "";
        var values = "";
        _.each(product.meta,function(value,key){
            fields = fields+","+key+"";
            values = values+",'"+value+"'";
        });
        fields = fields.substring(1);
        values = values.substring(1);
        sqls.push(sqltemp.format(fields,values));
    }

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
String.prototype.format = function() {
    var formatted = this;
    for (var i = 0; i < arguments.length; i++) {
        var regexp = new RegExp('\\{'+i+'\\}', 'gi');
        formatted = formatted.replace(regexp, arguments[i]);
    }
    return formatted;
};
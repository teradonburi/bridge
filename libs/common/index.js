var _ = require('lodash');

// データ型判定
function is(type, obj) {
    var clas = Object.prototype.toString.call(obj).slice(8, -1);
    return obj !== undefined && obj !== null && clas === type;
}

// uuid生成
function uuid() {
    var uid = "", i, random;
    for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0;

        if (i === 8 || i === 12 || i === 16 || i === 20) {
            uid += "-";
        }
        uid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
    }
    return uid;
}



var obj ={

    // Server URL(HTTP)
    serverURL: "http://localhost:3000",
    // Socket URL(WebSocket)
    socketURL: "http://localhost:9000",
    
    // DBスキーマ名
    schemaName:"library",

    // サーバ？
    isServer:false,
    
    // サーバ同期する
    isNeedSync:true,
    
    
    // sockets
    io:null,
   
    // レスポンスコード
    code : {
        Success:{code:0,msg:'OK'},
        ParamError:{code:-1,msg:'Parameter Error'},  
        TableNotFound:{code:-2,msg:'Table Not Found Error'},
        DBError:{code:-3,msg:'DB Error'}
    },
    
    test:function(param){
        var result = this.code.Success;
        result.data = param;
        return result;
    },
    
    
    /**
    * ストレージ
    * 
    * @property storage
    */
    storage:null,
    
   
    /**
    * データの保存処理
    *
    * @method save
    * @param {Object} 保存データ
    * @return {object} Returns true on success (return の概要・説明)
    */
    save:function(param){
        
        // ストレージがなかったらインスタンス生成
        if(this.storage === null){
            // NodeJS版のPolyfill
            if(localStorage.getItem('db_'+this.schemaName)){
                localStorage['db_' + this.schemaName] = localStorage.getItem('db_'+this.schemaName);
            }
            this.storage = new localStorageDB(this.schemaName, localStorage);
        }
        
    
        
        if(!is('Object',param)){
            return this.code.ParamError;
        }

        var tableName = param.tableName;
        var datas = param.datas;
        
        if(tableName === void 0 || datas === void 0){
            return  this.code.ParamError;
        }

        // キー取得
        var primaryKey = param.key;
        if(primaryKey === void 0){
            // primary keyがない場合はuuid生成
            datas.objectId = uuid();
            primaryKey = {'objectId': datas.objectId };
        }

        if( !this.storage.tableExists(tableName) ) {
            var keys = [];
            
            for(var key in datas){
                keys.push(key);
            }
            
            console.log("table create:",tableName);
            // テーブル作成
            this.storage.createTable(tableName, keys);
        }
        
        
        
        
        // upsert
        this.storage.insertOrUpdate(tableName, primaryKey, datas);

                
        // commit
        this.storage.commit();
        
        if(obj.isServer){
            obj.io.emit('event',datas);
        }
        
        var k,v;
        for(var i in primaryKey){
            k = i;
            v = primaryKey[i];
        }
        
        
        var own = {
            tableName:tableName,
            condition:"$."+k+" == '" + v +"'"
        };
        // 登録データを取得
        return this.select(own);
    },
    /**
    * データの取得処理
    *
    * @method select
    * @param {Object} 保存データ
    * @return {object} Returns true on success (return の概要・説明)
    */
    select:function(param){

        
        // ストレージがなかったらインスタンス生成
        if(this.storage === null){
            // NodeJS版のPolyfill
            if(localStorage.getItem('db_'+this.schemaName)){
                localStorage['db_' + this.schemaName] = localStorage.getItem('db_'+this.schemaName);
            }
            this.storage = new localStorageDB(this.schemaName, localStorage);
        }
        
        if(!is('Object',param)){
            return this.code.ParamError;
        }

        var tableName = param.tableName;
        var condition = param.condition;

        if(tableName === void 0 ){
            return this.code.ParamError;
        }

        
        if( !this.storage.tableExists(tableName) ) {
            return this.code.TableNotFound;
        }
        
        var result = this.code.Success;
        if(condition === void 0){
            // 全検索
            result.data = this.storage.queryAll(tableName);
            console.log("result:",result);
            return _.cloneDeep(result);
        }else{
            // 条件検索
            console.log("condition:",condition);
            result.data =this.storage.queryAll(tableName, {
                query: function($) {   
                    if(eval(condition)) {     
                        return true;
                    } else {
                        return false;
                    }
                }
            });            
            console.log("result:",result);
            return  _.cloneDeep(result);
        }
                
    },
    drop:function(param){
        
        // ストレージがなかったらインスタンス生成
        if(this.storage === null){
            // NodeJS版のPolyfill
            if(localStorage.getItem('db_'+this.schemaName)){
                localStorage['db_' + this.schemaName] = localStorage.getItem('db_'+this.schemaName);
            }
            this.storage = new localStorageDB(this.schemaName, localStorage);
        }

        if(!is('Object',param)){
            return this.code.ParamError;
        }

        var tableName = param.tableName;

        if(tableName === void 0 ){
            return this.code.ParamError;
        }
        
        if( this.storage.tableExists(tableName) ) {
            this.storage.dropTable(tableName);
            // commit
            this.storage.commit();
            return this.code.Success;
        }else{
            return this.code.TableNotFound;
        }
    }
    
};


module.exports = obj;
"use strict";

var config   = require("config");
var expect   = require("chai").expect;

var NCMB = require("../lib/ncmb");

describe("NCMB Operation", function(){
  var ncmb = null;
  before(function(){
    ncmb = new NCMB(config.apikey, config.clientkey );
    if(config.apiserver){
      ncmb.set("protocol", config.apiserver.protocol )
          .set("fqdn", config.apiserver.fqdn)
          .set("port", config.apiserver.port)
          .set("proxy", config.apiserver.proxy || "");
    }
  });
  describe("プロパティ設定", function(){
    var user = null;
    context("set", function(){
      beforeEach(function(){
        user = new ncmb.User();
      });
      it("指定したkeyのプロパティにvalueを設定できる", function(done){
        user.set("key", "value");
        expect(user.key).to.be.eql("value");
        done();
      });
      it("指定したkeyが文字列でないとき、エラーが返る", function(done){
        try{
          user.set(["key"], "value");
          done("失敗すべき");
        }catch(err){
          expect(err).to.be.an.instanceof(Error);
          done();
        }
      });
      it("指定したkeyが設定不可だったとき、エラーが返る", function(done){
        try{
          user.set("className", "value");
          done("失敗すべき");
        }catch(err){
          expect(err).to.be.an.instanceof(Error);
          done();
        }
      });
    });
  });

  describe("プロパティ取得", function(){
    var user = null;
    context("get", function(){
      beforeEach(function(){
        user = new ncmb.User();
      });
      it("指定したkeyのプロパティの値を取得できる", function(done){
        user.key = "value";
        expect(user.get("key")).to.be.eql("value");
        done();
      });
      it("undefinedとnullを判別して取得できる", function(done){
        user.isNull = null;
        expect(user.get("isNull")).to.be.eql(null);
        expect(user.get("isUnset")).to.be.eql(undefined);
        done();
      });
      it("指定したkeyが文字列でないとき、エラーが返る", function(done){
        try{
          var value = user.get(["key"]);
          done("失敗すべき");
        }catch(err){
          expect(err).to.be.an.instanceof(Error);
          done();
        }
      });
    });
  });

  describe("更新オペレーション設定", function(){
    var Increment = null;
    var increment = null;
    var user = null;
    var increment_id1 =  null;
    var increment_id2 =  null;
    var increment_id3 =  null;
    var increment_id4 =  null;
    var increment_id5 =  null;
    context("setIncrement", function(){
      beforeEach(function(){
        Increment = ncmb.DataStore("increment");
        increment = new Increment;
      });
      it("keyとamountを指定した場合、keyのプロパティにオペレーションを設定できる (In Case save() )", function(done){
        increment.setIncrement("increment", 2);
        increment.save(function(err, obj){
          if(err){
            done(err);
          }else{
            expect(obj.increment).to.be.eql(2);
            increment_id1 = obj.objectId;
            done();
          }
        });
      });
      it("keyのみを指定した場合、keyのプロパティにamountが1のオペレーションを設定できる (In Case save() )", function(done){
        increment.setIncrement("increment");
        increment.save(function(err, obj){
          if(err){
            done(err);
          }else{
            expect(obj.increment).to.be.eql(1);
            increment_id2 = obj.objectId;
            done();
          }
        });
      });
      it("複数回実行した場合、amountが各入力値の合計値のオペレーションを設定できる (In Case save() )", function(done){
        increment.setIncrement("increment", 3);
        increment.setIncrement("increment", 2);
        increment.save(function(err, obj){
          if(err){
            done(err);
          }else{
            expect(obj.increment).to.be.eql(5);
            increment_id3 = obj.objectId;
            done();
          }
        });
      });
      it("メソッドチェインで連続実行できる(In Case save() )", function(done){
        increment.setIncrement("increment", 3).setIncrement("increment");
        increment.save(function(err, obj){
          if(err){
            done(err);
          }else{
            expect(obj.increment).to.be.eql(4);
            increment_id4 = obj.objectId;
            done();
          }
        });
      });
      it("他のオペレーションメソッドを上書きできる (In Case save() )", function(done){
        increment.add("increment", ["apple"]).setIncrement("increment",6);
        increment.save(function(err, obj){
          if(err){
            done(err);
          }else{
            expect(obj.increment).to.be.eql(6);
            increment_id5 = obj.objectId;
            done();
          }
        });
      });

      it("keyとamountを指定した場合、keyのプロパティにオペレーションを設定できる (In Case update() )", function(done){
        increment.objectId = increment_id1;
        increment.setIncrement("increment", 1);
        increment.update()
            .then(function(obj){
              Increment.fetchById(increment_id1, function(err, obj){
                if(err){
                  done(err);
                }else{
                  expect(obj.increment).to.be.eql(3);
                  done();
                }
              });
            })
            .catch(function(err){
              done(err);
            });
      });
      it("keyのみを指定した場合、keyのプロパティにamountが1のオペレーションを設定できる (In Case update() )", function(done){
        increment.objectId = increment_id2;
        increment.setIncrement("increment");
        increment.update()
            .then(function(obj){
              Increment.fetchById(increment_id2, function(err, obj){
                if(err){
                  done(err);
                }else{
                  expect(obj.increment).to.be.eql(2);
                  done();
                }
              });
            })
            .catch(function(err){
              done(err);
            });
      });

      it("複数回実行した場合、amountが各入力値の合計値のオペレーションを設定できる  (In Case update() )", function(done){
        increment.objectId = increment_id3;
        increment.setIncrement("increment",3);
        increment.setIncrement("increment",2);
        increment.update()
            .then(function(obj){
              Increment.fetchById(increment_id3, function(err, obj){
                if(err){
                  done(err);
                }else{
                  expect(obj.increment).to.be.eql(10);
                  done();
                }
              });
            })
            .catch(function(err){
              done(err);
            });
      });
      it("メソッドチェインで連続実行できる  (In Case update() )", function(done){
        increment.objectId = increment_id4;
        increment.setIncrement("increment", 3).setIncrement("increment");
        increment.update()
            .then(function(obj){
              Increment.fetchById(increment_id4, function(err, obj){
                if(err){
                  done(err);
                }else{
                  expect(obj.increment).to.be.eql(8);
                  done();
                }
              });
            })
            .catch(function(err){
              done(err);
            });
      });

      it("他のオペレーションメソッドを上書きできる  (In Case update() )", function(done){
        increment.objectId = increment_id5;
        increment.add("increment", ["apple"]).setIncrement("increment",6);
        increment.update()
            .then(function(obj){
              Increment.fetchById(increment_id5, function(err, obj){
                if(err){
                  done(err);
                }else{
                  expect(obj.increment).to.be.eql(12);
                  done();
                }
              });
            })
            .catch(function(err){
              done(err);
            });
      });

      it("amountがnumber以外のとき、エラーが返る", function(done){
        expect(function(){
          increment.setIncrement("increment","1");
        }).to.throw(Error);
        done();
      });
      it("keyが変更禁止のとき、エラーが返る", function(done){
        expect(function(){
          increment.setIncrement("save",1);
        }).to.throw(Error);
        done();
      });
    });
    context("add", function(){
      var arr =  null;
      beforeEach(function(){
        user = new ncmb.User();
      });
      it("keyとobjectsを指定した場合、keyのプロパティにオペレーションを設定できる", function(done){
        user.add("key", [1,2,3]);
        expect(user.key).to.be.eql({__op:"Add", objects: [1,2,3]});
        done();
      });
      it("objectsに配列以外を指定した場合、要素数1の配列に変換してプロパティにオペレーションを設定できる", function(done){
        user.add("key", 1);
        expect(user.key).to.be.eql({__op:"Add", objects: [1]});
        done();
      });
      it("複数回実行した場合、objectsが各入力を連結した配列のオペレーションを設定できる", function(done){
        user.add("key", [1,2,3]);
        user.add("key", [4,5,6]);
        expect(user.key).to.be.eql({__op:"Add", objects: [1,2,3,4,5,6]});
        done();
      });
      it("メソッドチェインで連続実行できる", function(done){
        user.add("key", [1,2,3]).add("key", [4,5,6]);
        expect(user.key).to.be.eql({__op:"Add", objects: [1,2,3,4,5,6]});
        done();
      });
      it("他のオペレーションメソッドを上書きできる", function(done){
        user.remove("key", ["apple"]).add("key", [1,2,3]);
        expect(user.key).to.be.eql({__op:"Add", objects: [1,2,3]});
        done();
      });
      it("keyが変更禁止のとき、エラーが返る", function(done){
        expect(function(){
          user.add("save",[1,2,3]);
        }).to.throw(Error);
        done();
      });
      it("objectsがないとき、エラーが返る", function(done){
        expect(function(){
          user.add("key");
        }).to.throw(Error);
        done();
      });
    });
    context("addUnique", function(){
      var arr =  null;
      beforeEach(function(){
        user = new ncmb.User();
      });
      it("keyとobjectsを指定した場合、keyのプロパティにオペレーションを設定できる", function(done){
        user.addUnique("key", [1,2,3]);
        expect(user.key).to.be.eql({__op:"AddUnique", objects: [1,2,3]});
        done();
      });
      it("objectsに配列以外を指定した場合、要素数1の配列に変換してプロパティにオペレーションを設定できる", function(done){
        user.addUnique("key", 1);
        expect(user.key).to.be.eql({__op:"AddUnique", objects: [1]});
        done();
      });
      it("複数回実行した場合、objectsが各入力を連結した配列のオペレーションを設定できる", function(done){
        user.addUnique("key", [1,2,3]);
        user.addUnique("key", [4,5,6]);
        expect(user.key).to.be.eql({__op:"AddUnique", objects: [1,2,3,4,5,6]});
        done();
      });
      it("メソッドチェインで連続実行できる", function(done){
        user.addUnique("key", [1,2,3]).addUnique("key", [4,5,6]);
        expect(user.key).to.be.eql({__op:"AddUnique", objects: [1,2,3,4,5,6]});
        done();
      });
      it("他のオペレーションメソッドを上書きできる", function(done){
        user.remove("key", ["apple"]).addUnique("key", [1,2,3]);
        expect(user.key).to.be.eql({__op:"AddUnique", objects: [1,2,3]});
        done();
      });
      it("keyが変更禁止のとき、エラーが返る", function(done){
        expect(function(){
          user.addUnique("save",[1,2,3]);
        }).to.throw(Error);
        done();
      });
      it("objectsがないとき、エラーが返る", function(done){
        expect(function(){
          user.addUnique("key");
        }).to.throw(Error);
        done();
      });
      it("重複する値が入力されたとき、エラーが返る", function(done){
        expect(function(){
          user.addUnique("key",[1,2,3])
              .addUnique("key",1);
        }).to.throw(Error);
        done();
      });
    });
    context("remove", function(){
      var arr =  null;
      beforeEach(function(){
        user = new ncmb.User();
      });
      it("keyとobjectsを指定した場合、keyのプロパティにオペレーションを設定できる", function(done){
        user.remove("key", [1,2,3]);
        expect(user.key).to.be.eql({__op:"Remove", objects: [1,2,3]});
        done();
      });
      it("objectsに配列以外を指定した場合、要素数1の配列に変換してプロパティにオペレーションを設定できる", function(done){
        user.remove("key", 1);
        expect(user.key).to.be.eql({__op:"Remove", objects: [1]});
        done();
      });
      it("複数回実行した場合、objectsが各入力を連結した配列のオペレーションを設定できる", function(done){
        user.remove("key", [1,2,3]);
        user.remove("key", [4,5,6]);
        expect(user.key).to.be.eql({__op:"Remove", objects: [1,2,3,4,5,6]});
        done();
      });
      it("メソッドチェインで連続実行できる", function(done){
        user.remove("key", [1,2,3]).remove("key", [4,5,6]);
        expect(user.key).to.be.eql({__op:"Remove", objects: [1,2,3,4,5,6]});
        done();
      });
      it("他のオペレーションメソッドを上書きできる", function(done){
        user.add("key", ["apple"]).remove("key", [1,2,3]);
        expect(user.key).to.be.eql({__op:"Remove", objects: [1,2,3]});
        done();
      });
      it("keyが変更禁止のとき、エラーが返る", function(done){
        expect(function(){
          user.remove("save",[1,2,3]);
        }).to.throw(Error);
        done();
      });
      it("objectsがないとき、エラーが返る", function(done){
        expect(function(){
          user.remove("key");
        }).to.throw(Error);
        done();
      });
    });
  });
});
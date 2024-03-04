function hookCipher(){
    Java.perform(function(){
        Java.use('javax.crypto.Cipher').getInstance.overload('java.lang.String').implementation = function(arg0){
            console.log('javax.crypto.Cipher.getInstance is called!', arg0);
            var result = this.getInstance(arg0);
            return result;
        };
        // cipher.init(Cipher.ENCRYPT_MODE, getRawKey(key), iv);
        Java.use('javax.crypto.Cipher').init.overload('int', 'java.security.Key', 'java.security.spec.AlgorithmParameterSpec').implementation = function(arg0, arg1, arg2){
            // console.log("javax.crypto.Cipher.init is called!", arg0, arg1, arg2);
            var mode = arg0;
            var key = arg1;
            var iv = arg2;
            var KeyClass = Java.use('java.security.Key');
            var keyobj = Java.cast(key, KeyClass);
            var key_bytes = keyobj.getEncoded();
            var StringClass = Java.use('java.lang.String');
            var key_string = StringClass.$new(key_bytes);
            console.log("key_string: ", key_string);
            var IVClass = Java.use('javax.crypto.spec.IvParameterSpec');
            var ivobj = Java.cast(iv, IVClass);
            var iv_bytes = ivobj.getIV();
            var iv_string = StringClass.$new(iv_bytes);
            console.log("iv_string: ", iv_string);
            console.log("javax.crypto.Cipher.init is called!", mode, JSON.stringify(key_bytes), JSON.stringify(iv_bytes));
            var result = this.init(arg0, arg1, arg2);
            return result;
        };
        // doFinal
        Java.use('javax.crypto.Cipher').doFinal.overload('[B').implementation = function(arg0){
            console.log("javax.crypto.Cipher.doFinal is called!", JSON.stringify(arg0));
            var data = arg0;
            var StringClass = Java.use('java.lang.String');
            var data_string = StringClass.$new(data);
            console.log("data_string: ", data_string);
            var result = this.doFinal(arg0);
            console.log('javax.crypto.Cipher.doFinal is called!', JSON.stringify(data));
            console.log('\n ----------------\n ', "encrypt:", JSON.stringify(result),'\n ----------------\n ');
            return result;
        };
    })
}

var sub_9744 = null;
function hookso(){
    var nativelibmodul = Process.getModuleByName('libnative-lib.so');
    var sub_9744_addr = nativelibmodul.base.add(0x9744 + 1);
    sub_9744 = new NativeFunction(sub_9744_addr, 'pointer', ['pointer', 'pointer', 'pointer']);
    Interceptor.attach(sub_9744_addr, {
        onEnter: function(args){
            console.log("sub_9744_addr arg0: ", hexdump(args[0]));
            console.log("sub_9744_addr arg1: ", hexdump(args[1]));
            console.log("sub_9744_addr arg2: ", hexdump(args[2]));
        },onLeave: function(retval){
            console.log("sub_9744_addr retval: : ", hexdump(ptr(retval)));
        }
    })
}

function activecallsub_9744(){
    var arg0 = Memory.alloc(21);
    ptr(arg0).writeUtf8String('qazwsxedcrfvtgbyhnujm');
    var arg1 = Memory.alloc(16);
    ptr(arg1).writeUtf8String('i am encrypt key');
    var arg2 = Memory.alloc(16);
    ptr(arg2).writeUtf8String('0123456789abcdef');
    sub_9744(arg0, arg1, arg2);
    
}

function hooksoMain(){
    if(Java.available){
        Java.perform(function(){
            Java.use("java.lang.Runtime").loadLibrary0.implementation = function(arg0, arg1){
                console.log("java.lang.Runtime->loadLibrary0: ", arg1);
                var result = this.loadLibrary0(arg0, arg1);
                if(arg1.indexOf('native-lib') != -1){
                    hookso();
                }
                return result;
            }
        })
    }
}

function main(){
    if(Java.available){
        Java.perform(function(){
            Java.use("java.lang.ClassLoader").loadClass.overload('java.lang.String').implementation = function(arg0){
                console.log("java.lang.ClassLoader->loadClass: ", arg0);
                var result = this.loadClass(arg0);
                return result;
            }
            Java.use("java.lang.String").contains.implementation = function(arg0){
                var result = this.contains(arg0);
                if(result == true){
                    console.log("java.lang.String->contains: ", arg0);
                }
                return result;
            }
        })
    }
}

setImmediate(hooksoMain)

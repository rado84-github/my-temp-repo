Object.prototype.isNotEmpty = function(){
    return !!Object.keys(this).length;
}

Object.prototype.isEmpty = function(){
    return !this.isNotEmpty();
}

Object.prototype.equals = function(x) {
    return deepCompare(this, x);
}

function deepCompare () {

    let leftChain, rightChain;
  
    function compare2Objects (x, y) {
  
      // remember that NaN === NaN returns false
      // and isNaN(undefined) returns true
      if (isNaN(x) && isNaN(y) && typeof x === 'number' && typeof y === 'number') {
           return true;
      }
  
      // Compare primitives and functions.     
      // Check if both arguments link to the same object.
      // Especially useful on the step where we compare prototypes
      if (x === y) {
          return true;
      }
  
      // Works in case when functions are created in constructor.
      // Comparing dates is a common scenario. Another built-ins?
      // We can even handle functions passed across iframes
      if ((typeof x === 'function' && typeof y === 'function') ||
         (x instanceof Date && y instanceof Date) ||
         (x instanceof RegExp && y instanceof RegExp) ||
         (x instanceof String && y instanceof String) ||
         (x instanceof Number && y instanceof Number)) {
          return x.toString() === y.toString();
      }
  
      // At last checking prototypes as good as we can
      if (!(x instanceof Object && y instanceof Object)) {
          return false;
      }
  
      if (x.isPrototypeOf(y) || y.isPrototypeOf(x)) {
          return false;
      }
  
      if (x.constructor !== y.constructor) {
          return false;
      }
  
      if (x.prototype !== y.prototype) {
          return false;
      }
  
      // Check for infinitive linking loops
      if (leftChain.indexOf(x) > -1 || rightChain.indexOf(y) > -1) {
           return false;
      }
  
      // Quick checking of one object being a subset of another.
      // todo: cache the structure of arguments[0] for performance
      for (let p in y) {
          if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
              return false;
          }
          else if (typeof y[p] !== typeof x[p]) {
              return false;
          }
      }
  
      for (let p in x) {
          if (y.hasOwnProperty(p) !== x.hasOwnProperty(p)) {
              return false;
          }
          else if (typeof y[p] !== typeof x[p]) {
              return false;
          }
  
          switch (typeof (x[p])) {
              case 'object':
              case 'function':
  
                  leftChain.push(x);
                  rightChain.push(y);
  
                  if (!compare2Objects (x[p], y[p])) {
                      return false;
                  }
  
                  leftChain.pop();
                  rightChain.pop();
                  break;
  
              default:
                  if (x[p] !== y[p]) {
                      return false;
                  }
                  break;
          }
      }
  
      return true;
    }
  
    if (arguments.length < 1) {
      return true; //Die silently? Don't know how to handle such case, please help...
      // throw "Need two or more arguments to compare";
    }
  
    for (let i = 1, l = arguments.length; i < l; i++) {
  
        leftChain = []; //Todo: this can be cached
        rightChain = [];
  
        if (!compare2Objects(arguments[0], arguments[i])) {
            return false;
        }
    }
  
    return true;
}

var window = typeof window === 'undefined'? (globalThis || self) || this : window;

/*
 * Crypto-JS v2.5.2
 * original file name sha1-hmac-pbkdf2-blockmodes-aes.js
 * http://code.google.com/p/crypto-js/
 * (c) 2009-2011 by Jeff Mott. All rights reserved.
 * http://code.google.com/p/crypto-js/wiki/License
*/

(typeof Crypto==="undefined"||!Crypto.util)&&function(){var d=window.Crypto={},j=d.util={rotl:function(e,c){return e<<c|e>>>32-c},rotr:function(e,c){return e<<32-c|e>>>c},endian:function(e){if(e.constructor==Number)return j.rotl(e,8)&16711935|j.rotl(e,24)&4278255360;for(var c=0;c<e.length;c++)e[c]=j.endian(e[c]);return e},randomBytes:function(e){for(var c=[];e>0;e--)c.push(Math.floor(Math.random()*256));return c},bytesToWords:function(e){for(var c=[],b=0,a=0;b<e.length;b++,a+=8)c[a>>>5]|=e[b]<<24-
a%32;return c},wordsToBytes:function(e){for(var c=[],b=0;b<e.length*32;b+=8)c.push(e[b>>>5]>>>24-b%32&255);return c},bytesToHex:function(e){for(var c=[],b=0;b<e.length;b++)c.push((e[b]>>>4).toString(16)),c.push((e[b]&15).toString(16));return c.join("")},hexToBytes:function(e){for(var c=[],b=0;b<e.length;b+=2)c.push(parseInt(e.substr(b,2),16));return c},bytesToBase64:function(e){if(typeof btoa=="function")return btoa(f.bytesToString(e));for(var c=[],b=0;b<e.length;b+=3)for(var a=e[b]<<16|e[b+1]<<8|
e[b+2],k=0;k<4;k++)b*8+k*6<=e.length*8?c.push("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".charAt(a>>>6*(3-k)&63)):c.push("=");return c.join("")},base64ToBytes:function(e){if(typeof atob=="function")return f.stringToBytes(atob(e));for(var e=e.replace(/[^A-Z0-9+\/]/ig,""),c=[],b=0,a=0;b<e.length;a=++b%4)a!=0&&c.push(("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(e.charAt(b-1))&Math.pow(2,-2*a+8)-1)<<a*2|"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".indexOf(e.charAt(b))>>>
6-a*2);return c}},d=d.charenc={};d.UTF8={stringToBytes:function(e){return f.stringToBytes(unescape(encodeURIComponent(e)))},bytesToString:function(e){return decodeURIComponent(escape(f.bytesToString(e)))}};var f=d.Binary={stringToBytes:function(e){for(var c=[],b=0;b<e.length;b++)c.push(e.charCodeAt(b)&255);return c},bytesToString:function(e){for(var c=[],b=0;b<e.length;b++)c.push(String.fromCharCode(e[b]));return c.join("")}}}();
(function(){var d=Crypto,j=d.util,f=d.charenc,e=f.UTF8,c=f.Binary,b=d.SHA1=function(a,k){var e=j.wordsToBytes(b._sha1(a));return k&&k.asBytes?e:k&&k.asString?c.bytesToString(e):j.bytesToHex(e)};b._sha1=function(a){a.constructor==String&&(a=e.stringToBytes(a));var b=j.bytesToWords(a),l=a.length*8,a=[],c=1732584193,h=-271733879,d=-1732584194,f=271733878,s=-1009589776;b[l>>5]|=128<<24-l%32;b[(l+64>>>9<<4)+15]=l;for(l=0;l<b.length;l+=16){for(var g=c,n=h,r=d,m=f,o=s,p=0;p<80;p++){if(p<16)a[p]=b[l+p];else{var v=
a[p-3]^a[p-8]^a[p-14]^a[p-16];a[p]=v<<1|v>>>31}v=(c<<5|c>>>27)+s+(a[p]>>>0)+(p<20?(h&d|~h&f)+1518500249:p<40?(h^d^f)+1859775393:p<60?(h&d|h&f|d&f)-1894007588:(h^d^f)-899497514);s=f;f=d;d=h<<30|h>>>2;h=c;c=v}c+=g;h+=n;d+=r;f+=m;s+=o}return[c,h,d,f,s]};b._blocksize=16;b._digestsize=20})();
(function(){var d=Crypto,j=d.util,f=d.charenc,e=f.UTF8,c=f.Binary;d.HMAC=function(b,a,k,l){a.constructor==String&&(a=e.stringToBytes(a));k.constructor==String&&(k=e.stringToBytes(k));k.length>b._blocksize*4&&(k=b(k,{asBytes:!0}));for(var d=k.slice(0),k=k.slice(0),h=0;h<b._blocksize*4;h++)d[h]^=92,k[h]^=54;b=b(d.concat(b(k.concat(a),{asBytes:!0})),{asBytes:!0});return l&&l.asBytes?b:l&&l.asString?c.bytesToString(b):j.bytesToHex(b)}})();
(function(){var d=Crypto,j=d.util,f=d.charenc,e=f.UTF8,c=f.Binary;d.PBKDF2=function(b,a,k,l){function u(b,a){return d.HMAC(h,a,b,{asBytes:!0})}b.constructor==String&&(b=e.stringToBytes(b));a.constructor==String&&(a=e.stringToBytes(a));for(var h=l&&l.hasher||d.SHA1,f=l&&l.iterations||1,q=[],s=1;q.length<k;){for(var g=u(b,a.concat(j.wordsToBytes([s]))),n=g,r=1;r<f;r++)for(var n=u(b,n),m=0;m<g.length;m++)g[m]^=n[m];q=q.concat(g);s++}q.length=k;return l&&l.asBytes?q:l&&l.asString?c.bytesToString(q):j.bytesToHex(q)}})();
(function(d){function j(b,a){var k=b._blocksize*4;return k-a.length%k}var f=d.pad={},e=function(b){for(var a=b.pop(),k=1;k<a;k++)b.pop()};f.NoPadding={pad:function(){},unpad:function(){}};f.ZeroPadding={pad:function(b,a){var k=b._blocksize*4,e=a.length%k;if(e!=0)for(e=k-e;e>0;e--)a.push(0)},unpad:function(){}};f.iso7816={pad:function(b,a){var e=j(b,a);for(a.push(128);e>1;e--)a.push(0)},unpad:function(b){for(;b.pop()!=128;);}};f.ansix923={pad:function(b,a){for(var e=j(b,a),c=1;c<e;c++)a.push(0);a.push(e)},
unpad:e};f.iso10126={pad:function(b,a){for(var e=j(b,a),c=1;c<e;c++)a.push(Math.floor(Math.random()*256));a.push(e)},unpad:e};f.pkcs7={pad:function(b,a){for(var e=j(b,a),c=0;c<e;c++)a.push(e)},unpad:e};var d=d.mode={},c=d.Mode=function(b){if(b)this._padding=b};c.prototype={encrypt:function(b,a,e){this._padding.pad(b,a);this._doEncrypt(b,a,e)},decrypt:function(b,a,e){this._doDecrypt(b,a,e);this._padding.unpad(a)},_padding:f.iso7816};e=(d.ECB=function(){c.apply(this,arguments)}).prototype=new c;e._doEncrypt=
function(b,a){for(var e=b._blocksize*4,c=0;c<a.length;c+=e)b._encryptblock(a,c)};e._doDecrypt=function(b,a){for(var e=b._blocksize*4,c=0;c<a.length;c+=e)b._decryptblock(a,c)};e.fixOptions=function(b){b.iv=[]};e=(d.CBC=function(){c.apply(this,arguments)}).prototype=new c;e._doEncrypt=function(b,a,e){for(var c=b._blocksize*4,d=0;d<a.length;d+=c){if(d==0)for(var h=0;h<c;h++)a[h]^=e[h];else for(h=0;h<c;h++)a[d+h]^=a[d+h-c];b._encryptblock(a,d)}};e._doDecrypt=function(b,a,e){for(var c=b._blocksize*4,d=
0;d<a.length;d+=c){var h=a.slice(d,d+c);b._decryptblock(a,d);for(var f=0;f<c;f++)a[d+f]^=e[f];e=h}};e=(d.CFB=function(){c.apply(this,arguments)}).prototype=new c;e._padding=f.NoPadding;e._doEncrypt=function(b,e,c){for(var d=b._blocksize*4,c=c.slice(0),f=0;f<e.length;f++){var h=f%d;h==0&&b._encryptblock(c,0);e[f]^=c[h];c[h]=e[f]}};e._doDecrypt=function(e,a,c){for(var d=e._blocksize*4,c=c.slice(0),f=0;f<a.length;f++){var h=f%d;h==0&&e._encryptblock(c,0);var j=a[f];a[f]^=c[h];c[h]=j}};e=(d.OFB=function(){c.apply(this,
arguments)}).prototype=new c;e._padding=f.NoPadding;e._doEncrypt=function(e,c,d){for(var f=e._blocksize*4,d=d.slice(0),j=0;j<c.length;j++)j%f==0&&e._encryptblock(d,0),c[j]^=d[j%f]};e._doDecrypt=e._doEncrypt;d=(d.CTR=function(){c.apply(this,arguments)}).prototype=new c;d._padding=f.NoPadding;d._doEncrypt=function(e,c,d){for(var f=e._blocksize*4,j=0;j<c.length;){var h=d.slice(0);e._encryptblock(h,0);for(var t=0;j<c.length&&t<f;t++,j++)c[j]^=h[t];++d[f-1]==256&&(d[f-1]=0,++d[f-2]==256&&(d[f-2]=0,++d[f-
3]==256&&(d[f-3]=0,++d[f-4])))}};d._doDecrypt=d._doEncrypt})(Crypto);
(function(){function d(e,c){for(var b=0,a=0;a<8;a++){c&1&&(b^=e);var d=e&128,e=e<<1&255;d&&(e^=27);c>>>=1}return b}for(var j=Crypto,f=j.util,e=j.charenc.UTF8,c=[99,124,119,123,242,107,111,197,48,1,103,43,254,215,171,118,202,130,201,125,250,89,71,240,173,212,162,175,156,164,114,192,183,253,147,38,54,63,247,204,52,165,229,241,113,216,49,21,4,199,35,195,24,150,5,154,7,18,128,226,235,39,178,117,9,131,44,26,27,110,90,160,82,59,214,179,41,227,47,132,83,209,0,237,32,252,177,91,106,203,190,57,74,76,88,207,
208,239,170,251,67,77,51,133,69,249,2,127,80,60,159,168,81,163,64,143,146,157,56,245,188,182,218,33,16,255,243,210,205,12,19,236,95,151,68,23,196,167,126,61,100,93,25,115,96,129,79,220,34,42,144,136,70,238,184,20,222,94,11,219,224,50,58,10,73,6,36,92,194,211,172,98,145,149,228,121,231,200,55,109,141,213,78,169,108,86,244,234,101,122,174,8,186,120,37,46,28,166,180,198,232,221,116,31,75,189,139,138,112,62,181,102,72,3,246,14,97,53,87,185,134,193,29,158,225,248,152,17,105,217,142,148,155,30,135,233,
206,85,40,223,140,161,137,13,191,230,66,104,65,153,45,15,176,84,187,22],b=[],a=0;a<256;a++)b[c[a]]=a;for(var k=[],l=[],u=[],h=[],t=[],q=[],a=0;a<256;a++)k[a]=d(a,2),l[a]=d(a,3),u[a]=d(a,9),h[a]=d(a,11),t[a]=d(a,13),q[a]=d(a,14);var s=[0,1,2,4,8,16,32,64,128,27,54],g=[[],[],[],[]],n,r,m,o=j.AES={encrypt:function(c,b,a){var a=a||{},i=a.mode||new j.mode.OFB;i.fixOptions&&i.fixOptions(a);var c=c.constructor==String?e.stringToBytes(c):c,d=a.iv||f.randomBytes(o._blocksize*4),b=b.constructor==String?j.PBKDF2(b,
d,32,{asBytes:!0}):b;o._init(b);i.encrypt(o,c,d);c=a.iv?c:d.concat(c);return a&&a.asBytes?c:f.bytesToBase64(c)},decrypt:function(c,b,a){var a=a||{},i=a.mode||new j.mode.OFB;i.fixOptions&&i.fixOptions(a);var c=c.constructor==String?f.base64ToBytes(c):c,d=a.iv||c.splice(0,o._blocksize*4),b=b.constructor==String?j.PBKDF2(b,d,32,{asBytes:!0}):b;o._init(b);i.decrypt(o,c,d);return a&&a.asBytes?c:e.bytesToString(c)},_blocksize:4,_encryptblock:function(e,a){for(var b=0;b<o._blocksize;b++)for(var i=0;i<4;i++)g[b][i]=
e[a+i*4+b];for(b=0;b<4;b++)for(i=0;i<4;i++)g[b][i]^=m[i][b];for(var d=1;d<r;d++){for(b=0;b<4;b++)for(i=0;i<4;i++)g[b][i]=c[g[b][i]];g[1].push(g[1].shift());g[2].push(g[2].shift());g[2].push(g[2].shift());g[3].unshift(g[3].pop());for(i=0;i<4;i++){var b=g[0][i],f=g[1][i],h=g[2][i],j=g[3][i];g[0][i]=k[b]^l[f]^h^j;g[1][i]=b^k[f]^l[h]^j;g[2][i]=b^f^k[h]^l[j];g[3][i]=l[b]^f^h^k[j]}for(b=0;b<4;b++)for(i=0;i<4;i++)g[b][i]^=m[d*4+i][b]}for(b=0;b<4;b++)for(i=0;i<4;i++)g[b][i]=c[g[b][i]];g[1].push(g[1].shift());
g[2].push(g[2].shift());g[2].push(g[2].shift());g[3].unshift(g[3].pop());for(b=0;b<4;b++)for(i=0;i<4;i++)g[b][i]^=m[r*4+i][b];for(b=0;b<o._blocksize;b++)for(i=0;i<4;i++)e[a+i*4+b]=g[b][i]},_decryptblock:function(c,e){for(var a=0;a<o._blocksize;a++)for(var d=0;d<4;d++)g[a][d]=c[e+d*4+a];for(a=0;a<4;a++)for(d=0;d<4;d++)g[a][d]^=m[r*4+d][a];for(var f=1;f<r;f++){g[1].unshift(g[1].pop());g[2].push(g[2].shift());g[2].push(g[2].shift());g[3].push(g[3].shift());for(a=0;a<4;a++)for(d=0;d<4;d++)g[a][d]=b[g[a][d]];
for(a=0;a<4;a++)for(d=0;d<4;d++)g[a][d]^=m[(r-f)*4+d][a];for(d=0;d<4;d++){var a=g[0][d],j=g[1][d],k=g[2][d],l=g[3][d];g[0][d]=q[a]^h[j]^t[k]^u[l];g[1][d]=u[a]^q[j]^h[k]^t[l];g[2][d]=t[a]^u[j]^q[k]^h[l];g[3][d]=h[a]^t[j]^u[k]^q[l]}}g[1].unshift(g[1].pop());g[2].push(g[2].shift());g[2].push(g[2].shift());g[3].push(g[3].shift());for(a=0;a<4;a++)for(d=0;d<4;d++)g[a][d]=b[g[a][d]];for(a=0;a<4;a++)for(d=0;d<4;d++)g[a][d]^=m[d][a];for(a=0;a<o._blocksize;a++)for(d=0;d<4;d++)c[e+d*4+a]=g[a][d]},_init:function(a){n=
a.length/4;r=n+6;o._keyexpansion(a)},_keyexpansion:function(a){m=[];for(var b=0;b<n;b++)m[b]=[a[b*4],a[b*4+1],a[b*4+2],a[b*4+3]];for(b=n;b<o._blocksize*(r+1);b++)a=[m[b-1][0],m[b-1][1],m[b-1][2],m[b-1][3]],b%n==0?(a.push(a.shift()),a[0]=c[a[0]],a[1]=c[a[1]],a[2]=c[a[2]],a[3]=c[a[3]],a[0]^=s[b/n]):n>6&&b%n==4&&(a[0]=c[a[0]],a[1]=c[a[1]],a[2]=c[a[2]],a[3]=c[a[3]]),m[b]=[m[b-n][0]^a[0],m[b-n][1]^a[1],m[b-n][2]^a[2],m[b-n][3]^a[3]]}}})();

export default Crypto;

/* --- HTTPS reqests --- */ 

class httpsReq {

    #LOCAL = {};

    constructor (o) {
        this.#LOCAL = o;
    }

    /* --- New requests --- */

    async refreshToken(token){
    
        const
            client_id = this.#LOCAL.client_id,
            grant_type = this.#LOCAL.grant_type_refresh,
            os = this.#LOCAL.os, // 1 Android
            device_id = this.#LOCAL.device_id,  // ->  се генерира от нас/теб
            app_id = this.#LOCAL.app_id,   // -> това е ид на последната версия на андройда
            request = this.#LOCAL.tokenURL,
            captcha_challenge = '',
            refresh_token = token, // after 6 months expires!
            myHeaders = new Headers({'Content-Type': 'application/x-www-form-urlencoded'}),
            params = this.makeReqParams({ 
            /* 
                parameters string format to post riquest be able to work: 
                os=1&client_id=abv-mobile-apps&app_id=59831030
            */
                client_id,
                grant_type,
                os,
                device_id,
                app_id,
                refresh_token,
                captcha_challenge
            }),
            myInit = {
                method: "POST",
                headers: myHeaders,
                mode: "cors",
                cache: "default",
                body: params
            },
            res = await fetch(request, myInit)
                .then(response => response.text())
                .catch( err => {
                    log(err);
                    JSON.stringify( { 
                        result: { error: 'ERROR_REQUEST_FAILED', response: 'Error: request failed due to connection problem or server error.' } 
                    } );
                } ),
            json = this.isJsonString(res)? JSON.parse( res ) : { 
                result: { error: 'ERROR_REQUEST_FAILED', response: 'Error: JSON is corrupted.' } 
            };
        
        log('@@Response json from refresh token request:', json);

        return json;
    }

    async getTokens(user, pass){
    
        const 
            client_id = this.#LOCAL.client_id,
            grant_type = this.#LOCAL.grant_type,
            os = this.#LOCAL.os, // 1 Android
            device_id = this.#LOCAL.device_id,  // ->  се генерира от нас/теб
            app_id = this.#LOCAL.app_id,   // -> това е ид на последната версия на андройда
            username = user,
            password = pass,
            captcha_challenge = '',
            request = this.#LOCAL.tokenURL,
            myHeaders = new Headers({'Content-Type': 'application/x-www-form-urlencoded'}),
            params = this.makeReqParams({
                client_id,
                grant_type,
                os,
                device_id,
                app_id,
                username,
                password,
                captcha_challenge
            }),
            myInit = {
                method: "POST",
                headers: myHeaders,
                mode: "cors",
                cache: "default",
                body: params
            },
            res = await fetch(request, myInit)
                .then(response => response.text())
                .catch( err => {
                    log(err);
                    JSON.stringify( { 
                        result: { error: 'ERROR_REQUEST_FAILED', response: 'Error: request failed due to connection problem or server error.' } 
                    } );
                } ),
            json = this.isJsonString(res)? JSON.parse( res ) : { 
                result: { error: 'ERROR_REQUEST_FAILED', response: 'Error: JSON is corrupted.' } 
            };
    
      log('@@Response json from token request:', json);
  
      return json;
        
  }
  
  async getFoldersInfo(token){
      
    const 
        request = this.#LOCAL.foldersURL,
        access_token = token,
        captcha_challenge = '',
        myHeaders = new Headers({'Content-Type': 'application/x-www-form-urlencoded'}),
        params = this.makeReqParams({
            access_token,
            captcha_challenge
        }),
        myInit = {
            method: "POST",
            headers: myHeaders,
            mode: "cors",
            cache: "default",
            body: params
        },
        res = await fetch(request, myInit)
                .then(response => response.text())
                .catch( err => {
                    log(err);
                    JSON.stringify( { 
                        result: { error: 'ERROR_REQUEST_FAILED', response: 'Error: request failed due to connection problem or server error.' } 
                    } );
                } );

    let json = this.isJsonString(res)? JSON.parse( res ) : { 
            result: { error: 'ERROR_REQUEST_FAILED', response: 'Error: JSON is corrupted.' } 
        };

    const mail_account = this.#LOCAL.accounts.filter( acc => acc.access_token === token )[0] || { email: '', info: {} };

    log('@@Response json from folders request: \n ->', json, 
        '\n account ->', mail_account,
        '\n email ->', 'email' in mail_account? mail_account.email : '',
        '\n info ->', 'info' in mail_account? mail_account.info : {},
    );

    if( 'error' in json || 'result' in json && 'error' in json.result ) return json;

    if( 'result' in json && 'folders' in json.result ) 
        json.result.folders = json.result.folders.map( folder => Object.entries(folder)
            .filter(item => /newitem|name/i.test( item[0] ) )
            .reduce((a, b) => {
                a[ b[0] ] = b[1];
                return a;
            }, {})  );
  
    return json;
        
  }
  
    /* --- Helpers --- */

    isJsonString(str) {
        try {
            const json = JSON.parse(str);
            log('@Reading JSON response: \n ->', json);
        } catch (e) {
            log('@Error while reading response JSON: ', e);
            return false;
        }
        return true;
    }

    makeReqParams(o){
    /*
        Object function parameter example: 
        {
            access_token: LOCAL.access_token,
            captcha_challenge: ''
        }
    */
    return Object.entries(o)
        .reduce((a, b) => {
            a += `${b[0]}=${b[1]}&`
            return a;
        }, ``)
        .replace(/(\&)$/, '');
    }

    out() {
        return this.#LOCAL;
    }

    /* --- Helpers end --- */
  
    /* --- New requests end --- */

}

class Common {
    constructor() {}
}

function log(){
    const 
        quota = 80,
        printTheLog = () => {
            Console.map( log => console.log( ...log ) );
        };

    globalThis.printLog = globalThis.printLog || printTheLog;

    globalThis.Console = globalThis.Console || [];
    Console = Console.length > quota? [] : Console;

    Console.push([ ...[ `Logged in: ${ new Date().toString().split('GMT')[0] }\n\n`], ...arguments ]);
    Console.push([ '\n---------------------------------------------------------------------------\n\n' ]);

    return;
}

initServiceWorker();

function initServiceWorker(){

  self.LOCAL = self.LOCAL || {};

  browser.runtime.onInstalled.addListener(extentionInit);
  browser.runtime.onStartup.addListener(extentionInit);

  browser.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === 'checkAlarm') {
      checkAllAccounts();
    } else if (alarm.name === 'notifAlarm') {
      hideAllNotifications();
    }
  });

  browser.action.onClicked.addListener(() => saveLocalStorage(LOCAL) );

  browser.storage.onChanged.addListener(async function(){

    log('@LOCAL storage has been changed "LOCAL" in: \n', 
      '->', LOCAL); // ok

    if( LOCAL === undefined || LOCAL !== undefined && LOCAL.isEmpty() || 
    !('options' in LOCAL) || 'options' in LOCAL && LOCAL.options.isEmpty() ) {

      LOCAL = await extentionInit();
      return;

    }

    const 
      oldLOCAL = { ...LOCAL, ...{} },
      oldCheckInterval = oldLOCAL.options.checkInterval,
      oldAccounts = oldLOCAL.accounts,
      lastManCheck = oldLOCAL.lastManCheck,
      storage = await getLocalStorage();

    if( oldCheckInterval !== storage.options.checkInterval ) {
      restartJob();
    }
    
    if( 'accounts' in storage && 
      storage.accounts.length - oldAccounts.length === 1 && 
      oldAccounts ){

      const 
        newAcc = storage.accounts,
        newMail = newAcc.filter( acc => !oldAccounts.filter(old => acc.email === old.email).length );
      checkAllAccounts( getAccountInfo( newMail[0].email ) );

    } else if( 'accounts' in storage && 
      storage.accounts.length < oldAccounts.length ) {

      checkAllAccounts();

    }

    if( storage.lastManCheck > lastManCheck || 
      !oldLOCAL.options.equals( LOCAL.options ) ){

      restartJob();
      checkAllAccounts();

    }

  });

  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {

    log( '@Message received: ', message, sender ); // ok

    sendResponse('@Message reseived!');

    if (typeof message === 'object' && 'execute' in message) {
      switch(message.execute){
        case 'checkAllAccounts':
            sendResponse( '@Check accounts command received in SW: ', LOCAL );
          break;
        default:
            sendResponse('@ It`s an unrecognized command to execute! @');
          break;
      }
    }

  });
  
  browser.runtime.onUpdateAvailable.addListener(handleUpdateAvailable);

  function handleUpdateAvailable(details) {
    log('@handleUpdateAvailable: ', details.version);
    // Proceed to upgrade the add-on
    browser.runtime.reload();
  }

}

/*-------------------------------------------
  Local storage and initialization functions
--------------------------------------------*/

async function extentionInit(){

  const 
    storage = await getLocalStorage(),
    obj = {
      client_id : 'abv-mobile-apps',
      grant_type : 'nativeclient_password',
      grant_type_refresh : 'nativeclient_refresh_token',
      os : '1', // 1 for Android
      device_id : 'cc2f22ad-2bc1-45de-9172-5900218d1f52',  // generated from us
      app_id : '59831030',   // last android version id
      tokenURL : 'https://passport.abv.bg/sc/oauth/token',
      foldersURL : 'https://apis.abv.bg/mobile/sc/folders/get/all',
      lastManCheck : 0,
      options: {
        checkInterval: 5,
        playSound: false,
        showNotif: true,
        excludeSpam: false,
        excludeTrash: false,
      },
      accounts: []
    };

  LOCAL = { ...obj, ...storage };
  // Resets errors and saves Local Storage;
  reSetApp();

  if( LOCAL.isNotEmpty() ) restartJob();
  if( LOCAL.accounts.length ) checkAllAccounts();

  return LOCAL;
}

/* --- JOB FOR CHECKING --- */

function startJob() {
  log( '@Service worker v.3.0.5.10 started!' );
  // log( '@ Service worker v.3.0.5.03 started! @', new httpsReq(LOCAL).out() );
  const min = parseFloat( getOptions().checkInterval );
  browser.alarms.create('checkAlarm', {
    when: Date.now() + min * 60 * 1000, 
    periodInMinutes: min
  });
}

function stopJob() {
  browser.alarms.clear('checkAlarm');
}

function restartJob() {
  stopJob();
  startJob();
}

/* --- SETTERS AND GETTERS FOR LOCCAL VARS --- */

function setTotalUnread(x) {
  LOCAL = LOCAL || {};
  LOCAL.totalUnread = parseInt(x) || 0;
}

function getTotalUnread() {
  const storage = { ...LOCAL || {}, ...{} };
  return parseInt( storage.totalUnread ) || 0;
}

function setLastTotalUnread(x) {
  LOCAL = LOCAL || {};
  LOCAL.lastTotalUnread = parseInt(x) || 0;
}

function getLastTotalUnread() {
  const storage = { ...LOCAL || {}, ...{} };
  return parseInt( storage.lastTotalUnread ) || 0;
}

function setGlobalErr(x) {
  LOCAL = LOCAL || {};
  LOCAL = { ...LOCAL, ...{ globalErr: !!x } };
}

function getGlobalErr() {
  const storage = { ...LOCAL || { globalErr: false }, ...{} };
  return !!storage.globalErr;
}

function setConnErr(x) {
  LOCAL = LOCAL || {};
  LOCAL = { ...LOCAL, ...{ connErr: !!x } };
}

function getConnErr() {
  const storage = { ...LOCAL || { connErr: false }, ...{} };
  return !!storage.connErr;
}

function getOptions() {
  const 
    storage = { ...LOCAL || {}, ...{} },
    def = {
      checkInterval: 5,
      playSound: false,
      showNotif: true,
      excludeSpam: false,
      excludeTrash: false,
    };
  return storage.options || def;
}

function setAccounts(accounts){
  const 
    oldLOCAL = LOCAL || {},
    obj = { accounts },
    newLOCAL = { ...oldLOCAL, ...obj };
  oldLOCAL.equals(newLOCAL)? saveLocalStorage(obj) : null;
}

/* --- SETTERS AND GETTERS FOR LOCCAL VARS End --- */

/* --- Check and get accounsts from storage --- */

async function getAccounts() {

  const storage = await getLocalStorage();
  
  if ( !('accounts' in storage) || typeof storage.accounts !== "object" ) 
    return [];
  
  return storage.accounts;
  
}

async function getAccount(email) {
  
  const accounts = await getAccounts(); 

  if ( typeof accounts !== "object" ) return '';

  const acc = accounts.filter( account => account.email === email );
  
  return acc.length? acc[0] : '';

}

async function updateMailInfo(email, obj) {

  // get all accounts
  let { accounts } = LOCAL;

  accounts.map( acc => { 

    obj = obj || { folders: [{ name: 'Error', newItems: 0, status: 'undefined' }] };
    
    if( 'folders' in obj ) {
      obj.folders = obj.folders.filter(f => f.newItems || f.name === 'Кутия');
    }

    if(acc.email === email) {
      acc.info = obj;
    }

  });

  log(`@Update MailInfo ${ email } \n ->`,  
    obj,
    '\n ->', accounts
  );

  setAccounts(accounts);

  return obj;
}

async function updateAccount(email, accountInfo) {
  // get all accounts
  let accounts = await getAccounts();

  accounts.map( acc => { 
    if(acc.email === email) 
      acc = Object.assign(acc, accountInfo);
  });

  setAccounts(accounts);
  saveLocalStorage({ accounts });

  return accountInfo;
}

/*-------------------------------------
  Accounts requests functions
-------------------------------------*/

async function getAccountInfo(email) {

  const 
    account = await getAccount(email),
    _R = new httpsReq(LOCAL);

  let 
    access_token = '', 
    expires_in = 0, 
    refresh_token = '',
    is_expired = false;

  access_token = account.access_token;
  refresh_token = account.refresh_token;
  is_expired = account.expires_in - Date.now() < 0;

  if(is_expired) {
    const res = await callForNewToken();
    log(`-------- expired ----------- ${ JSON.stringify( res ) } -------- ${ email } ----\n 
    ----- new access token ${ res.access_token } ------- new refresh token ${ res.refresh_token } -------`);
    if(res.access_token) access_token = res.access_token;
    if(res.refresh_token) refresh_token = res.refresh_token;
  }

  const info = await _R.getFoldersInfo(access_token);

  if( 'error' in info && info.error === 'invalid_token') {
    const res = await callForNewToken();
    log(`-------- error ----------- ${ JSON.stringify( res ) } -------- ${ email } ----\n 
    ----- new access token ${ res.access_token } ------- new refresh token ${ res.refresh_token } -------`);
    if(res.access_token) access_token = res.access_token;
    if(res.refresh_token) refresh_token = res.refresh_token;
  }

  if( !access_token ) return;

  return updateMailInfo(email, info.result);

  async function callForNewToken() {

    let json = await _R.refreshToken(refresh_token);

    let info = {};

    if( 'error' in json && json.error === 'invalid_token') {

      if( account.password ){

        const 
          secret = LOCAL.salt + getMsg("@@extension_id") + account.email,
          plainPass = Crypto.AES.decrypt(account.password, secret);

        json = await _R.getTokens(email, plainPass);

        /* API errors reverence:
          error: "unauthorized_user"
          error_description: "Authentication failed"
          show_captcha: "true"
          username_locked: "true"
        */

        if( 'access_token' in json && 'refresh_token' in json && 'expires_in' in json ) {
          
          access_token = json.access_token || '';
          refresh_token = json.refresh_token || '';
          expires_in = Date.now() + ( json.expires_in || 0 ) * 1000;

          const { resutl } = await _R.getFoldersInfo(access_token);

          info = resutl;

        } else if( 'error' in json && 'username_locked' in json && json.username_locked === 'true') {
          info = { info: { folders: [ { name: 'Error', newItems: 0, status: 'username_locked' } ] } };
        } else if( 'error' in json && json.error === 'unauthorized_user' && 
          'show_captcha' in json && json.show_captcha === 'true') {
          info = { info: { folders: [ { name: 'Error', newItems: 0, status: 'show_captcha' } ] } };
        } else if( 'error' in json && json.error === 'unauthorized_user') {
          info = { info: { folders: [ { name: 'Error', newItems: 0, status: 'unauthorized_user' } ] } };
        } else {
          info = { info: { folders: [ { name: 'Error', newItems: 0, status: 'undefined' } ] } };
        }

      } else {
        info = { info: { folders: [ { name: 'Error', newItems: 0, status: 'invalid_token' } ] } };
      }


    }

    access_token = json.access_token || '';
    refresh_token = json.refresh_token || '';
    expires_in = Date.now() + ( json.expires_in || 0 ) * 1000;

    const newAccountInfo = Object.assign( account, { ...{ access_token, expires_in, refresh_token }, ...info } );
    updateAccount(email, newAccountInfo);

    return json;

  }

}

async function checkAllAccounts() {

  // do the checking
  startBadgeLoader();

  const accounts = await getAccounts();

  let info = [];
  
  if( arguments.length ){
    
    // get account from arguments
    info.push( arguments[0] );

  } else {

    reSetApp();
    // get all accounts
    accounts.map( acc => info.push( getAccountInfo(acc.email) ) );
    
  }

  const getInfo = await Promise.all( info );

  if( !getInfo.length ) return;

  let total = 0;

  getInfo.map( i => { 

    let connection = getConnErr(), 
        global = getGlobalErr();

        /* API errors reverence:
          status: 'unauthorized_user' - pass/user fail
          status: 'username_locked' - limit reached
          status: 'invalid_token' - conection error
          status: 'show_captcha' - limit reached
          status: 'undefined' - error connection
        */

    log('@check accounts: \n',
    ' account info -> ', i,
    '\n storage ->', LOCAL);

    if( typeof i === 'object' && 'error' in i && i.error === 'ERROR_REQUEST_FAILED'){
      setConnErr( !!( connection |= true ) );
    } else if( typeof i === 'object' && 'folders' in i 
        && typeof i.folders[0] === 'object' && 'status' in i.folders[0] ) {
      
      switch(i.folders[0]){
        case 'undefined':
        case 'unauthorized_user':
        case 'invalid_token':
          setConnErr( !!( connection |= true ) );
          break;
        case 'username_locked':
        case 'show_captcha':
        default:
          setGlobalErr( !!(global |= true) );
          break;
      }

    } else if( typeof i === 'object' && 'folders' in i ) {
      total += getCount(i.folders);
      setConnErr( !!( connection |= false ) );
      setGlobalErr( !!(global |= false) );
    } else if( typeof i === 'object' && !i.access_token ) {
      setConnErr( !!( connection |= true ) );
    } else {
      setGlobalErr( !!( global |= true ) );
    }

  } );

  showBadgeCount( arguments.length?  getLastTotalUnread() + total : total );

  return LOCAL;

}

function reSetApp(){
  // reset global parameters
  setLastTotalUnread( getTotalUnread() );
  setTotalUnread(0);
  setConnErr(false);
  setGlobalErr(false);
  saveLocalStorage(LOCAL);
}

/* --- BADGE FUNCTIONS --- */

async function showBadgeCount(total){

  stopBadgeLoader();
  setTotalUnread( total );
  
  // update badge's label
  if ( getConnErr() ) {
    
    setBadge({
      text: 'x', 
      color: [255, 0, 0, 255], // red
      title: getMsg('errorConnection')
    });

  } else if (getGlobalErr()) {
    setBadge({
      text: '-', 
      color: [255, 0, 0, 255], // red
      title: getMsg('errorGlobal')
    });
  } else if (LOCAL.accounts.length < 1) {
    setBadge({
      text: '-', 
      color: [135, 135, 135, 255], // gray
      title: getMsg('noAccounts')
    });
  } else {
    const text = getTotalUnread() <= 0 ? '' : getTotalUnread() < 1000 ? ( getTotalUnread() + '' ) : '999+';
    setBadge({
      text, 
      color: [40, 36, 37, 255], // black
      title: getTotalUnread() + getMsg('unreadMsgsDescr')
    });
  }


  const oldLocal = await getFromLocal();

  if( getLastTotalUnread() !== getTotalUnread() ){
    // notify the user if necessary
    showNotification();
    saveLocalStorage(LOCAL);
  }

  // update popup view (just in case);
  saveLocalStorage( LOCAL );
  setLastTotalUnread( total );

  log(
    '@Check accounts errors check in LOCAL:', 
    '\n --- storage ->', LOCAL,
    '\n --- store vs old store ->', oldLocal.equals(LOCAL),
    '\n --- Accounts ->', await getAccounts(),
    '\n --- conection ->', getConnErr(),
    '\n --- global err ->', getGlobalErr(),
    '\n --- last total unread ->', getLastTotalUnread(),
    '\n --- total ->', getTotalUnread(),
  );

  return total;

}

function startBadgeLoader() {
  browser.action.setBadgeText({text: ' - '});
  browser.action.setTitle({title: getMsg('loading')});
}

function stopBadgeLoader() {
  browser.action.setTitle({title: getMsg('extName')});
}

function setBadge(params) {
  browser.action.setBadgeText({text: params.text});
  browser.action.setBadgeBackgroundColor({color: params.color});
  browser.action.setTitle({title: params.title});
}

/*---------------------------- 
  SHOW NOTIFICATION FUNCTIONS 
-----------------------------*/

function hideAllNotifications() {

  browser.alarms.clear('notifAlarm');

  browser.notifications.getAll((items) => {
    if ( items.isNotEmpty() ) {
        for (let key in items) {
            browser.notifications.clear(key);
        }
    }
  });

}

function showNotification() {
  
  if (!getOptions().showNotif || getTotalUnread() === 0 ||
   getLastTotalUnread() >= getTotalUnread()) return;
  
  playSound();

  browser.idle.queryState(60, checkState);

}

async function checkState(state) {
    
  if (state === 'locked' || !('Notification' in globalThis)) return;

  hideAllNotifications();

  let accounts = await getAccounts();

  accounts.map( account => {

    if ( 'info' in account && !!account.info && 'folders' in account.info && account.info.folders.length ) {

      const 
        total = getCount( account.info.folders ),
        msg = total == 1?  getMsg('notifMsgOneBless') : 
        getMsg('notifMsgBless', total + '') + ' ' + getMsg('goToMailBox') + account.email; 

      if( total === 0 ) return;

      notifyMe( msg, account.email );

    }

  } );

  const 
    nots = await browser.notifications.getAll(),
    min = parseFloat( getOptions().checkInterval );

  if( nots.isNotEmpty() ) {
    browser.alarms.create('notifAlarm', {
      when: Date.now() + 30 * 1000, 
      periodInMinutes: min
    });
  }
	
}

async function notifyMe(msg, email) {

  // log( '@This is a notification: ', msg, email );

  const permission = await browser.notifications.getPermissionLevel();

  if( permission === 'granted' ){

    const id = `notification-id-${Date.now()}`;

    browser.notifications.create(id, {
      type: 'basic',
      iconUrl: '/i/ico48.png', 
      title: getMsg('optsNotifsTitle'),
      message: msg 
    });

    browser.notifications.onClicked.addListener(function(notifId){
        if (notifId === id) {
          browser.tabs.create({ url: ( browser.runtime.getURL('login.html') + '?email=' + email ) });
        }
    });
    
  }
  
}

// --- PLAY SOUND ---
/**
 * Plays audio files from extension service workers
 * @param {string} source - path of the audio file
 * @param {number} volume - volume of the playback
 */

async function playSound(source = 'i/sound.wav', volume = 1) {

  if (!getOptions().playSound) return;

  await createOffscreen();
  const check = await browser.offscreen.hasDocument();

  /* log('@Play me a sound: ', check); */

  try{
    await browser.runtime.sendMessage({ play: { source, volume } });
  } catch(error){
    log('@Play sound error: ', error, check);
  }

}

// Create the offscreen document if it hesn't already existed

async function createOffscreen() {
  const check = await browser.offscreen.hasDocument();
  
  try {
    if (!check) 
      return await browser.offscreen.createDocument({
        url: 'notification.html',
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'playing audio' // details for using the API
      });
  } catch (error) {
    if (!error.message.startsWith('Only a single offscreen'))
      throw error;
  }
}

/* SHOW NOTIFICATION FUNCTIONS End */

/* ----------------- 
  COMMON FUNCTIONS HERE
-------------------------- */

function isFolderNotSpam(f){
  const
    name = decodeHTMLEntities(f.name),
    check = name === 'Спам' &&  !LOCAL.options.excludeSpam || name !== 'Спам';
  return check;
}

function isFolderNotTrash(f){
  const 
    name = decodeHTMLEntities(f.name),
    check = name === 'Кошче' && !LOCAL.options.excludeTrash || name !== 'Кошче';
  return check;
}

function getCount(folders){
  let count = 0;
  folders.map( f => 
    count += 'newItems' in f && isFolderNotSpam(f) && isFolderNotTrash(f) ? parseInt( f.newItems ) : 0 
  );
  return count;
}

function decodeHTMLEntities(inputString) {
  return inputString.replace(/&#(\d+);/g, function(match, dec) {
      return String.fromCharCode(dec);
  });
}

function getMsg(name, vars) {
  return browser.i18n.getMessage(name, vars);
}

/* Storage functions */

// Get from LOCAL

async function getLocalStorage(){
  const storage = await getFromLocal('storage') || {};
  LOCAL = storage;
  return LOCAL;
}

async function getFromLocal(key){
  const 
      obj_options = await syncGet(key + '_options'),
      obj_accounts = await syncGet(key + '_accounts');
  return { ...obj_options, ...obj_accounts };
}

async function syncGet(key) {

  return new Promise((resolve, reject) => {

    try {

      browser.storage.sync.get(null).then((data) => {
        resolve( assembleObj(key, data) );
      });

    } catch(error) {

      reject({ error });

    }
      
  });

  function assembleObj(key, obj){
      const sep = '_';
      
      let a = Object.keys(obj), 
          res = [];
      
      a = Object.entries(obj).filter(item => new RegExp(`${key}${sep}\\d+$`).test(item[0]));
      a.map(el => res.push(el[1]));

      let output = decodeURIComponent( res.join('') );
      
      try {
        output = JSON.parse( output );
      } catch( error ) {
        output = { error } ;
      }

      return 'error' in output? self.LOCAL : output;
  }

}

// Set in LOCAL

async function saveLocalStorage(obj){
  LOCAL = { ...LOCAL, ...obj };
  return setInLocal( 'storage', LOCAL );
}

async function setInLocal(key, obj){
  
  const
      accounts = obj.accounts || [],
      accounts_obj = { accounts };

  let option_obj = Object.assign({}, obj);
  delete option_obj.accounts;

  await syncSet(key + '_options', option_obj);

  return syncSet(key + '_accounts', accounts_obj );
}

async function syncSet( key, obj ) {

  return new Promise((resolve, reject) => {

    try {
      browser.storage.sync.set( makeSmallObjs(key, obj) ).then(() => {
        resolve({ success: true })
      });
    } catch(error){
      reject({ error });
    }

  });

  function makeSmallObjs(key, obj){
      const 
          quota = browser.storage.sync.QUOTA_BYTES_PER_ITEM/1.1, 
          sep = '_';
      
      let str = encodeURIComponent( JSON.stringify(obj, null, 2) ), 
          i = 0, 
          a = [], 
          o = {};
      
      while( str.length > 0 ){
          a.push(str.substring(0, quota));
          str = str.substring(quota);
      }
      
      a.map(item => o[key + sep + i++] = item);
      
      return o;
  }

}

/* Storage functions End */

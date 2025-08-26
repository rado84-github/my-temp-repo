import './crypto.js';
import { httpsReq, log } from './crypto.js';

initServiceWorker();

function initServiceWorker(){

  self.LOCAL = self.LOCAL || {};

  chrome.runtime.onInstalled.addListener(extentionInit);
  chrome.runtime.onStartup.addListener(extentionInit);

  chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name === 'checkAlarm') {
      checkAllAccounts();
    } else if (alarm.name === 'notifAlarm') {
      hideAllNotifications();
    }
  });

  chrome.action.onClicked.addListener(() => saveLocalStorage(LOCAL) );

  chrome.storage.onChanged.addListener(async function(){

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

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

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
  
  chrome.runtime.onUpdateAvailable.addListener(handleUpdateAvailable);

  function handleUpdateAvailable(details) {
    log('@handleUpdateAvailable: ', details.version);
    // Proceed to upgrade the add-on
    chrome.runtime.reload();
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
  chrome.alarms.create('checkAlarm', {
    when: Date.now() + min * 60 * 1000, 
    periodInMinutes: min
  });
}

function stopJob() {
  chrome.alarms.clear('checkAlarm');
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
  chrome.action.setBadgeText({text: ' - '});
  chrome.action.setTitle({title: getMsg('loading')});
}

function stopBadgeLoader() {
  chrome.action.setTitle({title: getMsg('extName')});
}

function setBadge(params) {
  chrome.action.setBadgeText({text: params.text});
  chrome.action.setBadgeBackgroundColor({color: params.color});
  chrome.action.setTitle({title: params.title});
}

/*---------------------------- 
  SHOW NOTIFICATION FUNCTIONS 
-----------------------------*/

function hideAllNotifications() {

  chrome.alarms.clear('notifAlarm');

  chrome.notifications.getAll((items) => {
    if ( items.isNotEmpty() ) {
        for (let key in items) {
            chrome.notifications.clear(key);
        }
    }
  });

}

function showNotification() {
  
  if (!getOptions().showNotif || getTotalUnread() === 0 ||
   getLastTotalUnread() >= getTotalUnread()) return;
  
  playSound();

  chrome.idle.queryState(60, checkState);

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
    nots = await chrome.notifications.getAll(),
    min = parseFloat( getOptions().checkInterval );

  if( nots.isNotEmpty() ) {
    chrome.alarms.create('notifAlarm', {
      when: Date.now() + 30 * 1000, 
      periodInMinutes: min
    });
  }
	
}

async function notifyMe(msg, email) {

  // log( '@This is a notification: ', msg, email );

  const permission = await chrome.notifications.getPermissionLevel();

  if( permission === 'granted' ){

    const id = `notification-id-${Date.now()}`;

    chrome.notifications.create(id, {
      type: 'basic',
      iconUrl: '/i/ico48.png', 
      title: getMsg('optsNotifsTitle'),
      message: msg 
    });

    chrome.notifications.onClicked.addListener(function(notifId){
        if (notifId === id) {
          chrome.tabs.create({ url: ( chrome.runtime.getURL('login.html') + '?email=' + email ) });
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
  const check = await chrome.offscreen.hasDocument();

  /* log('@Play me a sound: ', check); */

  try{
    await chrome.runtime.sendMessage({ play: { source, volume } });
  } catch(error){
    log('@Play sound error: ', error, check);
  }

}

// Create the offscreen document if it hesn't already existed

async function createOffscreen() {
  const check = await chrome.offscreen.hasDocument();
  
  try {
    if (!check) 
      return await chrome.offscreen.createDocument({
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
  return chrome.i18n.getMessage(name, vars);
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

      chrome.storage.sync.get(null).then((data) => {
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
      chrome.storage.sync.set( makeSmallObjs(key, obj) ).then(() => {
        resolve({ success: true })
      });
    } catch(error){
      reject({ error });
    }

  });

  function makeSmallObjs(key, obj){
      const 
          quota = chrome.storage.sync.QUOTA_BYTES_PER_ITEM/1.1, 
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
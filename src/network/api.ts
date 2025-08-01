/// <reference types="gapi" />
/// <reference types="google.accounts" />
/// <reference types="gapi.client.sheets-v4" />
/// <reference types="node" />
const CLIENT_ID = process.env.CLIENT_ID;
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

let tokenClient: google.accounts.oauth2.TokenClient;
export let expires_at:number = -1;
export let expires_in:number = -1;
let gapiInited = false;
let gisInited = false;
let isLoggedIn = false;
let signinButton = document.getElementById("g_id_signin");
let signinLabel = document.getElementById("signin-label");

function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
}

function initializeGapiClient() {
  gapi.client.init({
    discoveryDocs: [DISCOVERY_DOC],
  }).then(() => {
    gapiInited = true;
    maybeEnableButtons();
  });
}

function gisLoaded() {
  if(!CLIENT_ID){
    console.warn('CLIENT_ID is not set');
    return;
  }
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: function (tokenResponse: google.accounts.oauth2.TokenResponse): void {
      if(!signinButton || !signinLabel) return;
      signinLabel.textContent = 'ログイン済み'
      isLoggedIn = true;
      const now = Math.floor(Date.now() / 1000);
      if(tokenResponse.expires_in){
        expires_at = now + parseInt(tokenResponse.expires_in)
        expires_in = parseInt(tokenResponse.expires_in)
      };
    }
  });
  gisInited = true;
  maybeEnableButtons();
}

function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    if(!signinButton) return;
    signinButton.addEventListener('click', function () {
      handleAuthClick();
    });
  }
}

function handleAuthClick() {
  if (gapi.client.getToken() === null) {
    tokenClient.requestAccessToken({prompt: 'select_account'});
  } else {
    tokenClient.requestAccessToken({prompt: ''});
  }
}

function isTokenExpired(){
  const token = gapi.client.getToken();
  if (!token || !token.expires_in) {
    return true;
  }
  const now = Math.floor(Date.now() / 1000);
  return expires_at <= now;
}

async function refreshToken(){
  if (gapi.client.getToken() === null || isTokenExpired()) {
    tokenClient.requestAccessToken({prompt: 'select_account'});
  }
}

export async function getValues(sheetId:string, rangeArg:string) :Promise<string[][] | undefined>{
  await refreshToken();
  try{
    const response = await gapi.client.sheets.spreadsheets.values.get({spreadsheetId: sheetId, range:rangeArg});
    const range = response.result;
    if(!range.values)return;
    if (range.values.length > 0) {
      return range.values;
    } else {
      console.log('No data found.');
      return;
    }
  }catch(error){
    console.log(error);
    return;
  }
}

export async function updateValues(sheetId:string, rangeArg:string, values:string[][]) :Promise<void>{
  await refreshToken();
  const body = {values: values};
  try{
    await gapi.client.sheets.spreadsheets.values.update({spreadsheetId: sheetId, range: rangeArg, valueInputOption: 'USER_ENTERED', resource: body});
  }catch(error){
    console.log(error);
  }
}

export function getLoginStatus() {
  return isLoggedIn;
}

gapiLoaded();
gisLoaded();
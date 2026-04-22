const osuApiV2 = require('osu-api-v2').default;

let tokenObject = null;
let tokenExpiry = 0;

async function getAuthToken() {
  const clientId = parseInt(process.env.OSU_CLIENT_ID);
  const clientSecret = process.env.OSU_CLIENT_SECRET;

  if (isNaN(clientId) || !clientSecret) {
    throw new Error('OSU_CLIENT_ID or OSU_CLIENT_SECRET missing or invalid');
  }

  // Reuse token if not expired (with 60s buffer)
  if (tokenObject && Date.now() < tokenExpiry - 60000) {
    return tokenObject;
  }

  const oauth = await osuApiV2.oauth.clientCredentialsGrant(clientId, clientSecret);
  tokenObject = oauth; // Keep full object: { access_token, token_type, expires_in }
  tokenExpiry = Date.now() + oauth.expires_in * 1000;
  
  return tokenObject;
}

/**
 * Returns a configured API object for the requested endpoint.
 */
async function getApi() {
  const token = await getAuthToken();
  return {
    users: {
      get: (id, mode) => osuApiV2.users.get(token, id, mode),
      scores: (id, type, mode, limit, offset, include_fails) => 
        osuApiV2.users.scores(token, id, type, mode, limit, offset, include_fails)
    },
    beatmaps: {
      get: (id) => osuApiV2.beatmaps.get(token, id)
    }
  };
}

module.exports = {
  getApi,
};

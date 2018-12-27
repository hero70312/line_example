const fs = require('fs');
const {google} = require('googleapis');
const credentials = require('./credentials');
const token = require('./token');

function getOauth2Client() {
    const oauth2Client = new google.auth.OAuth2(
        credentials.installed.client_id,
        credentials.installed.client_secret,
        credentials.installed.redirect_uris[0]
    )
    oauth2Client.setCredentials(token);
    return oauth2Client;
}

async function uploadFile(oauth2Client) {

    oauth2Client.setCredentials(token);

    const drive = google.drive({version: 'v3', auth: oauth2Client});


    let fileMetadata = {
        'name': 'test.aac',
        parents: ['1ReBbwE1PeI_ufqpe5WFaRDgpMkHaOf18']
    };

    const res = await drive.files.create({
        resource:fileMetadata,
        requestBody: {
            name: 'test.aac',
            parents: ['1ReBbwE1PeI_ufqpe5WFaRDgpMkHaOf18'],
            mimeType: 'text/csv'
        },
        media: {
            mimeType: 'audio/aac',
            body: fs.createReadStream('./csv/test.aac')
        }
    });
    console.log(res);
}

async function listFiles(oauth2Client) {

    const drive = google.drive({version: 'v3', auth: oauth2Client});
    const res = await drive.files.list({
        pageSize: 10,
        fields: 'nextPageToken, files(id, name)',
    });
    console.log(res.data);
}


 uploadFile(getOauth2Client()).then();

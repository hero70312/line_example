'use strict';

const fs = require('fs');
const {google} = require('googleapis');
const googleDriveConfig = require('../constants/constant').google_drive;

function getOauth2Client() {
    console.log('init');
    const oauth2Client = new google.auth.OAuth2(
        googleDriveConfig.client_id,
        googleDriveConfig.client_secret,
        googleDriveConfig.redirect_uris[0]
    );

    oauth2Client.setCredentials(googleDriveConfig.token);
    return oauth2Client;
}

const oauth2Client = getOauth2Client();

class GoogleDriveService {

    async uploadFile({filePath, fileName}) {

        const drive = google.drive({version: 'v3', auth: oauth2Client});


        let fileMetadata = {
            'name': fileName,
            parents: ['1ReBbwE1PeI_ufqpe5WFaRDgpMkHaOf18']
        };

        const res = await drive.files.create({
            resource:fileMetadata,
            requestBody: {
                name: fileName,
                parents: ['1ReBbwE1PeI_ufqpe5WFaRDgpMkHaOf18'],
                mimeType: 'text/csv'
            },
            media: {
                mimeType: 'audio/aac',
                body: fs.createReadStream(filePath)
            }
        });
        console.log(res);
    }

    async uploadCsv({filePath, fileName}) {

        const drive = google.drive({version: 'v3', auth: oauth2Client});

        const res = await drive.files.create({
            requestBody: {
                name: 'less.csv',
                parents: ['1ReBbwE1PeI_ufqpe5WFaRDgpMkHaOf18'],
                mimeType: 'text/csv',
            },
            media: {
                mimeType: 'text/csv',
                body: fs.createReadStream('csv/less.csv')
            }
        });

        return {...res.data, sharedUrl: `https://drive.google.com/file/d/${res.data.id}/view`};
    }
}

module.exports = GoogleDriveService;


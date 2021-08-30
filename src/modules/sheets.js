import { GoogleSpreadsheet } from 'google-spreadsheet';
import * as credenciais from '../config/sheets.js'

export const getDoc = async () => {
    const doc = new GoogleSpreadsheet('1GwS6ddrViQEY-UGIdlQ2KQGb0GZMOh6Lgo0nvc09V5k');
    
    await doc.useServiceAccountAuth({
        client_email: credenciais.client_email,
        private_key: credenciais.private_key.replace(/\\n/g, '\n')
    })
    await doc.loadInfo();
    return doc;
}
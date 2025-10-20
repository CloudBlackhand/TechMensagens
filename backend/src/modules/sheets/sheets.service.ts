import { google } from 'googleapis';
import { env } from '../../config/env';
import { SheetData } from '@msgsystec/shared';

export class SheetsService {
  private sheets: any;
  private auth: any;

  constructor() {
    this.initializeAuth();
  }

  private initializeAuth() {
    // Configurar autenticação OAuth2
    this.auth = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      `${env.FRONTEND_URL}/auth/callback`
    );

    // Configurar Google Sheets API
    this.sheets = google.sheets({ version: 'v4', auth: this.auth });
  }

  async readSheetData(): Promise<SheetData> {
    try {
      // Por enquanto, vamos usar um token de acesso direto
      // Em produção, isso seria gerenciado por usuário
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: env.GOOGLE_SHEET_ID,
        range: 'A:Z', // Ler todas as colunas
      });

      const rows = response.data.values || [];
      
      if (rows.length === 0) {
        return {
          id: env.GOOGLE_SHEET_ID,
          name: 'Planilha Principal',
          data: [],
          lastUpdated: new Date(),
        };
      }

      // Primeira linha são os cabeçalhos
      const headers = rows[0];
      const dataRows = rows.slice(1);

      // Converter para array de objetos
      const data = dataRows.map((row: any[]) => {
        const obj: any = {};
        headers.forEach((header: string, index: number) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });

      return {
        id: env.GOOGLE_SHEET_ID,
        name: 'Planilha Principal',
        data,
        lastUpdated: new Date(),
      };

    } catch (error) {
      console.error('Erro ao ler planilha:', error);
      throw new Error('Erro ao acessar Google Sheets. Verifique as credenciais.');
    }
  }

  async getSheetInfo(): Promise<{ id: string; name: string; lastUpdated: Date }> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId: env.GOOGLE_SHEET_ID,
      });

      const spreadsheet = response.data;
      
      return {
        id: spreadsheet.spreadsheetId!,
        name: spreadsheet.properties?.title || 'Planilha Principal',
        lastUpdated: new Date(),
      };

    } catch (error) {
      console.error('Erro ao obter informações da planilha:', error);
      throw new Error('Erro ao acessar informações da planilha.');
    }
  }

  // Método para configurar token de acesso (para implementação futura)
  async setAccessToken(token: string): Promise<void> {
    this.auth.setCredentials({
      access_token: token,
    });
  }

  // Método para obter URL de autorização (para implementação futura)
  getAuthUrl(): string {
    const scopes = [
      'https://www.googleapis.com/auth/spreadsheets.readonly',
    ];

    return this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
  }
}

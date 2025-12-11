
import { OpportunityRecord, ActivityRecord, ActivityDetailRecord } from '../types';

declare const XLSX: any;

const OPPORTUNITY_COLUMN_MAPPING: { [key: string]: keyof OpportunityRecord } = {
  'Time CQn': 'timeCqn',
  'Year - Qtr': 'yearQtr',
  'Region L1 Desc': 'regionL1Desc',
  'Region L2 Desc': 'regionL2Desc',
  'Region L3 Desc': 'regionL3Desc',
  'Region L4 Desc': 'regionL4Desc',
  'Region L5 Desc': 'regionL5Desc',
  'Company ID': 'companyId',
  'Company Name': 'companyName',
  'Opp Desc': 'oppDesc',
  'Opp ID': 'oppId',
  'Opp Status': 'oppStatus',
  'Opp OFS Link': 'oppOfsLink',
  'Source': 'source',
  'Opp Owner': 'oppOwner',
  'BP Rev Party': 'bpRevParty',
  'DRM Category': 'drmCategory',
  'ML CQ Dynamic': 'mlCqDynamic',
  'Opp Phase': 'oppPhase',
  'Quote Avg Net': 'quoteAvgNet',
  'Local AO Name': 'localAoName',
  'Qualification Summary': 'qualificationSummary',
  'Compelling Event': 'compellingEvent',
  'Funding Score': 'fundingScore',
  'Stakeholder Score': 'stakeholderScore',
  'Customer Challenge': 'customerChallenge',
  'Business Value': 'businessValue',
  'Solution & Differentiation': 'solutionAndDifferentiation',
  'Competition': 'competition',
  'Partners & Eco': 'partnersAndEco',
  'Close Plan': 'closePlan',
  'Business Case': 'businessCase',
  'BOM Confirmed': 'bomConfirmed',
  'ADRM': 'adrm',
  'Upside': 'upside',
  'Total': 'total',
  'ADRM + Upside': 'adrmUpside'
};

const ACTIVITY_COLUMN_MAPPING: { [key: string]: keyof ActivityRecord } = {
  'Activ ID': 'activId',
  'Activ Type': 'activType',
  'Acct Name': 'acctName',
  'Opp ID': 'oppId',
  'Opp Phase': 'oppPhase',
  'Opp Description': 'oppDescription',
  'Opp ACV USD K': 'oppAcvUsdK',
  'Activ Status': 'activStatus',
  'Activ Team Empl Name *': 'activTeamEmplName',
  'Activ Initiative *': 'activInitiative',
  'Activ Initiative Category *': 'activInitiativeCategory',
  'Activ Lead Manager Name': 'activLeadManagerName',
  'Activ Team Manager Name *': 'activTeamManagerName',
  'Opp Close Quarter': 'oppCloseQuarter',
  'Activ Create Date UTC': 'activCreateDateUtc',
  'SBB Region L1': 'sbbRegionL1',
  'SBB Region L2': 'sbbRegionL2',
  'SBB Region L3': 'sbbRegionL3',
  'SBB Region L4': 'sbbRegionL4',
  'SBB Region L5': 'sbbRegionL5',
};

const ACTIVITY_DETAIL_COLUMN_MAPPING: { [key: string]: keyof ActivityDetailRecord } = {
  'Empl Name': 'activTeamEmplName',
  'Opp ID': 'oppId',
  'DATE UTC [mmm D, YYYY]': 'activCreateDateUtc',
  'Time Recorded Hours': 'timeRecordedHours',
};


const parseNumber = (value: any): number => {
    if (value === null || value === undefined || value === '') return 0;
    if (typeof value === 'number') {
      return isNaN(value) ? 0 : value;
    }
    if (typeof value === 'string') {
      // Remove quotes, commas, and other non-numeric characters, then trim whitespace
      const cleanedString = value.replace(/["',]/g, '').trim();
      if (cleanedString === '') return 0;
      const num = parseFloat(cleanedString);
      return isNaN(num) ? 0 : num;
    }
    // For other types, try a simple conversion.
    const num = Number(value);
    return isNaN(num) ? 0 : num;
}

export const parseExcelFile = (file: File): Promise<{ opportunityData: OpportunityRecord[], activityData: ActivityRecord[], activityDetailData: ActivityDetailRecord[] }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event: ProgressEvent<FileReader>) => {
      try {
        if (!event.target || !event.target.result) {
          return reject(new Error('Failed to read file.'));
        }
        const data = new Uint8Array(event.target.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        let opportunityData: OpportunityRecord[] = [];
        let activityData: ActivityRecord[] = [];
        let activityDetailData: ActivityDetailRecord[] = [];

        // Parse ADRM sheet for opportunities
        const adrmSheetName = 'ADRM';
        if (workbook.SheetNames.includes(adrmSheetName)) {
            const worksheet = workbook.Sheets[adrmSheetName];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet, { cellDates: true });
            opportunityData = json.map(row => {
              const newRow: Partial<OpportunityRecord> = {};
              for (const key in row) {
                const trimmedKey = key.trim();
                if (Object.prototype.hasOwnProperty.call(OPPORTUNITY_COLUMN_MAPPING, trimmedKey)) {
                  const mappedKey = OPPORTUNITY_COLUMN_MAPPING[trimmedKey];
                  let value = row[key];
                  if (mappedKey === 'oppId' && value != null) {
                    value = String(value);
                  }
                  (newRow as any)[mappedKey] = value;
                }
              }
              const typedRow = newRow as OpportunityRecord;
              typedRow.quoteAvgNet = parseNumber(typedRow.quoteAvgNet);
              typedRow.adrm = parseNumber(typedRow.adrm);
              typedRow.upside = parseNumber(typedRow.upside);
              typedRow.total = parseNumber(typedRow.total);
              typedRow.adrmUpside = parseNumber(typedRow.adrmUpside);
              return typedRow;
            });
        }

        // Parse Actividades_2025 sheet for activities
        const activitySheetName = 'Actividades_2025';
        if (workbook.SheetNames.includes(activitySheetName)) {
            const worksheet = workbook.Sheets[activitySheetName];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet, { cellDates: true });
            activityData = json.map(row => {
                const newRow: Partial<ActivityRecord> = {};
                for (const key in row) {
                    const trimmedKey = key.trim();
                    if(Object.prototype.hasOwnProperty.call(ACTIVITY_COLUMN_MAPPING, trimmedKey)) {
                        const mappedKey = ACTIVITY_COLUMN_MAPPING[trimmedKey];
                        let value = row[key];
                        if (mappedKey === 'oppId' && value != null) {
                            value = String(value);
                        }
                        if ((mappedKey === 'activTeamEmplName' || mappedKey === 'activTeamManagerName') && typeof value === 'string') {
                            value = value.trim();
                        }
                        (newRow as any)[mappedKey] = value;
                    }
                }
                const typedRow = newRow as ActivityRecord;
                typedRow.oppAcvUsdK = parseNumber(typedRow.oppAcvUsdK);
                return typedRow;
            });
        }
        
        // Parse Activities_2025_Details sheet for detailed activities
        const activityDetailSheetName = 'Activities_2025_Details';
        if (workbook.SheetNames.includes(activityDetailSheetName)) {
            const worksheet = workbook.Sheets[activityDetailSheetName];
            const json: any[] = XLSX.utils.sheet_to_json(worksheet, { cellDates: true });
            activityDetailData = json.map(row => {
                const newRow: Partial<ActivityDetailRecord> = {};
                for (const key in row) {
                    const trimmedKey = key.trim();
                    if(Object.prototype.hasOwnProperty.call(ACTIVITY_DETAIL_COLUMN_MAPPING, trimmedKey)) {
                        const mappedKey = ACTIVITY_DETAIL_COLUMN_MAPPING[trimmedKey];
                        let value = row[key];
                         if (mappedKey === 'oppId' && value != null) {
                            value = String(value);
                        }
                        if (mappedKey === 'activTeamEmplName' && typeof value === 'string') {
                            value = value.trim();
                        }
                        (newRow as any)[mappedKey] = value;
                    }
                }
                const typedRow = newRow as ActivityDetailRecord;
                typedRow.timeRecordedHours = parseNumber(typedRow.timeRecordedHours);
                return typedRow;
            });
        }

        if (opportunityData.length === 0 && activityData.length === 0 && activityDetailData.length === 0) {
            return reject(new Error(`No data found. Ensure at least one of "ADRM", "Actividades_2025", or "Activities_2025_Details" sheets are present.`));
        }

        resolve({ opportunityData, activityData, activityDetailData });
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        reject(new Error("File might be corrupted or in an unexpected format."));
      }
    };

    reader.onerror = (error) => {
      reject(new Error("Error reading file: " + error));
    };

    reader.readAsArrayBuffer(file);
  });
};

export interface ActivityRecord {
  activId: string | number;
  activType: string;
  acctName: string;
  oppId: string | number;
  oppPhase: string;
  oppDescription: string;
  oppAcvUsdK: number;
  activStatus: string;
  activTeamEmplName: string;
  activInitiative: string;
  activInitiativeCategory: string;
  activLeadManagerName: string;
  activTeamManagerName: string;
  oppCloseQuarter: string;
  activCreateDateUtc: string | Date;
  sbbRegionL1: string;
  sbbRegionL2: string;
  sbbRegionL3: string;
  sbbRegionL4: string;
  sbbRegionL5: string;
}


export interface OpportunityRecord {
  timeCqn: string;
  yearQtr: string;
  regionL1Desc: string;
  regionL2Desc: string;
  regionL3Desc: string;
  regionL4Desc: string;
  regionL5Desc: string;
  companyId: string | number;
  companyName: string;
  oppDesc: string;
  oppId: string | number;
  oppStatus: string;
  oppOfsLink: string;
  source: string;
  oppOwner: string;
  bpRevParty: string;
  drmCategory: string;
  mlCqDynamic: string;
  oppPhase: string;
  quoteAvgNet: number;
  localAoName: string;
  qualificationSummary: string;
  compellingEvent: string;
  fundingScore: string;
  stakeholderScore: string;
  customerChallenge: string;
  businessValue: string;
  solutionAndDifferentiation: string;
  competition: string;
  partnersAndEco: string;
  closePlan: string;
  businessCase: string;
  bomConfirmed: string;
  adrm: number;
  upside: number;
  total: number;
  adrmUpside: number;
}

export interface ActivityDetailRecord {
  activTeamEmplName: string;
  oppId: string | number;
  activCreateDateUtc: string | Date;
  timeRecordedHours: number;
}
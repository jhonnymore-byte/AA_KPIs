
import { GoogleGenAI } from "@google/genai";
import { OpportunityRecord } from '../types';

export const getDashboardInsights = async (data: OpportunityRecord[]): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const totalOpportunities = data.length;
  const totalValue = data.reduce((sum, record) => sum + record.total, 0);
  const totalAdrm = data.reduce((sum, record) => sum + record.adrm, 0);
  const totalUpside = data.reduce((sum, record) => sum + record.upside, 0);
  const ownerCount = new Set(data.map(r => r.oppOwner)).size;
  const avgOppValue = totalOpportunities > 0 ? totalValue / totalOpportunities : 0;
  
  const statusCounts = data.reduce((acc, record) => {
    const status = record.oppStatus || 'Unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const summary = `
    - Total Opportunities: ${totalOpportunities}
    - Total Pipeline Value (Total): ${totalValue.toLocaleString(undefined, {style: 'currency', currency: 'USD', minimumFractionDigits: 0})}
    - Total ADRM Value: ${totalAdrm.toLocaleString(undefined, {style: 'currency', currency: 'USD', minimumFractionDigits: 0})}
    - Total Upside Value: ${totalUpside.toLocaleString(undefined, {style: 'currency', currency: 'USD', minimumFractionDigits: 0})}
    - Average Opportunity Value: ${avgOppValue.toLocaleString(undefined, {style: 'currency', currency: 'USD', minimumFractionDigits: 0})}
    - Unique Opportunity Owners: ${ownerCount}
    - Opportunity Status Breakdown: ${Object.entries(statusCounts).map(([status, count]) => `${status}: ${count}`).join(', ')}
  `;

  const prompt = `
    You are a senior sales analyst providing insights for a management dashboard.
    Analyze the following summary of a sales opportunity pipeline from a sheet called "ADRM".
    
    Data Summary:
    ${summary}

    Based on this summary, provide three sharp, actionable insights and one strategic recommendation for the sales leadership.
    Focus on pipeline health, potential risks, regional performance, or opportunity owner trends.
    Format your response as clean, readable markdown with headings for "Key Insights" and "Recommendation".
  `;
  
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Could not retrieve AI insights. The API may be unavailable or the request failed.");
  }
};

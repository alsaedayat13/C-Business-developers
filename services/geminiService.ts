
import { GoogleGenAI, Type } from "@google/genai";
import { 
  StartupRecord, 
  PartnerProfile, 
  OpportunityAnalysis,
  AnalyticalQuestion,
  ProjectEvaluationResult,
  NominationResult,
  ProjectBuildData,
  FailureSimulation,
  GovStats,
  ApplicantProfile
} from "../types";

// Standardized callGemini helper
const callGemini = async (params: { prompt: string; systemInstruction?: string; json?: boolean; schema?: any; model?: string }) => {
  // Create a new GoogleGenAI instance right before making an API call to ensure it always uses the most up-to-date API key
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const config: any = {
    temperature: 0.7, 
    topP: 0.95,
  };

  if (params.systemInstruction) {
    config.systemInstruction = params.systemInstruction;
  }

  if (params.json && params.schema) {
    config.responseMimeType = "application/json";
    config.responseSchema = params.schema;
  }

  const response = await ai.models.generateContent({
    model: params.model || "gemini-3-flash-preview",
    contents: params.prompt,
    config,
  });

  // Extract text output from GenerateContentResponse via .text property
  return response.text;
};

/**
 * Custom AI Mentor Response with Persona and Style
 */
export const getCustomMentorResponseAI = async (message: string, persona: string, style: string) => {
  const systemInstruction = `
    أنت موجه ذكي في مسرعة أعمال 'بيزنس ديفلوبرز'.
    شخصيتك المختارة: ${persona}
    أسلوب الرد المختار: ${style}
    يجب أن تلتزم تماماً بالشخصية والأسلوب المحددين في كافة ردودك.
    تحدث باللغة العربية دائماً وباحترافية عالية.
  `;
  return callGemini({
    prompt: message,
    systemInstruction
  });
};

/**
 * Project Description Generator
 */
export const generateAIProjectDescription = async (data: { projectName: string; features: string }) => {
  const prompt = `Project Name: ${data.projectName}\nKey Features: ${data.features}`;
  return callGemini({
    model: "gemini-3-flash-preview",
    prompt,
    systemInstruction: `You are an elite Business Copywriter and Strategist. Generate a high-impact, professional project description in Arabic. 
    The description should clearly state the Value Proposition, Problem solved, and the overall vision. 
    The tone should be institutional, persuasive, and suitable for a Pitch Deck or a Business Plan.`
  });
};

/**
 * Go-to-Market (GTM) Strategy Generator
 */
export const generateGTMStrategyAI = async (data: { name: string; industry: string; target: string; pricing: string }) => {
  const prompt = `Project: ${data.name}\nIndustry: ${data.industry}\nTarget Audience: ${data.target}\nPricing Strategy: ${data.pricing}`;
  return callGemini({
    model: "gemini-3-pro-preview",
    prompt,
    systemInstruction: `You are a world-class Growth Marketing Strategist. Generate a comprehensive Go-to-Market (GTM) strategy in Arabic Markdown.
    Include:
    1. Channel Identification (Which platforms and why?)
    2. Customer Acquisition Cost (CAC) Estimates
    3. Content Pillars & Messaging
    4. Sales Funnel Architecture
    5. Referral & Viral Loops design.`
  });
};

/**
 * 3-Year Financial Forecast Generator (JSON)
 */
export const generateFinancialForecastAI = async (data: { name: string; revenueModel: string; initialCap: string; burnRate: string }) => {
  const prompt = `Business: ${data.name}\nRevenue Model: ${data.revenueModel}\nInitial Capital: ${data.initialCap}\nMonthly Burn Rate: ${data.burnRate}`;
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: `You are a CFO at a top-tier VC firm. Generate a structured 3-year financial projection in Arabic.
      The output must be JSON format.
      - Each year must include revenue, expenses, and netProfit.
      - Include a "strategicAdvice" section for the founder.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          years: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                yearLabel: { type: Type.STRING },
                revenue: { type: Type.NUMBER },
                expenses: { type: Type.NUMBER },
                netProfit: { type: Type.NUMBER }
              }
            }
          },
          strategicAdvice: { type: Type.STRING }
        }
      }
    }
  });

  // Extract text output from GenerateContentResponse via .text property
  return JSON.parse(response.text || "{}");
};

/**
 * Generates a persuasive Investor Pitch Deck Outline.
 */
export const generateInvestorPitchAI = async (data: { name: string; description: string; targetMarket: string; amount: string }) => {
  const prompt = `
    Business Name: ${data.name}
    Business Description: ${data.description}
    Target Market: ${data.targetMarket}
    Investment Amount Requested: ${data.amount}
  `;

  return callGemini({
    model: "gemini-3-pro-preview",
    prompt,
    systemInstruction: `You are a legendary Venture Capital Pitch Coach. Generate a highly persuasive, 10-slide Pitch Deck Outline in Arabic for the following startup.
    Use the Sequoia Capital Pitch Deck Framework. Return the response in clear Markdown with bold headers.`
  });
};

/**
 * Generates a structured Business Plan with specific sections in JSON format.
 */
export const generateStructuredBusinessPlanAI = async (data: { 
  name: string; 
  industry: string;
  problem: string; 
  solution: string; 
  competitors: string;
  vision3yr: string;
}) => {
  const prompt = `
    Business Name: ${data.name}
    Industry: ${data.industry}
    Core Problem: ${data.problem}
    Proposed Solution: ${data.solution}
    Main Competitors: ${data.competitors}
    3-Year Vision: ${data.vision3yr}
  `;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: `You are a World-Class Venture Capital Strategist. Generate a professional, highly-detailed Business Plan in Arabic.
      The response MUST be a structured JSON object containing:
      1. executiveSummary: A high-impact summary for investors.
      2. marketAnalysis: Deep analysis of TAM/SAM/SOM, trends, and competitive landscape.
      3. financialProjections: A detailed 3-year projection.`,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          executiveSummary: { type: Type.STRING },
          marketAnalysis: { type: Type.STRING },
          financialProjections: { type: Type.STRING }
        },
        required: ["executiveSummary", "marketAnalysis", "financialProjections"]
      }
    }
  });

  // Extract text output from GenerateContentResponse via .text property
  return JSON.parse(response.text || "{}");
};

/**
 * Strategic Plan Generator
 */
export const generateStrategicPlanAI = async (data: { name: string; valueProp: string; revenue: string }) => {
  const prompt = `Project: ${data.name}\nValue Prop: ${data.valueProp}\nRevenue Model: ${data.revenue}`;
  return callGemini({
    model: "gemini-3-pro-preview",
    prompt,
    systemInstruction: `You are a Senior Business Strategist. Generate a concise Strategic Plan in Arabic Markdown.
    Include:
    1. Executive Summary
    2. Operational Strategy
    3. Revenue Streams optimization
    4. Key Partnerships needed
    5. 12-month roadmap.`
  });
};

/**
 * Analyzes Startup KPIs and provides strategic feedback and risk assessment.
 */
export const analyzeStartupKPIsAI = async (startup: StartupRecord) => {
  const prompt = `
    Startup Profile: ${startup.name} (${startup.industry})
    Current Track: ${startup.currentTrack}
    KPI History: ${JSON.stringify(startup.kpiHistory)}
    Current Partners: ${startup.partners.length}
  `;

  return callGemini({
    model: "gemini-3-pro-preview",
    prompt,
    systemInstruction: `You are an Elite Venture Capital Analyst. Analyze the following startup KPI data. Return professional evaluation in Markdown Arabic.`,
  });
};

// --- Market Analysis Tools ---

/**
 * Performs Deep Market Scanning and Competitor Intelligence.
 */
export const generateMarketAnalysisAI = async (data: { sector: string; location: string; target: string }) => {
  const prompt = `Sector: ${data.sector}\nGeo-Target: ${data.location}\nCustomer Profile: ${data.target}`;
  return callGemini({
    model: "gemini-3-pro-preview",
    prompt,
    systemInstruction: `Act as a Market Intelligence Analyst. Perform a deep analysis of the current market trends for 2025.
    Include Industry Macro Trends, Competitive Landscape, Barriers to Entry, and Strategic Growth Opportunities.
    Format in Markdown Arabic.`
  });
};

/**
 * Strategic SWOT Analysis Tool.
 */
export const generateSWOTAnalysisAI = async (data: { name: string; description: string }) => {
  const prompt = `Perform a high-level SWOT analysis for the startup: "${data.name}". Context/Description: ${data.description}.`;

  return callGemini({
    model: "gemini-3-pro-preview",
    prompt,
    systemInstruction: "You are a Senior Strategic Consultant. Perform a brutal, honest SWOT analysis in Arabic Markdown. Use structured tables for clarity."
  });
};

// --- Other Utility Tools ---

export const generateStartupIdea = async (form: { sector: string; interest: string }) => {
  const prompt = `Interests: ${form.interest}\nSector: ${form.sector}`;
  return callGemini({ 
    prompt, 
    systemInstruction: "Generate 3 hyper-modern startup ideas. Format in Arabic Markdown." 
  });
};

export const generateFounderCV = async (form: any) => {
  const prompt = `Founder Profile: ${JSON.stringify(form)}`;
  return callGemini({ 
    prompt, 
    systemInstruction: "Write a high-impact Entrepreneurial CV (Executive Profile) in Arabic Markdown." 
  });
};

export const generateProductSpecs = async (form: { projectName: string; description: string }) => {
  const prompt = `Project: ${form.projectName}\nDesc: ${form.description}`;
  return callGemini({ 
    prompt, 
    systemInstruction: "Define MVP Product Specifications and prioritizations. Arabic Markdown." 
  });
};

export const generatePitchDeckOutline = async (form: { startupName: string; problem: string; solution: string }) => {
  const prompt = `Startup: ${form.startupName}\nProblem: ${form.problem}\nSolution: ${form.solution}`;
  return callGemini({
    model: "gemini-3-flash-preview",
    prompt,
    systemInstruction: "Generate a 10-slide Pitch Deck structure based on Venture Capital standards. Arabic Markdown."
  });
};

// --- App Core AI Logic ---

export const getQuickSupportResponseAI = async (message: string) => {
  return callGemini({
    prompt: message,
    systemInstruction: "You are the AI support of 'Business Developers' Accelerator. Be professional, concise, and helpful in Arabic."
  });
};

export const runSmartMatchingAlgorithmAI = async (startup: StartupRecord, partners: PartnerProfile[]): Promise<any> => {
  const prompt = `Startup: ${startup.name}. Industry: ${startup.industry}. Available Partners: ${JSON.stringify(partners.slice(0, 20))}`;
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "Match startups with top 10 potential partners based on role complementarity. Return JSON array.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            partnerUid: { type: Type.STRING },
            name: { type: Type.STRING },
            role: { type: Type.STRING },
            totalScore: { type: Type.NUMBER },
            reason: { type: Type.STRING },
            scores: { 
              type: Type.OBJECT, 
              properties: { 
                roleFit: { type: Type.NUMBER }, 
                experienceFit: { type: Type.NUMBER }, 
                industryFit: { type: Type.NUMBER }, 
                styleFit: { type: Type.NUMBER } 
              } 
            }
          }
        }
      }
    }
  });

  // Extract text output from GenerateContentResponse via .text property
  return JSON.parse(response.text || "[]");
};

export const discoverOpportunities = async (name: string, desc: string, industry: string): Promise<any> => {
  const prompt = `Startup: ${name}, Industry: ${industry}, Description: ${desc}`;
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: "Analyze growth opportunities and 'Blue Ocean' ideas. Return JSON.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          newMarkets: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT, 
              properties: { 
                region: { type: Type.STRING }, 
                reasoning: { type: Type.STRING }, 
                potentialROI: { type: Type.STRING } 
              } 
            } 
          },
          blueOceanIdea: { type: Type.STRING }
        }
      }
    }
  });

  // Extract text output from GenerateContentResponse via .text property
  return JSON.parse(response.text || "{}");
};

export const suggestIconsForLevels = async () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Suggest modern icons and brand colors for 6 accelerator levels.",
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          suggestions: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT, 
              properties: { 
                id: { type: Type.NUMBER }, 
                icon: { type: Type.STRING }, 
                color: { type: Type.STRING } 
              } 
            } 
          }
        }
      }
    }
  });
  // Extract text output from GenerateContentResponse via .text property
  return JSON.parse(response.text || "{}");
};

export const createPathFinderChat = () => {
  // Create a new GoogleGenAI instance for chat setup
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: { 
      systemInstruction: "You are a pathfinding consultant. Ask the user about their goals and project stage. Then provide a hidden JSON decision block (```json {\"decision\": \"APPROVED\"...} ```) when they are qualified for the accelerator." 
    }
  });
};

export const reviewDeliverableAI = async (title: string, desc: string, context: string) => {
  const prompt = `Deliverable: ${title}\nUser Context: ${context}`;
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: "Act as an Investment Review Committee. Review the startup deliverable. Return JSON with readinessScore and criticalFeedback.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          readinessScore: { type: Type.NUMBER },
          criticalFeedback: { type: Type.STRING },
          suggestedNextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
          isReadyForHumanMentor: { type: Type.BOOLEAN }
        }
      }
    }
  });
  // Extract text output from GenerateContentResponse via .text property
  return JSON.parse(response.text || "{}");
};

export const evaluateTemplateAI = async (templateTitle: string, formData: any) => {
  const prompt = `Template: ${templateTitle}\nSubmitted Data: ${JSON.stringify(formData)}`;
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: "Evaluate the strategic quality of the filled business template. Return JSON with score, feedback, and approved boolean.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { 
          score: { type: Type.NUMBER }, 
          feedback: { type: Type.STRING }, 
          approved: { type: Type.BOOLEAN } 
        }
      }
    }
  });
  // Extract text output from GenerateContentResponse via .text property
  return JSON.parse(response.text || "{}");
};

export const generateAnalyticalQuestions = async (profile: ApplicantProfile): Promise<AnalyticalQuestion[]> => {
  const prompt = `Generate 5 analytical multiple-choice questions in Arabic for a startup in the ${profile.sector} sector at the ${profile.projectStage} stage. The founder's challenge is: ${profile.goal}. Return a JSON array.`;
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "Generate exactly 5 analytical multiple-choice questions in Arabic. Return a JSON array.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctIndex: { type: Type.INTEGER },
            difficulty: { type: Type.STRING }
          }
        }
      }
    }
  });

  // Extract text output from GenerateContentResponse via .text property
  return JSON.parse(response.text || "[]");
};

export const evaluateProjectIdea = async (text: string, profile: any): Promise<ProjectEvaluationResult> => {
  const prompt = `Evaluate Idea: ${text}\nFounder Profile: ${JSON.stringify(profile)}`;
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      systemInstruction: "Perform a deep SWOT and feasibility analysis. Return JSON ProjectEvaluationResult.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          totalScore: { type: Type.NUMBER }, 
          classification: { type: Type.STRING }, 
          clarity: { type: Type.NUMBER }, 
          value: { type: Type.NUMBER }, 
          innovation: { type: Type.NUMBER }, 
          market: { type: Type.NUMBER }, 
          readiness: { type: Type.NUMBER }, 
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } }, 
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } }, 
          aiOpinion: { type: Type.STRING }
        }
      }
    }
  });
  // Extract text output from GenerateContentResponse via .text property
  return JSON.parse(response.text || "{}");
};

export const evaluateNominationForm = async (data: any): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Nomination Form: ${JSON.stringify(data)}`,
    config: {
      systemInstruction: "Screen nomination for accelerator entry. Return JSON with aiScore, redFlags, and aiAnalysis.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { 
          aiScore: { type: Type.NUMBER }, 
          redFlags: { type: Type.ARRAY, items: { type: Type.STRING } }, 
          aiAnalysis: { type: Type.STRING } 
        }
      }
    }
  });
  // Extract text output from GenerateContentResponse via .text property
  return JSON.parse(response.text || "{}");
};

export const runProjectAgents = async (projectName: string, description: string, agents: string[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Simulate Project: ${projectName}. Agents Active: ${agents.join(',')}. Project Description: ${description}`,
    config: {
      systemInstruction: "Simulate a multi-agent strategy session. Return JSON with vision, market, users, and hypotheses.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { 
          vision: { type: Type.STRING }, 
          market: { type: Type.STRING }, 
          users: { type: Type.STRING }, 
          hypotheses: { type: Type.ARRAY, items: { type: Type.STRING } } 
        }
      }
    }
  });
  // Extract text output from GenerateContentResponse via .text property
  return JSON.parse(response.text || "{}");
};

export const generatePitchDeck = async (projectName: string, description: string, context: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Project: ${projectName}. Context: ${JSON.stringify(context)}`,
    config: {
      systemInstruction: "Generate a 10-slide high-stakes pitch deck. Return JSON array of objects with title and content.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { 
          type: Type.OBJECT, 
          properties: { 
            title: { type: Type.STRING }, 
            content: { type: Type.STRING } 
          } 
        }
      }
    }
  });
  // Extract text output from GenerateContentResponse via .text property
  return JSON.parse(response.text || "[]");
};

export const analyzeExportOpportunity = async (data: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Export Data: ${JSON.stringify(data)}`,
    config: {
      systemInstruction: "Analyze international export potential. Return JSON decision and analysis breakdown.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { 
          decision: { type: Type.STRING }, 
          analysis: { 
            type: Type.OBJECT, 
            properties: { 
              demand: { type: Type.STRING }, 
              regulations: { type: Type.STRING }, 
              risks: { type: Type.STRING }, 
              seasonality: { type: Type.STRING } 
            } 
          }, 
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } } 
        }
      }
    }
  });
  // Extract text output from GenerateContentResponse via .text property
  return JSON.parse(response.text || "{}");
};

export const simulateBrutalTruth = async (data: any): Promise<FailureSimulation> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Idea: ${JSON.stringify(data)}`,
    config: {
      systemInstruction: "Provide the brutal reality of startup failure for this specific idea. Return JSON FailureSimulation.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { 
          brutalTruth: { type: Type.STRING }, 
          probability: { type: Type.NUMBER }, 
          financialLoss: { type: Type.STRING }, 
          operationalImpact: { type: Type.STRING }, 
          missingQuestions: { type: Type.ARRAY, items: { type: Type.STRING } }, 
          recoveryPlan: { type: Type.ARRAY, items: { type: Type.STRING } } 
        }
      }
    }
  });
  // Extract text output from GenerateContentResponse via .text property
  return JSON.parse(response.text || "{}");
};

export const getGovInsights = async (): Promise<GovStats> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: "Analyze national ecosystem trends.",
    config: {
      systemInstruction: "Generate macro insights for government planners. Return JSON GovStats.",
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: { 
          riskyMarkets: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT, 
              properties: { 
                name: { type: Type.STRING }, 
                failRate: { type: Type.NUMBER } 
              } 
            } 
          }, 
          readySectors: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT, 
              properties: { 
                name: { type: Type.STRING }, 
                score: { type: Type.NUMBER } 
              } 
            } 
          }, 
          commonFailReasons: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT, 
              properties: { 
                reason: { type: Type.STRING }, 
                percentage: { type: Type.NUMBER } 
              } 
            } 
          }, 
          regulatoryGaps: { type: Type.ARRAY, items: { type: Type.STRING } } 
        }
      }
    }
  });
  // Extract text output from GenerateContentResponse via .text property
  return JSON.parse(response.text || "{}");
};

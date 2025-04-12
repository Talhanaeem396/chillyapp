export default {
  async fetch(request, env, ctx) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method === "POST") {
      try {
        const data = await request.json();
        validateInput(data);
        
        const scriptContent = generateScript(data);
        const formattedResponse = formatScriptResponse(scriptContent);

        return new Response(JSON.stringify({
          success: true,
          script: formattedResponse
        }), {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      } catch (error) {
        console.error('Error generating script:', error);
        return new Response(JSON.stringify({
          success: false,
          error: error.message
        }), {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      }
    }

    if (request.method === "GET") {
      return new Response(JSON.stringify({
        status: "healthy",
        message: "Chilly Script Generator is running",
        version: "1.0.0"
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    return new Response("Method not allowed", {
      status: 405,
      headers: {
        ...corsHeaders,
        "Allow": "GET, POST, OPTIONS",
        "Content-Type": "text/plain"
      }
    });
  }
};

function validateInput(data) {
  const requiredFields = [
    'callerName',
    'callerTitle',
    'callerCompany',
    'prospectName',
    'prospectTitle',
    'prospectCompany',
    'industry',
    'tone',
    'painPoint'
  ];

  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
    if (typeof data[field] !== 'string') {
      throw new Error(`Invalid type for field: ${field}`);
    }
    data[field] = sanitizeInput(data[field]);
  }

  const validTones = ['friendly', 'direct', 'consultative', 'professional'];
  if (!validTones.includes(data.tone)) {
    throw new Error('Invalid tone specified');
  }

  const validIndustries = ['retail', 'technology', 'healthcare', 'finance', 'manufacturing', 'education'];
  if (!validIndustries.includes(data.industry.toLowerCase())) {
    throw new Error('Invalid industry specified');
  }
}

function sanitizeInput(str) {
  return str.trim()
    .replace(/[<>]/g, '')
    .replace(/['"]/g, '')
    .substring(0, 500);
}

function formatScriptResponse(scriptContent) {
  const formatted = {
    fullScript: '',
    sections: scriptContent
  };

  formatted.fullScript = `${scriptContent.introduction.opener}

${scriptContent.introduction.valueProposition}

Engagement Questions:
${scriptContent.engagementQuestions.join('\n')}

Pain Point Discussion:
${scriptContent.painPointDiscussion.opener}
${scriptContent.painPointDiscussion.questions.join('\n')}

Value Proposition:
${scriptContent.valueProposition.statement}
${scriptContent.valueProposition.benefit}

Next Steps:
${scriptContent.nextSteps.proposal}
${scriptContent.nextSteps.callToAction}

${scriptContent.closing}`;

  return formatted;
}
function generateScript(data) {
  const {
    callerName,
    callerTitle,
    callerCompany,
    prospectName,
    prospectTitle,
    prospectCompany,
    industry,
    tone,
    painPoint
  } = data;

  const formattedIndustry = industry.charAt(0).toUpperCase() + industry.slice(1);
  const formattedPainPoint = painPoint.replace(/_/g, ' ').toLowerCase();
  const toneVariants = getToneVariants(tone);

  return {
    introduction: {
      opener: generateOpener(prospectName, callerName, callerTitle, callerCompany, tone),
      valueProposition: generateValueProposition(industry, painPoint, tone)
    },
    engagementQuestions: generateEngagementQuestions(industry, painPoint, prospectTitle),
    painPointDiscussion: {
      opener: generatePainPointOpener(formattedPainPoint, industry, tone),
      questions: generatePainPointQuestions(painPoint, industry)
    },
    valueProposition: {
      statement: generateValueStatement(callerCompany, formattedPainPoint, industry),
      benefit: generateBenefitStatement(painPoint, industry)
    },
    responses: {
      positive: toneVariants.positiveResponse,
      neutral: toneVariants.neutralResponse,
      negative: toneVariants.negativeResponse
    },
    nextSteps: {
      proposal: generateNextStepsProposal(tone),
      callToAction: generateCallToAction(tone)
    },
    closing: generateClosing(prospectName, callerName, tone)
  };
}

function getToneVariants(tone) {
  const toneMap = {
    friendly: {
      positiveResponse: "That's fantastic! I'd love to schedule a quick 30-minute chat to explore how we can help.",
      neutralResponse: "I understand you need time to consider this. Would it be helpful if I shared some relevant information?",
      negativeResponse: "No problem at all! Would it be alright if I checked in with you in a few months?"
    },
    direct: {
      positiveResponse: "Excellent. Let's schedule a 30-minute call to discuss specifics.",
      neutralResponse: "Understood. What specific information would help you make a decision?",
      negativeResponse: "I appreciate your directness. When would be a better time to revisit?"
    },
    consultative: {
      positiveResponse: "Based on what you've shared, I see significant potential value. Shall we schedule a detailed discussion?",
      neutralResponse: "What additional information would help you evaluate this opportunity?",
      negativeResponse: "I understand. Would you be interested in receiving some relevant case studies?"
    },
    professional: {
      positiveResponse: "Thank you for your interest. I'll send a calendar invite for a detailed discussion.",
      neutralResponse: "I understand you need time. Which aspects would you like me to clarify?",
      negativeResponse: "Thank you for your time. Would you prefer a follow-up at a later date?"
    }
  };

  return toneMap[tone] || toneMap.professional;
}

function generateOpener(prospectName, callerName, callerTitle, callerCompany, tone) {
  const openers = {
    friendly: `Hi ${prospectName}! This is ${callerName} from ${callerCompany}. I hope you're having a great day!`,
    direct: `Hello ${prospectName}, this is ${callerName}, ${callerTitle} at ${callerCompany}.`,
    consultative: `Hello ${prospectName}, this is ${callerName} from ${callerCompany}. I hope this is a good time.`,
    professional: `Good day ${prospectName}, my name is ${callerName}, ${callerTitle} with ${callerCompany}.`
  };

  return openers[tone] || openers.professional;
}

function generateValueProposition(industry, painPoint, tone) {
  const industryPainPoints = {
    retail: {
      efficiency: "improving operational efficiency in retail operations",
      costs: "reducing operational costs while maintaining quality",
      growth: "scaling retail operations sustainably",
      competition: "staying competitive in the retail market",
      technology: "modernizing retail technology infrastructure"
    },
    finance: {
      efficiency: "streamlining financial operations",
      costs: "optimizing operational costs",
      growth: "scaling financial operations",
      compliance: "ensuring regulatory compliance",
      security: "enhancing financial security measures"
    },
    technology: {
      innovation: "accelerating innovation cycles",
      scalability: "improving system scalability",
      security: "enhancing cybersecurity measures",
      integration: "streamlining system integration",
      efficiency: "optimizing technical operations"
    }
  };

  const painPointValue = industryPainPoints[industry]?.[painPoint] || 
    `addressing ${painPoint} challenges in the ${industry} sector`;

  return `I'm reaching out because we specialize in ${painPointValue}.`;
}

function generateEngagementQuestions(industry, painPoint, prospectTitle) {
  return [
    `How is your team currently handling ${painPoint} challenges?`,
    `What's your top priority as ${prospectTitle} regarding ${painPoint}?`,
    `What solutions have you implemented so far?`,
    `How does this impact your ${industry} operations?`
  ];
}

function generatePainPointOpener(painPoint, industry, tone) {
  return `Many ${industry} leaders we work with have identified ${painPoint} as a critical challenge.`;
}

function generatePainPointQuestions(painPoint, industry) {
  return [
    `How much time and resources does your team currently dedicate to ${painPoint}?`,
    `What impact does ${painPoint} have on your business outcomes?`,
    `How does this affect your market position in the ${industry} space?`,
    `What would successfully addressing this challenge mean for your organization?`
  ];
}

function generateValueStatement(company, painPoint, industry) {
  return `${company} has successfully helped numerous ${industry} organizations overcome ${painPoint} challenges.`;
}

function generateBenefitStatement(painPoint, industry) {
  return `Our clients in the ${industry} sector typically see significant improvements in their ${painPoint} metrics within 90 days.`;
}

function generateNextStepsProposal(tone) {
  const proposals = {
    friendly: "I'd love to show you how we can help with this!",
    direct: "Let's schedule a detailed discussion about your specific needs.",
    consultative: "Based on what you've shared, I believe we should explore this further.",
    professional: "I would value the opportunity to discuss this in more detail."
  };

  return proposals[tone] || proposals.professional;
}

function generateCallToAction(tone) {
  const ctas = {
    friendly: "Would you be open to a quick 30-minute chat this week?",
    direct: "Can we schedule a 30-minute call to discuss this further?",
    consultative: "Shall we arrange a consultation to explore these opportunities?",
    professional: "Would you be available for a brief meeting to discuss this in detail?"
  };

  return ctas[tone] || ctas.professional;
}

function generateClosing(prospectName, callerName, tone) {
  const closings = {
    friendly: `Thanks so much for your time, ${prospectName}! Looking forward to our conversation!`,
    direct: `Thank you for your time, ${prospectName}.`,
    consultative: `I appreciate your time today, ${prospectName}. Looking forward to our next discussion.`,
    professional: `Thank you for your consideration, ${prospectName}. I look forward to speaking with you soon.`
  };

  return closings[tone] || closings.professional;
}


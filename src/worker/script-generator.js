// src/script-generator.js

export default {
  async fetch(request, env, ctx) {
    // Set CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // Handle CORS preflight requests
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    // Handle POST request
    if (request.method === "POST") {
      try {
        const data = await request.json();
        validateInput(data);
        
        // Generate script content
        const scriptContent = generateScript(data);

        // Return the response
        return new Response(JSON.stringify({
          success: true,
          script: scriptContent
        }), {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        });
      } catch (error) {
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

    // Handle GET request (health check)
    if (request.method === "GET") {
      return new Response(JSON.stringify({
        status: "healthy",
        message: "Chilly Script Generator is running"
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }

    // Handle unsupported methods
    return new Response("Method not allowed", {
      status: 405,
      headers: {
        ...corsHeaders,
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
  }
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
    painPoint,
    currentSolution
  } = data;

  // Format inputs for better readability
  const formattedIndustry = industry.charAt(0).toUpperCase() + industry.slice(1);
  const formattedPainPoint = painPoint.replace(/_/g, ' ').toLowerCase();

  // Get tone-specific phrases
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
      positiveResponse: "That's great to hear! I'd love to schedule a quick 30-minute chat to dive deeper into how we can help.",
      neutralResponse: "I completely understand you need time to think about it. Would it be helpful if I sent you some information to review?",
      negativeResponse: "No problem at all! Would it be okay if I reached out in a few months to check in?"
    },
    direct: {
      positiveResponse: "Excellent. Let's schedule a 30-minute call to discuss the specifics.",
      neutralResponse: "I understand. What specific information would help you make a decision?",
      negativeResponse: "I appreciate your directness. When would be a better time to revisit this conversation?"
    },
    consultative: {
      positiveResponse: "Based on what you've shared, I believe we can add significant value. Shall we schedule a detailed discussion?",
      neutralResponse: "What additional information would help you evaluate this opportunity better?",
      negativeResponse: "I understand. Would you be open to receiving some case studies relevant to your situation?"
    },
    professional: {
      positiveResponse: "Thank you for your interest. I'll send over a calendar invite for us to discuss this in detail.",
      neutralResponse: "I understand you need time to consider. What aspects would you like me to clarify?",
      negativeResponse: "Thank you for your time. Would you prefer if I followed up at a later date?"
    }
  };

  return toneMap[tone] || toneMap.professional;
}

function generateOpener(prospectName, callerName, callerTitle, callerCompany, tone) {
  const openers = {
    friendly: `Hi ${prospectName}! This is ${callerName} from ${callerCompany}. Hope you're having a great day!`,
    direct: `Hello ${prospectName}, this is ${callerName}, ${callerTitle} at ${callerCompany}.`,
    consultative: `Hello ${prospectName}, this is ${callerName} from ${callerCompany}. I hope I caught you at a good time.`,
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
      competition: "staying ahead in a competitive retail market",
      technology: "modernizing retail technology infrastructure",
      security: "ensuring secure retail transactions and data protection"
    },
    fintech: {
      efficiency: "streamlining financial operations",
      costs: "optimizing operational costs in fintech",
      growth: "scaling fintech solutions",
      competition: "maintaining competitive advantage in fintech",
      technology: "implementing cutting-edge financial technology",
      security: "ensuring robust financial security measures"
    }
    // Add more industries as needed
  };

  const painPointValue = industryPainPoints[industry]?.[painPoint] || 
    `addressing ${painPoint} challenges in the ${industry} sector`;

  return `I'm reaching out because we specialize in ${painPointValue}.`;
}

function generateEngagementQuestions(industry, painPoint, prospectTitle) {
  return [
    `How is your team currently handling ${painPoint} challenges?`,
    `What's your biggest priority as ${prospectTitle} when it comes to ${painPoint}?`,
    `What solutions have you tried in the past?`,
    `How does this impact your ${industry} operations?`
  ];
}

function generatePainPointOpener(painPoint, industry, tone) {
  return `Many ${industry} leaders we work with have mentioned that ${painPoint} is a significant challenge.`;
}

function generatePainPointQuestions(painPoint, industry) {
  return [
    `How much time does your team currently spend on ${painPoint}?`,
    `What's the impact of ${painPoint} on your business outcomes?`,
    `How does this affect your competitive position in the ${industry} space?`,
    `What would solving this challenge mean for your organization?`
  ];
}

function generateValueStatement(company, painPoint, industry) {
  return `${company} has helped numerous ${industry} organizations overcome ${painPoint} challenges.`;
}

function generateBenefitStatement(painPoint, industry) {
  return `Our clients in the ${industry} sector have seen significant improvements in their ${painPoint} metrics within the first few months.`;
}

function generateNextStepsProposal(tone) {
  const proposals = {
    friendly: "I'd love to show you how we can help with this!",
    direct: "Let's schedule a detailed discussion about your specific needs.",
    consultative: "Based on what you've shared, I believe we should explore this further.",
    professional: "I would appreciate the opportunity to discuss this in more detail."
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
    friendly: `Thanks for your time, ${prospectName}! Looking forward to our conversation!`,
    direct: `Thank you for your time, ${prospectName}.`,
    consultative: `I appreciate your time today, ${prospectName}. I look forward to our next discussion.`,
    professional: `Thank you for your consideration, ${prospectName}. I look forward to speaking with you soon.`
  };

  return closings[tone] || closings.professional;
}

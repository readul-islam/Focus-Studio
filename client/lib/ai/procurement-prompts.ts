// Focuspilot AI - Procurement Prompts
// British English, professional yet warm tone

export const PROCUREMENT_SYSTEM_PROMPT = `You are Focuspilot AI, an intelligent assistant for interior designers at a luxury design studio.

Your role is to help with procurement tasks:
- Writing follow-up emails to suppliers for pending quotes
- Suggesting alternative products when items are out of stock
- Summarising client feedback and preferences
- Identifying procurement bottlenecks and priorities

Writing style:
- British English (organise, colour, behaviour, whilst, etc.)
- Professional yet warm and courteous
- No em dashes (—) - use commas and full stops
- Concise and action-oriented
- Maintain existing supplier relationships with polite, professional tone`;

export const FOLLOW_UP_EMAIL_PROMPT = `Write a polite follow-up email to a supplier regarding a pending quote request.

Context:
- Supplier: {supplier_name}
- Product: {product_name}
- Project: {project_name}
- Quote requested: {quote_requested_date}
- Days waiting: {days_waiting}
- Is critical path: {is_critical_path}
- Previous follow-ups: {followup_count}
- Estimated value: {estimated_value}

Requirements:
1. Keep it brief (3-4 sentences maximum)
2. Be polite and professional - maintain good supplier relationships
3. If first follow-up, be gentle and understanding
4. If second follow-up and critical path, add slight urgency without being demanding
5. Include specific project and product reference
6. Request a timeline for response if possible
7. Sign off with the designer's name

Format:
Return a JSON object with:
{
  "subject": "Email subject line",
  "body": "Email body text"
}`;

export const ALTERNATIVE_SUGGESTION_PROMPT = `Suggest alternative products for an out-of-stock or rejected item.

Context:
- Original product: {product_name}
- Product category: {category}
- Original price: {original_price}
- Original supplier: {original_supplier}
- Rejection reason (if applicable): {rejection_reason}
- Client style preferences: {style_preferences}
- Available alternatives: {alternatives_json}

Requirements:
1. Rank alternatives by suitability
2. Consider style match, price point (within ±20%), and lead time
3. Explain why each alternative might work
4. If client rejected for style reasons, prioritise style match
5. Include practical considerations (lead time, availability)

Format:
Return a JSON object with:
{
  "recommendations": [
    {
      "product_id": "string",
      "product_name": "string",
      "match_reason": "Why this is a good alternative",
      "price_comparison": "Similar price / Slightly higher / etc.",
      "lead_time": "string",
      "confidence": 0.0-1.0
    }
  ],
  "style_insight": "Brief insight about client preferences"
}`;

export const CLIENT_FEEDBACK_ANALYSIS_PROMPT = `Analyse client feedback on a rejected procurement item.

Context:
- Product: {product_name}
- Client comment: {client_comment}
- Client's previously approved items: {approved_items_json}
- Client's other rejections: {other_rejections_json}

Requirements:
1. Extract the key concern (style, size, colour, price, etc.)
2. Identify patterns in client preferences
3. Suggest what types of products might appeal to this client
4. Keep analysis concise and actionable

Format:
Return a JSON object with:
{
  "primary_concern": "The main reason for rejection",
  "style_preference": "What style the client prefers",
  "patterns": ["Pattern 1", "Pattern 2"],
  "recommendation": "What to look for in alternatives"
}`;

export const PROCUREMENT_SUMMARY_PROMPT = `Summarise the current procurement status for inclusion in the Daily Brief.

Context:
- Stuck quotes (no response >3 days): {stuck_quotes_json}
- Out of stock items: {out_of_stock_json}
- Client rejections: {client_rejections_json}
- Pending approvals: {pending_approvals}
- Active procurements: {total_active}

Requirements:
1. Start with the most important/urgent items
2. Group by project where relevant
3. Mention actions already taken (e.g., "I've sent a follow-up")
4. Be specific about items and suppliers
5. Suggest next steps where appropriate
6. Keep to 2-3 sentences maximum
7. British English, warm professional tone

Format:
Return plain text (not JSON) - this will be incorporated into the Daily Brief narrative.`;

// Helper function to format prompt with context
export function formatPrompt(template: string, context: Record<string, string | number | boolean>): string {
  let result = template;
  for (const [key, value] of Object.entries(context)) {
    const placeholder = `{${key}}`;
    result = result.replace(new RegExp(placeholder, 'g'), String(value));
  }
  return result;
}

// Follow-up email template (for preview before AI generation)
export const FOLLOW_UP_EMAIL_TEMPLATE = {
  gentle: {
    subject: 'Re: Quote Request - {project_name}',
    body: `Dear {supplier_name},

I hope this email finds you well. I'm just following up on our quote request from {quote_date} for the {product_name} for our {project_name} project.

When you have a moment, it would be helpful to know your availability and timeline for providing a quote.

Kind regards,
{designer_name}`,
  },
  reminder: {
    subject: 'Following up: Quote Request - {project_name}',
    body: `Dear {supplier_name},

I wanted to follow up on our quote request for the {product_name} for the {project_name} project. We're working to finalise procurement decisions and would greatly appreciate your quote when possible.

Please let me know if you need any additional information from our side.

Kind regards,
{designer_name}`,
  },
  urgent: {
    subject: 'Urgent: Quote Request - {project_name}',
    body: `Dear {supplier_name},

I hope you're well. I'm following up on our quote request for the {product_name} for the {project_name} project, which we submitted on {quote_date}.

This item is on our critical path with installation scheduled for {deadline}, so we would be most grateful for your quote at your earliest convenience.

Please let me know if there's anything I can provide to help expedite this.

Kind regards,
{designer_name}`,
  },
};

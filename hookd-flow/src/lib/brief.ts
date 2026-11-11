// Template-based brief helper: plain string templates and simple rules. No AI, no network.
// To add a real AI later, replace generateBrief() with an async call that returns the same Brief shape.
export interface BriefInput { businessName: string; industry: string; audience: string; goals: string; pillar: string }
export interface Brief { hook: string; outline: string[]; cta: string }

const PILLARS: { match: RegExp; hook: string; outline: string[]; cta: string }[] = [
  { match: /educat|tip|how|guide|learn/i, hook: 'Most {audience} get {topic} wrong. Here is the fix.', outline: ['State the common mistake in one sentence', 'Show 3 simple steps to do it right', 'Give one quick example from {industry}', 'Recap the key takeaway'], cta: 'Save this for later and send it to someone who needs it.' },
  { match: /proof|testimonial|result|case|review/i, hook: 'How {business} helped a customer move toward: {goal}.', outline: ['Describe the starting situation', 'Explain what was done, step by step', 'Share the outcome (use only real, approved results)', 'Quote or paraphrase the customer'], cta: 'Message us to talk about your own goals.' },
  { match: /behind|story|team|culture|process/i, hook: 'A look behind the scenes at {business}.', outline: ['Open with a real moment from the workday', 'Show the process or the people', 'Explain why it matters to {audience}', 'End with what is coming next'], cta: 'Follow along for more behind-the-scenes updates.' },
  { match: /promo|offer|launch|sale|product|service/i, hook: 'New for {audience}: a simpler way to {goal}.', outline: ['Name the problem {audience} face', 'Introduce the offer in one sentence', 'List 2-3 clear benefits', 'State any deadline or limit honestly'], cta: 'Tap the link to learn more or book a call.' },
  { match: /engage|community|poll|question|ugc/i, hook: 'Quick question for {audience}: what is your biggest challenge in {industry}?', outline: ['Ask one simple, specific question', 'Share your own answer first', 'Invite replies in the comments', 'Plan a follow-up post using the replies'], cta: 'Tell us in the comments below.' }
];
const FALLBACK = { hook: 'What {audience} should know about {topic}.', outline: ['Open with the main idea', 'Add 2-3 supporting points', 'Give a concrete example from {industry}', 'Close with the key takeaway'], cta: 'Follow for more, or send us a message.' };

export function generateBrief(input: BriefInput): Brief {
  const firstGoal = input.goals.split(/[.\n;]/)[0].trim().replace(/^to\s+/i, '');
  const vars: Record<string, string> = {
    business: input.businessName.trim() || 'your business',
    industry: input.industry.trim() || 'your industry',
    audience: input.audience.trim() || 'your audience',
    goal: firstGoal || 'reach your goals',
    topic: input.pillar.trim() || input.industry.trim() || 'your topic'
  };
  const fill = (s: string) => s.replace(/\{(\w+)\}/g, (_, k: string) => vars[k] ?? '');
  const t = PILLARS.find((p) => p.match.test(input.pillar)) ?? FALLBACK;
  return { hook: fill(t.hook), outline: t.outline.map(fill), cta: fill(t.cta) };
}

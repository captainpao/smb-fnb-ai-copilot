import { Insight } from '../types'

export const mockInsights: Insight[] = [
  {
    id: 'i1',
    title: 'Delay Sheng Siong payment by 5 days',
    description: 'Moving your $1,200 supplier payment to Jan 26 avoids the projected shortfall.',
    reasoning: 'Based on your last 3 months of transactions, Sheng Siong has accepted late payments twice before with no penalty. Your cash gap opens Jan 21–22.',
    impact: 1200,
    confidence: 'high',
    status: 'pending',
  },
  {
    id: 'i2',
    title: 'Apply for $3,000 short-term credit line',
    description: 'A revolving credit line bridges the 2-day shortfall with minimal interest cost (~$18).',
    reasoning: 'Your average daily sales of $3,000 and consistent payroll history make you eligible for express business credit. Projected interest over 2 days: $18.',
    impact: 3000,
    confidence: 'medium',
    status: 'pending',
  },
  {
    id: 'i3',
    title: 'Reduce weekend ingredient order by 20%',
    description: 'Last 3 Sundays showed 18% lower footfall. Reducing order saves ~$240 this week.',
    reasoning: 'Comparing your Sunday POS receipts against ingredient purchases shows a consistent over-order pattern on weekends.',
    impact: 240,
    confidence: 'medium',
    status: 'pending',
  },
  {
    id: 'i4',
    title: 'Collect outstanding $650 from catering client',
    description: 'Invoice #INV-2024-009 is 12 days overdue. Collecting now directly improves your Jan 21 balance.',
    reasoning: 'This client has paid within 3 days of follow-up in past months.',
    impact: 650,
    confidence: 'high',
    status: 'pending',
  },
]

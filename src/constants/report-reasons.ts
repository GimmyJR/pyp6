export type FaqType = 'mcq' | 'textarea';

export interface FaqQuestion {
  id: string;
  question: string;
  type: FaqType;
  options?: string[]; // Only for MCQ type
}

// Map each reason to its corresponding FAQ questions
export const reasonFaqs: Record<string, FaqQuestion[]> = {
  'Inappropriate Image': [
    {
      id: 'inappropriate_reason',
      question: 'Why is this image inappropriate?',
      type: 'mcq',
      options: [
        'Irrelevant or spammy',
        'Offensive or abusive',
        'Low-quality or blurry',
        'Other',
      ],
    },
    {
      id: 'inappropriate_details',
      question: 'Please provide more details about the issue',
      type: 'textarea',
    },
  ],
  'Offensive Behavior or Content': [
    {
      id: 'offensive_type',
      question: 'What type of offensive content is this?',
      type: 'mcq',
      options: [
        'Harassment or bullying',
        'Hate speech or symbols',
        'Discriminatory content',
        'Other',
      ],
    },
    {
      id: 'offensive_details',
      question: 'Please describe the offensive content or behavior',
      type: 'textarea',
    },
  ],
  'Violence or Graphic Content': [
    {
      id: 'violence_type',
      question: 'What type of violent or graphic content is this?',
      type: 'mcq',
      options: [
        'Physical violence',
        'Graphic imagery',
        'Threats',
        'Animal cruelty',
        'Other',
      ],
    },
    {
      id: 'violence_details',
      question: 'Please provide more details about the content',
      type: 'textarea',
    },
  ],
  'Sexual Content or Nudity': [
    {
      id: 'sexual_type',
      question: 'What type of sexual content is this?',
      type: 'mcq',
      options: ['Nudity', 'Explicit content', 'Suggestive content', 'Other'],
    },
    {
      id: 'sexual_details',
      question: 'Please provide more details about the content',
      type: 'textarea',
    },
  ],
  'Misleading or Fake Image': [
    {
      id: 'misleading_type',
      question: 'Why do you think this image is misleading or fake?',
      type: 'mcq',
      options: [
        'Manipulated or edited',
        'False context',
        'Misleading caption',
        'Other',
      ],
    },
    {
      id: 'misleading_details',
      question: 'Please explain why this image is misleading',
      type: 'textarea',
    },
  ],
  'Voting Manipulation': [
    {
      id: 'voting_issue',
      question: 'What issue do you suspect with the voting?',
      type: 'mcq',
      options: [
        'Fake votes or bots',
        'Coordinated voting',
        'Suspicious vote patterns',
        'Other',
      ],
    },
    {
      id: 'voting_details',
      question: 'Please provide details about the voting issue',
      type: 'textarea',
    },
  ],
  Other: [],
};

export const ReportReasons = Object.keys(reasonFaqs);

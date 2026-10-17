/**
 * Practical questions for Muslim students who study abroad. These are things to ASK or CHECK
 * with each university. They are not claims about what any university provides, and they are
 * not religious rulings. Where a question needs a religious answer, the student should ask a
 * qualified scholar they trust.
 */
export type StudentLifeItem = {
  id: string;
  topic: string;
  question: string;
  whereToCheck: string;
};

export const STUDENT_LIFE_ITEMS: StudentLifeItem[] = [
  {
    id: 'prayer-space',
    topic: 'Prayer space',
    question: 'Is there a dedicated prayer room, and is it open during the hours you will be on campus?',
    whereToCheck: 'Campus facilities or chaplaincy page; ask the student services office.',
  },
  {
    id: 'friday-prayer',
    topic: 'Friday prayer (Jumu’ah)',
    question: 'Is Friday prayer held on or near campus, and how far is it from the student housing?',
    whereToCheck: 'Muslim Students’ Association pages, local mosque listings, or the chaplaincy.',
  },
  {
    id: 'food',
    topic: 'Halal food',
    question: 'Do the dining halls and meal plans offer halal-certified or clearly labelled options?',
    whereToCheck: 'Dining services pages and the meal-plan description.',
  },
  {
    id: 'ramadan',
    topic: 'Ramadan',
    question: 'What are the dining hours, library hours and exam timetable during Ramadan?',
    whereToCheck: 'Academic calendar, dining services, and any Ramadan support the student union publishes.',
  },
  {
    id: 'holidays',
    topic: 'Eid and public holidays',
    question: 'Which religious holidays are campus holidays, and how are requests to attend religious observance handled?',
    whereToCheck: 'Academic calendar and the student-handbook policy on religious observance.',
  },
  {
    id: 'housing',
    topic: 'Housing',
    question: 'Can you request single-room or gender-separated housing, and can you be placed near a mosque or prayer space?',
    whereToCheck: 'Accommodation pages and the housing application form.',
  },
  {
    id: 'community',
    topic: 'Community',
    question: 'Is there an active Muslim Students’ Association, and is there a Muslim chaplain or Islamic studies programme?',
    whereToCheck: 'Student-life or clubs directory; chaplaincy pages.',
  },
  {
    id: 'finance',
    topic: 'Interest-bearing finance',
    question: 'Which funding routes avoid interest-bearing loans, and are interest-free payment plans offered?',
    whereToCheck: 'Financial aid pages. Use the matcher’s “avoid interest-bearing loans” option. For what is permissible for you, ask a qualified scholar.',
  },
  {
    id: 'visa',
    topic: 'Visa and travel',
    question: 'What are the student visa rules, required documents and processing times for the destination country?',
    whereToCheck: 'The destination government’s official visa website and the university’s international office.',
  },
  {
    id: 'health',
    topic: 'Health cover',
    question: 'Is health insurance compulsory, what does it cover, and what does it cost per year?',
    whereToCheck: 'The university’s international health-insurance page.',
  },
];

export const STUDENT_LIFE_DISCLAIMER =
  'This checklist lists questions to ask. It does not say what any university provides, and it is not a religious ruling.';

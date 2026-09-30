const fs = require('fs');
const path = require('path');

const blueprint = {
  id: 'icai-ca-foundation-syllabus-may2026-onwards',
  version: '2026.1-May-2026-Onwards',
  title: 'ICAI CA Foundation Comprehensive Syllabus Blueprint (May 2026 & Onwards)',
  academicBody: 'The Institute of Chartered Accountants of India (ICAI)',
  scheme: 'New Scheme of Education and Training (May 2026, Sept 2026, Jan 2027, May 2027)',
  lastUpdated: '2026-09-30',
  totalPapers: 4,
  totalMarks: 400,
  passingCriteria: {
    individualPaperMinPercentage: 40,
    individualPaperMinMarks: 40,
    aggregateMinPercentage: 50,
    aggregateMinMarks: 200,
    negativeMarking: {
      paper1: 0,
      paper2: 0,
      paper3: 0.25,
      paper4: 0.25
    },
    paperTypes: {
      paper1: 'Subjective / Descriptive (100 Marks)',
      paper2: 'Subjective / Descriptive (100 Marks)',
      paper3: 'Objective / MCQ (100 Marks)',
      paper4: 'Objective / MCQ (100 Marks)'
    }
  },
  subjects: [
    {
      id: 'paper-1-accounting',
      paperNumber: 1,
      code: 'ACC',
      title: 'Accounting',
      shortTitle: 'Accounting',
      type: 'Descriptive',
      totalMarks: 100,
      estimatedStudyHours: 140,
      color: {
        light: '#10B981',
        dark: '#34D399',
        theme: 'emerald'
      },
      description: 'To develop an understanding of the basic concepts and principles of accounting and acquire the ability to apply the same in preparing financial statements, computing accounting ratios, and solving accounting problems.',
      chapters: [
        {
          id: 'acc-ch-01',
          chapterNumber: 1,
          title: 'Theoretical Framework',
          hasSubunits: true,
          icaiWeightage: {
            minPercentage: 5,
            maxPercentage: 10,
            typicalMarks: '5-10 Marks'
          },
          estimatedStudyHours: 12,
          difficulty: 'Medium',
          importance: 'High',
          description: 'Foundational concepts, accounting principles, conventions, terminology, policies, and accounting standards overview.',
          topics: [
            {
              id: 'acc-top-0101',
              topicNumber: 1,
              unitNumber: 1,
              isUnit: true,
              title: 'Unit 1: Meaning and Scope of Accounting',
              estimatedMinutes: 60,
              learningObjectives: [
                'Understand bookkeeping vs accounting vs accountancy',
                'Identify internal and external users of accounting information',
                'Explore sub-fields of accounting (Financial, Cost, Management, Social)'
              ],
              hasPracticalProblems: false,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88093bos-aps2240-ch1u1.pdf',
              pdfTitle: 'Unit 1: Meaning and Scope of Accounting'
            },
            {
              id: 'acc-top-0102',
              topicNumber: 2,
              unitNumber: 2,
              isUnit: true,
              title: 'Unit 2: Accounting Concepts, Principles and Conventions',
              estimatedMinutes: 90,
              learningObjectives: [
                'Fundamental Accounting Assumptions (Going Concern, Consistency, Accrual)',
                'Accounting Principles: Entity, Money Measurement, Periodicity, Matching, Full Disclosure, Materiality, Prudence, Realisation'
              ],
              hasPracticalProblems: false,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88094bos-aps2240-ch1u2.pdf',
              pdfTitle: 'Unit 2: Accounting Concepts, Principles and Conventions',
              videoUrl: 'https://www.youtube.com/watch?v=9Wk6WKHgB08',
              videoTitle: 'Accounting Principle & Assumption in One Shot | CA Foundation | Accountancy 🔥'
            },
            {
              id: 'acc-top-0103',
              topicNumber: 3,
              unitNumber: 3,
              isUnit: true,
              title: 'Unit 3: Capital and Revenue Expenditures and Receipts',
              estimatedMinutes: 75,
              learningObjectives: [
                'Distinction between Capital Expenditure and Revenue Expenditure',
                'Treatment of Deferred Revenue Expenditure',
                'Capital Receipts vs Revenue Receipts'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88095bos-aps2240-ch1u3.pdf',
              pdfTitle: 'Unit 3: Capital and Revenue Expenditures and Receipts'
            },
            {
              id: 'acc-top-0104',
              topicNumber: 4,
              unitNumber: 4,
              isUnit: true,
              title: 'Unit 4: Contingent Assets and Contingent Liabilities',
              estimatedMinutes: 45,
              learningObjectives: [
                'Definition and recognition criteria for Provisions vs Liabilities',
                'Definition and disclosure of Contingent Liabilities',
                'Treatment of Contingent Assets'
              ],
              hasPracticalProblems: false,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88096bos-aps2240-ch1u4.pdf',
              pdfTitle: 'Unit 4: Contingent Assets and Contingent Liabilities'
            },
            {
              id: 'acc-top-0105',
              topicNumber: 5,
              unitNumber: 5,
              isUnit: true,
              title: 'Unit 5: Accounting Policies',
              estimatedMinutes: 45,
              learningObjectives: [
                'Meaning of Accounting Policies',
                'Selection and changes in Accounting Policies',
                'Disclosure requirements under AS 1'
              ],
              hasPracticalProblems: false,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88097bos-aps2240-ch1u5.pdf',
              pdfTitle: 'Unit 5: Accounting Policies'
            },
            {
              id: 'acc-top-0106',
              topicNumber: 6,
              unitNumber: 6,
              isUnit: true,
              title: 'Unit 6: Accounting as a Measurement Discipline – Valuation Principles, Accounting Estimates',
              estimatedMinutes: 60,
              learningObjectives: [
                'Measurement discipline and elements of measurement',
                'Valuation principles: Historical Cost, Current Cost, Realisable Value, Present Value',
                'Accounting Estimates and their significance'
              ],
              hasPracticalProblems: false,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88098bos-aps2240-ch1u6.pdf',
              pdfTitle: 'Unit 6: Accounting as a Measurement Discipline'
            },
            {
              id: 'acc-top-0107',
              topicNumber: 7,
              unitNumber: 7,
              isUnit: true,
              title: 'Unit 7: Accounting Standards',
              estimatedMinutes: 60,
              learningObjectives: [
                'Role of Accounting Standards Board (ASB)',
                'Overview of Indian Accounting Standards (Ind AS) vs AS',
                'International Financial Reporting Standards (IFRS) convergence'
              ],
              hasPracticalProblems: false,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88099bos-aps2240-ch1u7.pdf',
              pdfTitle: 'Unit 7: Accounting Standards'
            }
          ]
        },
        {
          id: 'acc-ch-02',
          chapterNumber: 2,
          title: 'Accounting Process',
          hasSubunits: true,
          icaiWeightage: {
            minPercentage: 10,
            maxPercentage: 15,
            typicalMarks: '10-15 Marks'
          },
          estimatedStudyHours: 18,
          difficulty: 'Medium',
          importance: 'High',
          description: 'Double entry system, journalizing, ledger accounts, cash book, subsidiary books, trial balance, and rectification of errors.',
          topics: [
            {
              id: 'acc-top-0201',
              topicNumber: 1,
              unitNumber: 1,
              isUnit: true,
              title: 'Unit 1: Basic Accounting Procedures – Journal Entries',
              estimatedMinutes: 90,
              learningObjectives: [
                'Rules of Debit and Credit (Traditional vs Modern Approach)',
                'Recording transactions in Journal and compound entries',
                'Opening, transfer, and closing journal entries'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88100bos-aps2240-ch2u1.pdf',
              pdfTitle: 'Unit 1: Basic Accounting Procedures – Journal Entries',
              videoUrl: 'https://www.youtube.com/watch?v=9vUMhazMkkM',
              videoTitle: 'Basic of 11th with Journal Entry in One Shot | CA Foundation | Accountancy 🔥'
            },
            {
              id: 'acc-top-0202',
              topicNumber: 2,
              unitNumber: 2,
              isUnit: true,
              title: 'Unit 2: Ledgers',
              estimatedMinutes: 60,
              learningObjectives: [
                'Posting from Journal to Ledger',
                'Balancing of personal, real, and nominal accounts'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88101bos-aps2240-ch2u2.pdf',
              pdfTitle: 'Unit 2: Ledgers',
              videoUrl: 'https://www.youtube.com/watch?v=oV8uU8jX7g0',
              videoTitle: 'Ledger & Trial Balance in One Shot | CA Foundation | Accountancy 🔥'
            },
            {
              id: 'acc-top-0203',
              topicNumber: 3,
              unitNumber: 3,
              isUnit: true,
              title: 'Unit 3: Trial Balance',
              estimatedMinutes: 60,
              learningObjectives: [
                'Objectives and preparation of Trial Balance',
                'Total method, balance method, and total and balance method',
                'Errors disclosed and not disclosed by Trial Balance'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88102bos-aps2240-ch2u3.pdf',
              pdfTitle: 'Unit 3: Trial Balance',
              videoUrl: 'https://www.youtube.com/watch?v=oV8uU8jX7g0',
              videoTitle: 'Ledger & Trial Balance in One Shot | CA Foundation | Accountancy 🔥'
            },
            {
              id: 'acc-top-0204',
              topicNumber: 4,
              unitNumber: 4,
              isUnit: true,
              title: 'Unit 4: Subsidiary Books',
              estimatedMinutes: 75,
              learningObjectives: [
                'Purchase Book, Sales Book, Purchase Return Book, Sales Return Book',
                'Bills Receivable and Bills Payable Books',
                'Journal Proper entries'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88103bos-aps2240-ch2u4.pdf',
              pdfTitle: 'Unit 4: Subsidiary Books'
            },
            {
              id: 'acc-top-0205',
              topicNumber: 5,
              unitNumber: 5,
              isUnit: true,
              title: 'Unit 5: Cash Book',
              estimatedMinutes: 75,
              learningObjectives: [
                'Single column, double column, and triple column cash books',
                'Petty cash book with Imprest System',
                'Contra entries and bank transaction recordings'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88104bos-aps2240-ch2u5.pdf',
              pdfTitle: 'Unit 5: Cash Book'
            },
            {
              id: 'acc-top-0206',
              topicNumber: 6,
              unitNumber: 6,
              isUnit: true,
              title: 'Unit 6: Rectification of Errors',
              estimatedMinutes: 120,
              learningObjectives: [
                'Classification of Errors: Omission, Commission, Principle, Compensating',
                'Rectification before Trial Balance, after Trial Balance before Final Accounts (Suspense Account)',
                'Rectification in subsequent accounting period (Profit & Loss Adjustment Account)'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88105bos-aps2240-ch2u6.pdf',
              pdfTitle: 'Unit 6: Rectification of Errors',
              videoUrl: 'https://www.youtube.com/watch?v=R9Z8XhV3X_Q',
              videoTitle: 'Rectification of Errors in One Shot | CA Foundation | Accountancy 🔥'
            }
          ]
        },
        {
          id: 'acc-ch-03',
          chapterNumber: 3,
          title: 'Bank Reconciliation Statement',
          hasSubunits: false,
          icaiWeightage: {
            minPercentage: 5,
            maxPercentage: 10,
            typicalMarks: '5-10 Marks'
          },
          estimatedStudyHours: 8,
          difficulty: 'Medium',
          importance: 'High',
          description: 'Understanding causes of difference between cash book bank column and bank pass book, adjusted cash book approach, and BRS preparation.',
          pdfUrl: 'https://resource.cdn.icai.org/88106bos-aps2240-ch3.pdf',
          pdfTitle: 'Chapter 3: Bank Reconciliation Statement',
          videoUrl: 'https://www.youtube.com/watch?v=YfK9qV3bU7o',
          videoTitle: 'Bank Reconciliation Statement in One Shot | CA Foundation | Accountancy 🔥',
          topics: [
            {
              id: 'acc-top-0301',
              topicNumber: 1,
              isUnit: false,
              title: 'Bank Reconciliation Statement',
              estimatedMinutes: 180,
              learningObjectives: [
                'Timing differences and errors causing discrepancies between Cash Book and Pass Book',
                'Preparation of BRS starting with favourable/unfavourable (overdraft) balance',
                'Preparation of Adjusted / Amended Cash Book before BRS'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88106bos-aps2240-ch3.pdf',
              pdfTitle: 'Chapter 3: Bank Reconciliation Statement',
              videoUrl: 'https://www.youtube.com/watch?v=YfK9qV3bU7o',
              videoTitle: 'Bank Reconciliation Statement in One Shot | CA Foundation | Accountancy 🔥'
            }
          ]
        },
        {
          id: 'acc-ch-04',
          chapterNumber: 4,
          title: 'Inventories',
          hasSubunits: false,
          icaiWeightage: {
            minPercentage: 5,
            maxPercentage: 10,
            typicalMarks: '5-10 Marks'
          },
          estimatedStudyHours: 8,
          difficulty: 'Medium',
          importance: 'High',
          description: 'AS 2 valuation of inventory, cost formulas (FIFO, Weighted Average, Adjusted Selling Price), and inventory systems.',
          pdfUrl: 'https://resource.cdn.icai.org/88107bos-aps2240-ch4.pdf',
          pdfTitle: 'Chapter 4: Inventories',
          videoUrl: 'https://www.youtube.com/watch?v=8V3k_W8g6k0',
          videoTitle: 'Inventory Valuation in One Shot | CA Foundation | Accountancy 🔥',
          topics: [
            {
              id: 'acc-top-0401',
              topicNumber: 1,
              isUnit: false,
              title: 'Inventories',
              estimatedMinutes: 180,
              learningObjectives: [
                'Meaning and significance of Inventory per AS 2',
                'Valuation basis: Lower of Cost and Net Realisable Value (NRV)',
                'Cost formulas: FIFO, Weighted Average, Retail / Adjusted Selling Price Method',
                'Periodic and Perpetual Inventory systems and stock take adjustments'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88107bos-aps2240-ch4.pdf',
              pdfTitle: 'Chapter 4: Inventories',
              videoUrl: 'https://www.youtube.com/watch?v=8V3k_W8g6k0',
              videoTitle: 'Inventory Valuation in One Shot | CA Foundation | Accountancy 🔥'
            }
          ]
        },
        {
          id: 'acc-ch-05',
          chapterNumber: 5,
          title: 'Depreciation and Amortisation',
          hasSubunits: false,
          icaiWeightage: {
            minPercentage: 5,
            maxPercentage: 10,
            typicalMarks: '5-10 Marks'
          },
          estimatedStudyHours: 10,
          difficulty: 'Medium',
          importance: 'High',
          description: 'AS 10 principles of depreciation, Straight Line Method, Written Down Value Method, change in method, and asset disposal.',
          pdfUrl: 'https://resource.cdn.icai.org/88108bos-aps2240-ch5.pdf',
          pdfTitle: 'Chapter 5: Depreciation and Amortisation',
          videoUrl: 'https://www.youtube.com/watch?v=m7P1o-mXQhQ',
          videoTitle: 'Depreciation in One Shot | CA Foundation | Accountancy 🔥',
          topics: [
            {
              id: 'acc-top-0501',
              topicNumber: 1,
              isUnit: false,
              title: 'Depreciation and Amortisation',
              estimatedMinutes: 210,
              learningObjectives: [
                'Concepts and causes of depreciation and amortisation under AS 10',
                'Straight Line Method (SLM) and Written Down Value (WDV) computations',
                'Change in method of depreciation (prospective effect)',
                'Provision for Depreciation Account and Asset Disposal Account'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88108bos-aps2240-ch5.pdf',
              pdfTitle: 'Chapter 5: Depreciation and Amortisation',
              videoUrl: 'https://www.youtube.com/watch?v=m7P1o-mXQhQ',
              videoTitle: 'Depreciation in One Shot | CA Foundation | Accountancy 🔥'
            }
          ]
        },
        {
          id: 'acc-ch-06',
          chapterNumber: 6,
          title: 'Bills of Exchange and Promissory Notes',
          hasSubunits: false,
          icaiWeightage: {
            minPercentage: 5,
            maxPercentage: 10,
            typicalMarks: '5-10 Marks'
          },
          estimatedStudyHours: 8,
          difficulty: 'Medium',
          importance: 'Medium',
          description: 'Trade bills, accommodation bills, discounting, dishonour, noting charges, renewal, and insolvency.',
          pdfUrl: 'https://resource.cdn.icai.org/88109bos-aps2240-ch6.pdf',
          pdfTitle: 'Chapter 6: Bills of Exchange and Promissory Notes',
          videoUrl: 'https://www.youtube.com/watch?v=N4X5a7_w9e0',
          videoTitle: 'Bills of Exchange in One Shot | CA Foundation | Accountancy 🔥',
          topics: [
            {
              id: 'acc-top-0601',
              topicNumber: 1,
              isUnit: false,
              title: 'Bills of Exchange and Promissory Notes',
              estimatedMinutes: 180,
              learningObjectives: [
                'Characteristics of Bills of Exchange and Promissory Notes',
                'Accounting treatment: Retaining till maturity, discounting, endorsing, sending for collection',
                'Dishonour of bills and noting charges',
                'Renewal of bills, retirement under rebate, and Accommodation Bills'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88109bos-aps2240-ch6.pdf',
              pdfTitle: 'Chapter 6: Bills of Exchange and Promissory Notes',
              videoUrl: 'https://www.youtube.com/watch?v=N4X5a7_w9e0',
              videoTitle: 'Bills of Exchange in One Shot | CA Foundation | Accountancy 🔥'
            }
          ]
        },
        {
          id: 'acc-ch-07',
          chapterNumber: 7,
          title: 'Preparation of Final Accounts of Sole Proprietors',
          hasSubunits: true,
          icaiWeightage: {
            minPercentage: 10,
            maxPercentage: 15,
            typicalMarks: '10-15 Marks'
          },
          estimatedStudyHours: 16,
          difficulty: 'Hard',
          importance: 'High',
          description: 'Manufacturing account, trading account, profit and loss account, balance sheet, and comprehensive year-end adjustments.',
          topics: [
            {
              id: 'acc-top-0701',
              topicNumber: 1,
              unitNumber: 1,
              isUnit: true,
              title: 'Unit 1: Final Accounts of Non-Manufacturing Entities',
              estimatedMinutes: 150,
              learningObjectives: [
                'Trading Account: Gross profit/loss determination',
                'Profit & Loss Account: Operating vs non-operating income/expenses',
                'Balance Sheet: Marshalling of assets and liabilities',
                'Year-end adjustments: Closing stock, bad debts, provisions, prepaid/accrued'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88110bos-aps2240-ch7u1.pdf',
              pdfTitle: 'Unit 1: Final Accounts of Non-Manufacturing Entities',
              videoUrl: 'https://www.youtube.com/watch?v=b0X8o-pM6wA',
              videoTitle: 'Final Accounts of Non-Manufacturing Entities in One Shot | CA Foundation'
            },
            {
              id: 'acc-top-0702',
              topicNumber: 2,
              unitNumber: 2,
              isUnit: true,
              title: 'Unit 2: Final Accounts of Manufacturing Entities',
              estimatedMinutes: 90,
              learningObjectives: [
                'Need and purpose of Manufacturing Account',
                'Calculation of Cost of Raw Materials Consumed, Direct Wages, Prime Cost',
                'Factory Overheads and Cost of Production transfer to Trading Account'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88111bos-aps2240-ch7u2.pdf',
              pdfTitle: 'Unit 2: Final Accounts of Manufacturing Entities',
              videoUrl: 'https://www.youtube.com/watch?v=y7k7v7KqFyo',
              videoTitle: 'Manufacturing Account in One Shot | CA Foundation | Accountancy 🔥'
            }
          ]
        },
        {
          id: 'acc-ch-08',
          chapterNumber: 8,
          title: 'Financial Statements of Not-for-Profit Organisations',
          hasSubunits: false,
          icaiWeightage: {
            minPercentage: 10,
            maxPercentage: 15,
            typicalMarks: '10-15 Marks'
          },
          estimatedStudyHours: 14,
          difficulty: 'Hard',
          importance: 'High',
          description: 'Receipts and Payments Account, Income and Expenditure Account, subscription accounting, and balance sheet preparation for NPOs.',
          pdfUrl: 'https://resource.cdn.icai.org/88115bos-aps2240-ch8.pdf',
          pdfTitle: 'Chapter 8: Financial Statements of Not-for-Profit Organisations',
          videoUrl: 'https://www.youtube.com/watch?v=Q7j3s0k9P1A',
          videoTitle: 'NPO in One Shot | CA Foundation | Accountancy 🔥',
          topics: [
            {
              id: 'acc-top-0801',
              topicNumber: 1,
              isUnit: false,
              title: 'Financial Statements of Not-for-Profit Organisations',
              estimatedMinutes: 240,
              learningObjectives: [
                'Receipts and Payments Account characteristics and preparation',
                'Income and Expenditure Account on accrual basis',
                'Subscription Account and special funds (Capital Fund, Building Fund)',
                'Preparation of Opening and Closing Balance Sheets'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88115bos-aps2240-ch8.pdf',
              pdfTitle: 'Chapter 8: Financial Statements of Not-for-Profit Organisations',
              videoUrl: 'https://www.youtube.com/watch?v=Q7j3s0k9P1A',
              videoTitle: 'NPO in One Shot | CA Foundation | Accountancy 🔥'
            }
          ]
        },
        {
          id: 'acc-ch-09',
          chapterNumber: 9,
          title: 'Accounts from Incomplete Records',
          hasSubunits: false,
          icaiWeightage: {
            minPercentage: 5,
            maxPercentage: 10,
            typicalMarks: '5-10 Marks'
          },
          estimatedStudyHours: 12,
          difficulty: 'Hard',
          importance: 'High',
          description: 'Single entry system, Statement of Affairs method, and conversion method to double entry system.',
          pdfUrl: 'https://resource.cdn.icai.org/88116bos-aps2240-ch9.pdf',
          pdfTitle: 'Chapter 9: Accounts from Incomplete Records',
          topics: [
            {
              id: 'acc-top-0901',
              topicNumber: 1,
              isUnit: false,
              title: 'Accounts from Incomplete Records',
              estimatedMinutes: 210,
              learningObjectives: [
                'Features and limitations of Single Entry / Incomplete Records',
                'Statement of Affairs method for finding profit/loss',
                'Conversion method: Total Debtors/Creditors accounts, Bills Receivable/Payable accounts',
                'Cash and Bank summary, finding missing figures and preparing final accounts'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88116bos-aps2240-ch9.pdf',
              pdfTitle: 'Chapter 9: Accounts from Incomplete Records'
            }
          ]
        },
        {
          id: 'acc-ch-10',
          chapterNumber: 10,
          title: 'Partnership and LLP Accounts',
          hasSubunits: true,
          icaiWeightage: {
            minPercentage: 15,
            maxPercentage: 20,
            typicalMarks: '15-20 Marks'
          },
          estimatedStudyHours: 24,
          difficulty: 'Hard',
          importance: 'Essential',
          description: 'Fundamentals of partnership, goodwill valuation, admission, retirement, death, and dissolution of partnership firms and LLPs.',
          topics: [
            {
              id: 'acc-top-1001',
              topicNumber: 1,
              unitNumber: 1,
              isUnit: true,
              title: 'Unit 1: Introduction to Partnership Accounts',
              estimatedMinutes: 90,
              learningObjectives: [
                'Profit & Loss Appropriation Account',
                'Fixed vs Fluctuating Capital Accounts',
                'Interest on Capital, Drawings, Guarantee of Profit, and Past Adjustments'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88117bos-aps2240-ch10u1.pdf',
              pdfTitle: 'Unit 1: Introduction to Partnership Accounts',
              videoUrl: 'https://www.youtube.com/watch?v=5c2a1o1M1oY',
              videoTitle: 'Partnership Fundamentals in One Shot | CA Foundation'
            },
            {
              id: 'acc-top-1002',
              topicNumber: 2,
              unitNumber: 2,
              isUnit: true,
              title: 'Unit 2: Treatment of Goodwill in Partnership Accounts',
              estimatedMinutes: 75,
              learningObjectives: [
                'Methods of Goodwill Valuation: Average Profit, Super Profit, Capitalisation, Annuity',
                'Accounting treatment of goodwill under AS 26'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88118bos-aps2240-ch10u2.pdf',
              pdfTitle: 'Unit 2: Treatment of Goodwill in Partnership Accounts'
            },
            {
              id: 'acc-top-1003',
              topicNumber: 3,
              unitNumber: 3,
              isUnit: true,
              title: 'Unit 3: Admission of a New Partner',
              estimatedMinutes: 120,
              learningObjectives: [
                'New profit sharing ratio and sacrificing ratio',
                'Revaluation Account of assets and liabilities',
                'Treatment of reserves and accumulated profits',
                'Adjustment of capitals on admission'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88119bos-aps2240-ch10u3.pdf',
              pdfTitle: 'Unit 3: Admission of a New Partner'
            },
            {
              id: 'acc-top-1004',
              topicNumber: 4,
              unitNumber: 4,
              isUnit: true,
              title: 'Unit 4: Retirement of a Partner',
              estimatedMinutes: 90,
              learningObjectives: [
                'Gaining ratio and accounting on retirement',
                'Payment to retiring partner, Loan Account',
                'Joint Life Policy (JLP) and Individual Life Policies'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88120bos-aps2240-ch10u4.pdf',
              pdfTitle: 'Unit 4: Retirement of a Partner'
            },
            {
              id: 'acc-top-1005',
              topicNumber: 5,
              unitNumber: 5,
              isUnit: true,
              title: 'Unit 5: Death of a Partner',
              estimatedMinutes: 75,
              learningObjectives: [
                'Ascertainment of deceased partner share of profit till death',
                'Deceased Partner Capital and Executor Account settlement'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88121bos-aps2240-ch10u5.pdf',
              pdfTitle: 'Unit 5: Death of a Partner'
            },
            {
              id: 'acc-top-1006',
              topicNumber: 6,
              unitNumber: 6,
              isUnit: true,
              title: 'Unit 6: Dissolution of Partnership Firms and LLPs',
              estimatedMinutes: 120,
              learningObjectives: [
                'Dissolution of firm vs dissolution of partnership',
                'Realisation Account preparation, settlement of liabilities',
                'Piecemeal distribution of cash (Proportionate Capital & Maximum Loss Method)',
                'Dissolution and winding up of Limited Liability Partnerships (LLP)'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88122bos-aps2240-ch10u6.pdf',
              pdfTitle: 'Unit 6: Dissolution of Partnership Firms and LLPs'
            }
          ]
        },
        {
          id: 'acc-ch-11',
          chapterNumber: 11,
          title: 'Company Accounts',
          hasSubunits: true,
          icaiWeightage: {
            minPercentage: 15,
            maxPercentage: 20,
            typicalMarks: '15-20 Marks'
          },
          estimatedStudyHours: 22,
          difficulty: 'Hard',
          importance: 'Essential',
          description: 'Share capital, issue, forfeiture, reissue, bonus issue, rights issue, redemption of preference shares, and debentures.',
          topics: [
            {
              id: 'acc-top-1101',
              topicNumber: 1,
              unitNumber: 1,
              isUnit: true,
              title: 'Unit 1: Introduction to Company Accounts',
              estimatedMinutes: 60,
              learningObjectives: [
                'Corporate entity features, share capital classification',
                'Schedule III Balance Sheet format overview for share capital'
              ],
              hasPracticalProblems: false,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88134bos-aps2240-ch11u1.pdf',
              pdfTitle: 'Unit 1: Introduction to Company Accounts'
            },
            {
              id: 'acc-top-1102',
              topicNumber: 2,
              unitNumber: 2,
              isUnit: true,
              title: 'Unit 2: Issue, Forfeiture and Re-Issue of Shares',
              estimatedMinutes: 150,
              learningObjectives: [
                'Issue of shares at Par, Premium, calls in arrears/advance',
                'Pro-rata allotment in over-subscription',
                'Forfeiture of shares and Re-issue of forfeited shares',
                'Transfer of profit to Capital Reserve'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88135bos-aps2240-ch11u2.pdf',
              pdfTitle: 'Unit 2: Issue, Forfeiture and Re-Issue of Shares',
              videoUrl: 'https://www.youtube.com/watch?v=3K0s-kL3fYo',
              videoTitle: 'Company Accounts: Shares in One Shot | CA Foundation | Accountancy 🔥'
            },
            {
              id: 'acc-top-1103',
              topicNumber: 3,
              unitNumber: 3,
              isUnit: true,
              title: 'Unit 3: Issue of Debentures',
              estimatedMinutes: 90,
              learningObjectives: [
                'Issue of debentures for cash, non-cash consideration, collateral security',
                'Issue with terms of redemption and discount on issue write-off'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88136bos-aps2240-ch11u3.pdf',
              pdfTitle: 'Unit 3: Issue of Debentures',
              videoUrl: 'https://www.youtube.com/watch?v=F0p7f1-L1e4',
              videoTitle: 'Debentures in One Shot | CA Foundation | Accountancy 🔥'
            },
            {
              id: 'acc-top-1104',
              topicNumber: 4,
              unitNumber: 4,
              isUnit: true,
              title: 'Unit 4: Accounting for Bonus Issue and Right Issue',
              estimatedMinutes: 75,
              learningObjectives: [
                'Conditions and sources for issue of Bonus Shares (Section 63)',
                'Accounting entries for Bonus Issue',
                'Right Issue provisions (Section 62) and computation of theoretical ex-rights price'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88137bos-aps2240-ch11u4.pdf',
              pdfTitle: 'Unit 4: Accounting for Bonus Issue and Right Issue'
            },
            {
              id: 'acc-top-1105',
              topicNumber: 5,
              unitNumber: 5,
              isUnit: true,
              title: 'Unit 5: Redemption of Preference Shares',
              estimatedMinutes: 90,
              learningObjectives: [
                'Legal provisions under Section 55 for redemption of preference shares',
                'Redemption out of divisible profits vs fresh issue of shares',
                'Capital Redemption Reserve (CRR) creation and utilisation'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88138bos-aps2240-ch11u5.pdf',
              pdfTitle: 'Unit 5: Redemption of Preference Shares'
            },
            {
              id: 'acc-top-1106',
              topicNumber: 6,
              unitNumber: 6,
              isUnit: true,
              title: 'Unit 6: Redemption of Debentures',
              estimatedMinutes: 90,
              learningObjectives: [
                'Methods of redemption: Lump sum, annual instalments, purchase in open market',
                'Debenture Redemption Reserve (DRR) and Debenture Redemption Investment (DRI) rules',
                'Conversion into shares or new debentures'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88139bos-aps2240-ch11u6.pdf',
              pdfTitle: 'Unit 6: Redemption of Debentures'
            }
          ]
        }
      ]
    },
    {
      id: 'paper-2-business-laws',
      paperNumber: 2,
      code: 'BLAW',
      title: 'Business Laws',
      shortTitle: 'Business Laws',
      type: 'Descriptive',
      totalMarks: 100,
      estimatedStudyHours: 130,
      color: {
        light: '#8B5CF6',
        dark: '#A78BFA',
        theme: 'violet'
      },
      description: 'To develop an understanding of significant legal frameworks and business legislations and acquire the ability to apply knowledge to solve practical commercial problems.',
      chapters: [
        {
          id: 'law-ch-01',
          chapterNumber: 1,
          title: 'Indian Regulatory Framework',
          hasSubunits: false,
          icaiWeightage: {
            minPercentage: 5,
            maxPercentage: 10,
            typicalMarks: '5-10 Marks'
          },
          estimatedStudyHours: 8,
          difficulty: 'Easy',
          importance: 'Medium',
          description: 'Structure of the Indian legal system, sources of law, judicial machinery, courts hierarchy, and key regulatory agencies.',
          pdfUrl: 'https://resource.cdn.icai.org/88015bos-aps2231-ch1.pdf',
          pdfTitle: 'Chapter 1: Indian Regulatory Framework',
          videoUrl: 'https://www.youtube.com/watch?v=4Zl9Q2k8bFo',
          videoTitle: 'Indian Regulatory Framework in One Shot | CA Foundation Law',
          topics: [
            {
              id: 'law-top-0101',
              topicNumber: 1,
              isUnit: false,
              title: 'Indian Regulatory Framework',
              estimatedMinutes: 180,
              learningObjectives: [
                'Structure of the Indian legal system and sources of law',
                'Hierarchy of courts (Supreme Court, High Courts, District Courts)',
                'Primary regulatory bodies (ICAI, MCA, SEBI, RBI, IBBI)'
              ],
              hasPracticalProblems: false,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88015bos-aps2231-ch1.pdf',
              pdfTitle: 'Chapter 1: Indian Regulatory Framework',
              videoUrl: 'https://www.youtube.com/watch?v=4Zl9Q2k8bFo',
              videoTitle: 'Indian Regulatory Framework in One Shot | CA Foundation Law'
            }
          ]
        },
        {
          id: 'law-ch-02',
          chapterNumber: 2,
          title: 'The Indian Contract Act, 1872',
          hasSubunits: true,
          icaiWeightage: {
            minPercentage: 20,
            maxPercentage: 30,
            typicalMarks: '20-30 Marks'
          },
          estimatedStudyHours: 35,
          difficulty: 'Hard',
          importance: 'Essential',
          description: 'General principles of contract law, offer, acceptance, consideration, validity, discharge, breach, and special contracts (indemnity, guarantee, bailment, pledge, agency).',
          topics: [
            {
              id: 'law-top-0201',
              topicNumber: 1,
              unitNumber: 1,
              isUnit: true,
              title: 'Unit 1: Nature of Contracts',
              estimatedMinutes: 90,
              learningObjectives: [
                'Essential elements of a valid contract per Section 10',
                'Classification of contracts based on validity, formation, and performance'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88017bos-aps2231-ch2u1.pdf',
              pdfTitle: 'Unit 1: Nature of Contracts'
            },
            {
              id: 'law-top-0202',
              topicNumber: 2,
              unitNumber: 2,
              isUnit: true,
              title: 'Unit 2: Consideration',
              estimatedMinutes: 75,
              learningObjectives: [
                'Legal rules regarding consideration',
                'Doctrine of Privity of Contract and its exceptions',
                'Validity of agreement without consideration'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88018bos-aps2231-ch2u2.pdf',
              pdfTitle: 'Unit 2: Consideration'
            },
            {
              id: 'law-top-0203',
              topicNumber: 3,
              unitNumber: 3,
              isUnit: true,
              title: 'Unit 3: Other Essential Elements of a Contract',
              estimatedMinutes: 90,
              learningObjectives: [
                'Capacity to contract: Minors, persons of unsound mind, disqualified persons',
                'Free consent: Coercion, Undue Influence, Fraud, Misrepresentation, Mistake',
                'Lawful object and consideration, void agreements'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88019bos-aps2231-ch2u3.pdf',
              pdfTitle: 'Unit 3: Other Essential Elements of a Contract'
            },
            {
              id: 'law-top-0204',
              topicNumber: 4,
              unitNumber: 4,
              isUnit: true,
              title: 'Unit 4: Performance of Contract',
              estimatedMinutes: 90,
              learningObjectives: [
                'By whom contract must be performed, time and place of performance',
                'Performance of reciprocal promises, appropriation of payments',
                'Contracts which need not be performed'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88020bos-aps2231-ch2u4.pdf',
              pdfTitle: 'Unit 4: Performance of Contract'
            },
            {
              id: 'law-top-0205',
              topicNumber: 5,
              unitNumber: 5,
              isUnit: true,
              title: 'Unit 5: Breach of Contract and its Remedies',
              estimatedMinutes: 75,
              learningObjectives: [
                'Anticipatory breach vs Actual breach of contract',
                'Remedies for breach: Ordinary, special, vindictive, nominal damages',
                'Suit for Injunction, Specific Performance, Quantum Meruit'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88021bos-aps2231-ch2u5.pdf',
              pdfTitle: 'Unit 5: Breach of Contract and its Remedies'
            },
            {
              id: 'law-top-0206',
              topicNumber: 6,
              unitNumber: 6,
              isUnit: true,
              title: 'Unit 6: Contingent and Quasi Contracts',
              estimatedMinutes: 60,
              learningObjectives: [
                'Rules relating to enforcement of Contingent Contracts',
                'Quasi Contracts: Concept of unjust enrichment (Sections 68 to 72)'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88022bos-aps2231-ch2u6.pdf',
              pdfTitle: 'Unit 6: Contingent and Quasi Contracts'
            },
            {
              id: 'law-top-0207',
              topicNumber: 7,
              unitNumber: 7,
              isUnit: true,
              title: 'Unit 7: Contract of Indemnity and Guarantee',
              estimatedMinutes: 75,
              learningObjectives: [
                'Contract of Indemnity: Definition, rights of indemnity holder',
                'Contract of Guarantee: Parties, essential features, continuing guarantee',
                'Rights of surety, discharge of surety from liability'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88023bos-aps2231-ch2u7.pdf',
              pdfTitle: 'Unit 7: Contract of Indemnity and Guarantee'
            },
            {
              id: 'law-top-0208',
              topicNumber: 8,
              unitNumber: 8,
              isUnit: true,
              title: 'Unit 8: Bailment and Pledge',
              estimatedMinutes: 75,
              learningObjectives: [
                'Contract of Bailment: Rights and duties of bailor and bailee, termination',
                'Pledge: Definition, rights of pawner and pawnee, pledge by non-owners'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88024bos-aps2231-ch2u8.pdf',
              pdfTitle: 'Unit 8: Bailment and Pledge'
            },
            {
              id: 'law-top-0209',
              topicNumber: 9,
              unitNumber: 9,
              isUnit: true,
              title: 'Unit 9: Agency',
              estimatedMinutes: 90,
              learningObjectives: [
                'Creation of Agency, classes of agents, sub-agent vs substituted agent',
                'Rights and duties of agent and principal, scope of authority',
                'Revocation and termination of Agency'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88025bos-aps2231-ch2u9.pdf',
              pdfTitle: 'Unit 9: Agency'
            }
          ]
        },
        {
          id: 'law-ch-03',
          chapterNumber: 3,
          title: 'The Sale of Goods Act, 1930',
          hasSubunits: true,
          icaiWeightage: {
            minPercentage: 15,
            maxPercentage: 20,
            typicalMarks: '15-20 Marks'
          },
          estimatedStudyHours: 20,
          difficulty: 'Medium',
          importance: 'High',
          description: 'Formation of contract of sale, conditions and warranties, transfer of ownership, delivery, and rights of unpaid seller.',
          topics: [
            {
              id: 'law-top-0301',
              topicNumber: 1,
              unitNumber: 1,
              isUnit: true,
              title: 'Unit 1: Formation of the Contract of Sale',
              estimatedMinutes: 75,
              learningObjectives: [
                'Sale vs Agreement to Sell, subject matter of contract of sale',
                'Destruction of goods before/after agreement to sell'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88026bos-aps2231-ch3u1.pdf',
              pdfTitle: 'Unit 1: Formation of the Contract of Sale'
            },
            {
              id: 'law-top-0302',
              topicNumber: 2,
              unitNumber: 2,
              isUnit: true,
              title: 'Unit 2: Conditions & Warranties',
              estimatedMinutes: 90,
              learningObjectives: [
                'Express and Implied Conditions and Warranties',
                'Doctrine of Caveat Emptor and its statutory exceptions'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88027bos-aps2231-ch3u2.pdf',
              pdfTitle: 'Unit 2: Conditions & Warranties'
            },
            {
              id: 'law-top-0303',
              topicNumber: 3,
              unitNumber: 3,
              isUnit: true,
              title: 'Unit 3: Transfer of Ownership and Delivery of Goods',
              estimatedMinutes: 90,
              learningObjectives: [
                'Passing of property in specific and unascertained goods',
                'Risk follows ownership principle and Nemo Dat Quod Non Habet exceptions',
                'Rules relating to delivery of goods and acceptance'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88028bos-aps2231-ch3u3.pdf',
              pdfTitle: 'Unit 3: Transfer of Ownership and Delivery of Goods'
            },
            {
              id: 'law-top-0304',
              topicNumber: 4,
              unitNumber: 4,
              isUnit: true,
              title: 'Unit 4: Unpaid Seller',
              estimatedMinutes: 90,
              learningObjectives: [
                'Definition and rights of unpaid seller against goods (Lien, Stoppage in Transit, Resale)',
                'Rights of unpaid seller against the buyer personally',
                'Remedies of buyer against seller for breach'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88029bos-aps2231-ch3u4.pdf',
              pdfTitle: 'Unit 4: Unpaid Seller'
            }
          ]
        },
        {
          id: 'law-ch-04',
          chapterNumber: 4,
          title: 'The Indian Partnership Act, 1932',
          hasSubunits: true,
          icaiWeightage: {
            minPercentage: 15,
            maxPercentage: 20,
            typicalMarks: '15-20 Marks'
          },
          estimatedStudyHours: 18,
          difficulty: 'Medium',
          importance: 'High',
          description: 'Nature of partnership, relations of partners to one another and third parties, registration, and dissolution.',
          topics: [
            {
              id: 'law-top-0401',
              topicNumber: 1,
              unitNumber: 1,
              isUnit: true,
              title: 'Unit 1: General Nature of Partnership',
              estimatedMinutes: 60,
              learningObjectives: [
                'Definition and true test of partnership (Mutual Agency)',
                'Types of partners and distinction from other forms of business'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88030bos-aps2231-ch4u1.pdf',
              pdfTitle: 'Unit 1: General Nature of Partnership'
            },
            {
              id: 'law-top-0402',
              topicNumber: 2,
              unitNumber: 2,
              isUnit: true,
              title: 'Unit 2: Relations of Partners',
              estimatedMinutes: 90,
              learningObjectives: [
                'Rights and duties of partners inter se',
                'Implied authority of partner and statutory restrictions',
                'Position of minor admitted to benefits of partnership'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88031bos-aps2231-ch4u2.pdf',
              pdfTitle: 'Unit 2: Relations of Partners'
            },
            {
              id: 'law-top-0403',
              topicNumber: 3,
              unitNumber: 3,
              isUnit: true,
              title: 'Unit 3: Registration and Dissolution of a Firm',
              estimatedMinutes: 90,
              learningObjectives: [
                'Procedure and legal consequences of non-registration of firm',
                'Modes of dissolution of a firm (Voluntary vs Compulsory / Court)',
                'Consequences of dissolution and settlement of partnership accounts'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88032bos-aps2231-ch4u3.pdf',
              pdfTitle: 'Unit 3: Registration and Dissolution of a Firm'
            }
          ]
        },
        {
          id: 'law-ch-05',
          chapterNumber: 5,
          title: 'The Limited Liability Partnership Act, 2008',
          hasSubunits: false,
          icaiWeightage: {
            minPercentage: 10,
            maxPercentage: 15,
            typicalMarks: '10-15 Marks'
          },
          estimatedStudyHours: 12,
          difficulty: 'Medium',
          importance: 'High',
          description: 'Salient features, designated partners, incorporation procedure, LLP agreement, partners relations, and winding up.',
          pdfUrl: 'https://resource.cdn.icai.org/88033bos-aps2231-ch5.pdf',
          pdfTitle: 'Chapter 5: The Limited Liability Partnership Act, 2008',
          videoUrl: 'https://www.youtube.com/watch?v=5r8t1y9u4i2',
          videoTitle: 'LLP Act 2008 in One Shot | CA Foundation Law',
          topics: [
            {
              id: 'law-top-0501',
              topicNumber: 1,
              isUnit: false,
              title: 'The Limited Liability Partnership Act, 2008',
              estimatedMinutes: 240,
              learningObjectives: [
                'Meaning, characteristics, and advantages of LLP over traditional partnerships and companies',
                'Designated Partners and their statutory obligations',
                'Incorporation process (FiLLiP, RUN-LLP) and LLP Agreement',
                'Extent of liability of LLP and partners, whistleblower protection',
                'Conversion of firms into LLP and winding up modes'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88033bos-aps2231-ch5.pdf',
              pdfTitle: 'Chapter 5: The Limited Liability Partnership Act, 2008',
              videoUrl: 'https://www.youtube.com/watch?v=5r8t1y9u4i2',
              videoTitle: 'LLP Act 2008 in One Shot | CA Foundation Law'
            }
          ]
        },
        {
          id: 'law-ch-06',
          chapterNumber: 6,
          title: 'The Companies Act, 2013',
          hasSubunits: false,
          icaiWeightage: {
            minPercentage: 15,
            maxPercentage: 20,
            typicalMarks: '15-20 Marks'
          },
          estimatedStudyHours: 16,
          difficulty: 'Hard',
          importance: 'Essential',
          description: 'Company characteristics, corporate veil doctrine, types of companies, incorporation, MOA, AOA, and share capital basics.',
          pdfUrl: 'https://resource.cdn.icai.org/88034bos-aps2231-ch6.pdf',
          pdfTitle: 'Chapter 6: The Companies Act, 2013',
          videoUrl: 'https://www.youtube.com/watch?v=9v0c8x7z6a4',
          videoTitle: 'Companies Act 2013 in One Shot | CA Foundation Law',
          topics: [
            {
              id: 'law-top-0601',
              topicNumber: 1,
              isUnit: false,
              title: 'The Companies Act, 2013',
              estimatedMinutes: 300,
              learningObjectives: [
                'Meaning and features of company, Corporate Veil and its lifting',
                'Classes of companies: Private, Public, One Person Company (OPC), Small Company, Section 8 Company, Holding and Subsidiary Companies',
                'Incorporation procedure (SPICe+), Certificate of Incorporation',
                'Memorandum of Association (MOA) and Articles of Association (AOA)',
                'Doctrine of Ultra Vires, Constructive Notice, and Indoor Management (Turquand Rule)'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88034bos-aps2231-ch6.pdf',
              pdfTitle: 'Chapter 6: The Companies Act, 2013',
              videoUrl: 'https://www.youtube.com/watch?v=9v0c8x7z6a4',
              videoTitle: 'Companies Act 2013 in One Shot | CA Foundation Law'
            }
          ]
        },
        {
          id: 'law-ch-07',
          chapterNumber: 7,
          title: 'The Negotiable Instruments Act, 1881',
          hasSubunits: false,
          icaiWeightage: {
            minPercentage: 10,
            maxPercentage: 15,
            typicalMarks: '10-15 Marks'
          },
          estimatedStudyHours: 14,
          difficulty: 'Hard',
          importance: 'High',
          description: 'Promissory notes, bills of exchange, cheques, crossing, negotiation, holder in due course, dishonour, and Section 138 penalties.',
          pdfUrl: 'https://resource.cdn.icai.org/88035bos-aps2231-ch7.pdf',
          pdfTitle: 'Chapter 7: The Negotiable Instruments Act, 1881',
          videoUrl: 'https://www.youtube.com/watch?v=7b9n4m3p2q1',
          videoTitle: 'Negotiable Instruments Act 1881 in One Shot | CA Foundation Law',
          topics: [
            {
              id: 'law-top-0701',
              topicNumber: 1,
              isUnit: false,
              title: 'The Negotiable Instruments Act, 1881',
              estimatedMinutes: 270,
              learningObjectives: [
                'Characteristics of Negotiable Instruments: Promissory Note, Bill of Exchange, Cheque',
                'Crossing of Cheques and types of crossing',
                'Holder and Holder in Due Course (HDC) privileges',
                'Negotiation, endorsement, and material alteration',
                'Dishonour of Cheques for Insufficiency of Funds (Sections 138 to 142) and penalties'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88035bos-aps2231-ch7.pdf',
              pdfTitle: 'Chapter 7: The Negotiable Instruments Act, 1881',
              videoUrl: 'https://www.youtube.com/watch?v=7b9n4m3p2q1',
              videoTitle: 'Negotiable Instruments Act 1881 in One Shot | CA Foundation Law'
            }
          ]
        }
      ]
    },
    {
      id: 'paper-3-quantitative-aptitude',
      paperNumber: 3,
      code: 'QA',
      title: 'Quantitative Aptitude',
      shortTitle: 'Quantitative Aptitude',
      type: 'Objective',
      totalMarks: 100,
      estimatedStudyHours: 160,
      color: {
        light: '#06B6D4',
        dark: '#22D3EE',
        theme: 'cyan'
      },
      description: 'Business Mathematics (40 Marks), Logical Reasoning (20 Marks), and Statistics (40 Marks) evaluated via Objective Type (MCQ) examination.',
      chapters: [
        // PART A: Business Mathematics (Chapters 1-8)
        {
          id: 'qa-ch-01',
          chapterNumber: 1,
          title: 'Ratio and Proportion, Indices, Logarithms',
          partId: 'part-a',
          partName: 'Business Mathematics',
          hasSubunits: false,
          icaiWeightage: { minPercentage: 4, maxPercentage: 6, typicalMarks: '4-6 Marks' },
          estimatedStudyHours: 8,
          difficulty: 'Easy',
          importance: 'Medium',
          pdfUrl: 'https://resource.cdn.icai.org/88037bos-aps2232-ch1.pdf',
          pdfTitle: 'Chapter 1: Ratio and Proportion, Indices, Logarithms',
          topics: [
            {
              id: 'qa-top-0101',
              topicNumber: 1,
              isUnit: false,
              title: 'Ratio and Proportion, Indices, Logarithms',
              estimatedMinutes: 210,
              learningObjectives: [
                'Properties and laws of ratios, duplicate/triplicate ratios',
                'Proportion and continuous proportion',
                'Laws of indices and exponential simplification',
                'Logarithms laws, characteristic, mantissa, and change of base'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: false,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88037bos-aps2232-ch1.pdf',
              pdfTitle: 'Chapter 1: Ratio and Proportion, Indices, Logarithms'
            }
          ]
        },
        {
          id: 'qa-ch-02',
          chapterNumber: 2,
          title: 'Equations',
          partId: 'part-a',
          partName: 'Business Mathematics',
          hasSubunits: false,
          icaiWeightage: { minPercentage: 4, maxPercentage: 6, typicalMarks: '4-6 Marks' },
          estimatedStudyHours: 8,
          difficulty: 'Medium',
          importance: 'Medium',
          pdfUrl: 'https://resource.cdn.icai.org/88038bos-aps2232-ch2.pdf',
          pdfTitle: 'Chapter 2: Equations',
          topics: [
            {
              id: 'qa-top-0201',
              topicNumber: 1,
              isUnit: false,
              title: 'Equations',
              estimatedMinutes: 180,
              learningObjectives: [
                'Linear equations in 1, 2, and 3 variables',
                'Quadratic equations: Nature of roots, sum and product of roots',
                'Cubic equations and word problems'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: false,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88038bos-aps2232-ch2.pdf',
              pdfTitle: 'Chapter 2: Equations'
            }
          ]
        },
        {
          id: 'qa-ch-03',
          chapterNumber: 3,
          title: 'Linear Inequalities',
          partId: 'part-a',
          partName: 'Business Mathematics',
          hasSubunits: false,
          icaiWeightage: { minPercentage: 2, maxPercentage: 4, typicalMarks: '2-4 Marks' },
          estimatedStudyHours: 5,
          difficulty: 'Easy',
          importance: 'Medium',
          pdfUrl: 'https://resource.cdn.icai.org/88039bos-aps2232-ch3.pdf',
          pdfTitle: 'Chapter 3: Linear Inequalities',
          topics: [
            {
              id: 'qa-top-0301',
              topicNumber: 1,
              isUnit: false,
              title: 'Linear Inequalities',
              estimatedMinutes: 120,
              learningObjectives: [
                'Linear inequalities in one and two variables',
                'Graphical representation of inequalities and finding common feasible region'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: false,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88039bos-aps2232-ch3.pdf',
              pdfTitle: 'Chapter 3: Linear Inequalities'
            }
          ]
        },
        {
          id: 'qa-ch-04',
          chapterNumber: 4,
          title: 'Mathematics of Finance',
          partId: 'part-a',
          partName: 'Business Mathematics',
          hasSubunits: false,
          icaiWeightage: { minPercentage: 12, maxPercentage: 15, typicalMarks: '12-15 Marks' },
          estimatedStudyHours: 18,
          difficulty: 'Hard',
          importance: 'Essential',
          description: 'Simple and Compound Interest, Annuities, Perpetuity, Sinking Fund, Leasing, Capital Expenditure, NPV, and CAGR.',
          pdfUrl: 'https://resource.cdn.icai.org/88040bos-aps2232-ch4.pdf',
          pdfTitle: 'Chapter 4: Mathematics of Finance',
          topics: [
            {
              id: 'qa-top-0401',
              topicNumber: 1,
              isUnit: false,
              title: 'Mathematics of Finance',
              estimatedMinutes: 360,
              learningObjectives: [
                'Simple Interest, Compound Interest, Effective Rate of Interest',
                'Annuity Regular and Annuity Due (Future Value & Present Value)',
                'Perpetuity, Sinking Fund, Valuation of Bonds, Net Present Value (NPV), and CAGR'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: false,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88040bos-aps2232-ch4.pdf',
              pdfTitle: 'Chapter 4: Mathematics of Finance'
            }
          ]
        },
        {
          id: 'qa-ch-05',
          chapterNumber: 5,
          title: 'Basic Concepts of Permutations and Combinations',
          partId: 'part-a',
          partName: 'Business Mathematics',
          hasSubunits: false,
          icaiWeightage: { minPercentage: 4, maxPercentage: 6, typicalMarks: '4-6 Marks' },
          estimatedStudyHours: 8,
          difficulty: 'Hard',
          importance: 'High',
          pdfUrl: 'https://resource.cdn.icai.org/88041bos-aps2232-ch5.pdf',
          pdfTitle: 'Chapter 5: Basic Concepts of Permutations and Combinations',
          topics: [
            {
              id: 'qa-top-0501',
              topicNumber: 1,
              isUnit: false,
              title: 'Basic Concepts of Permutations and Combinations',
              estimatedMinutes: 210,
              learningObjectives: [
                'Fundamental principles of counting (Multiplication and Addition)',
                'Permutations (linear, restricted, and circular permutations)',
                'Combinations, selection of groups, and division into groups'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: false,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88041bos-aps2232-ch5.pdf',
              pdfTitle: 'Chapter 5: Basic Concepts of Permutations and Combinations'
            }
          ]
        },
        {
          id: 'qa-ch-06',
          chapterNumber: 6,
          title: 'Sequence and Series – Arithmetic and Geometric Progressions',
          partId: 'part-a',
          partName: 'Business Mathematics',
          hasSubunits: false,
          icaiWeightage: { minPercentage: 4, maxPercentage: 6, typicalMarks: '4-6 Marks' },
          estimatedStudyHours: 8,
          difficulty: 'Medium',
          importance: 'High',
          pdfUrl: 'https://resource.cdn.icai.org/88042bos-aps2232-ch6.pdf',
          pdfTitle: 'Chapter 6: Sequence and Series',
          topics: [
            {
              id: 'qa-top-0601',
              topicNumber: 1,
              isUnit: false,
              title: 'Sequence and Series – Arithmetic and Geometric Progressions',
              estimatedMinutes: 210,
              learningObjectives: [
                'Arithmetic Progression: nth term, sum of n terms, Arithmetic Mean',
                'Geometric Progression: nth term, sum of n terms, sum to infinity, Geometric Mean',
                'Special series and business applications'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: false,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88042bos-aps2232-ch6.pdf',
              pdfTitle: 'Chapter 6: Sequence and Series'
            }
          ]
        },
        {
          id: 'qa-ch-07',
          chapterNumber: 7,
          title: 'Sets, Relations and Functions, Basics of Limits and Continuity functions',
          partId: 'part-a',
          partName: 'Business Mathematics',
          hasSubunits: false,
          icaiWeightage: { minPercentage: 4, maxPercentage: 6, typicalMarks: '4-6 Marks' },
          estimatedStudyHours: 8,
          difficulty: 'Medium',
          importance: 'Medium',
          pdfUrl: 'https://resource.cdn.icai.org/88043bos-aps2232-ch7.pdf',
          pdfTitle: 'Chapter 7: Sets, Relations and Functions',
          topics: [
            {
              id: 'qa-top-0701',
              topicNumber: 1,
              isUnit: false,
              title: 'Sets, Relations and Functions, Basics of Limits and Continuity functions',
              estimatedMinutes: 210,
              learningObjectives: [
                'Venn diagrams, set operations, De Morgan laws, Cartesian product',
                'Relations: Reflexive, symmetric, transitive, equivalence relations',
                'Functions: Domain, co-domain, range, composite and inverse functions',
                'Intuitive concept of limits and continuity'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: false,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88043bos-aps2232-ch7.pdf',
              pdfTitle: 'Chapter 7: Sets, Relations and Functions'
            }
          ]
        },
        {
          id: 'qa-ch-08',
          chapterNumber: 8,
          title: 'Basic Applications of Differential and Integral Calculus in Business and Economics',
          partId: 'part-a',
          partName: 'Business Mathematics',
          hasSubunits: false,
          icaiWeightage: { minPercentage: 4, maxPercentage: 6, typicalMarks: '4-6 Marks' },
          estimatedStudyHours: 8,
          difficulty: 'Hard',
          importance: 'Medium',
          pdfUrl: 'https://resource.cdn.icai.org/88045bos-aps2232-ch8u2.pdf',
          pdfTitle: 'Chapter 8: Basic Applications of Differential and Integral Calculus',
          topics: [
            {
              id: 'qa-top-0801',
              topicNumber: 1,
              isUnit: false,
              title: 'Basic Applications of Differential and Integral Calculus in Business and Economics',
              estimatedMinutes: 210,
              learningObjectives: [
                'Derivative of standard algebraic, exponential, and logarithmic functions',
                'Marginal cost, marginal revenue, elasticity, and optimisation (maxima/minima)',
                'Indefinite and definite integration, consumer and producer surplus'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: false,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88045bos-aps2232-ch8u2.pdf',
              pdfTitle: 'Chapter 8: Basic Applications of Differential and Integral Calculus'
            }
          ]
        },

        // PART B: Logical Reasoning (20 Marks, Chapters 9-12)
        {
          id: 'qa-ch-09',
          chapterNumber: 9,
          title: 'Number Series, Coding and Decoding and Odd Man Out',
          partId: 'part-b',
          partName: 'Logical Reasoning',
          hasSubunits: false,
          icaiWeightage: { minPercentage: 5, maxPercentage: 5, typicalMarks: '5 Marks' },
          estimatedStudyHours: 6,
          difficulty: 'Easy',
          importance: 'High',
          pdfUrl: 'https://resource.cdn.icai.org/88046bos-aps2232-ch9.pdf',
          pdfTitle: 'Chapter 9: Number Series, Coding and Decoding and Odd Man Out',
          topics: [
            {
              id: 'qa-top-0901',
              topicNumber: 1,
              isUnit: false,
              title: 'Number Series, Coding and Decoding and Odd Man Out',
              estimatedMinutes: 150,
              learningObjectives: [
                'Arithmetic, geometric, and difference series identification',
                'Letter and symbol coding-decoding patterns',
                'Odd-man-out classification'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: false,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88046bos-aps2232-ch9.pdf',
              pdfTitle: 'Chapter 9: Number Series, Coding and Decoding and Odd Man Out'
            }
          ]
        },
        {
          id: 'qa-ch-10',
          chapterNumber: 10,
          title: 'Direction Sense Test',
          partId: 'part-b',
          partName: 'Logical Reasoning',
          hasSubunits: false,
          icaiWeightage: { minPercentage: 5, maxPercentage: 5, typicalMarks: '5 Marks' },
          estimatedStudyHours: 5,
          difficulty: 'Easy',
          importance: 'High',
          pdfUrl: 'https://resource.cdn.icai.org/88047bos-aps2232-ch10.pdf',
          pdfTitle: 'Chapter 10: Direction Sense Test',
          topics: [
            {
              id: 'qa-top-1001',
              topicNumber: 1,
              isUnit: false,
              title: 'Direction Sense Test',
              estimatedMinutes: 120,
              learningObjectives: [
                'Compass directions and degree turns tracking',
                'Shortest distance computation via Pythagoras theorem'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: false,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88047bos-aps2232-ch10.pdf',
              pdfTitle: 'Chapter 10: Direction Sense Test'
            }
          ]
        },
        {
          id: 'qa-ch-11',
          chapterNumber: 11,
          title: 'Seating Arrangements',
          partId: 'part-b',
          partName: 'Logical Reasoning',
          hasSubunits: false,
          icaiWeightage: { minPercentage: 5, maxPercentage: 5, typicalMarks: '5 Marks' },
          estimatedStudyHours: 6,
          difficulty: 'Medium',
          importance: 'High',
          pdfUrl: 'https://resource.cdn.icai.org/88048bos-aps2232-ch11.pdf',
          pdfTitle: 'Chapter 11: Seating Arrangements',
          topics: [
            {
              id: 'qa-top-1101',
              topicNumber: 1,
              isUnit: false,
              title: 'Seating Arrangements',
              estimatedMinutes: 150,
              learningObjectives: [
                'Linear seating arrangements (facing North/South)',
                'Circular seating arrangements (facing center/outwards)'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: false,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88048bos-aps2232-ch11.pdf',
              pdfTitle: 'Chapter 11: Seating Arrangements'
            }
          ]
        },
        {
          id: 'qa-ch-12',
          chapterNumber: 12,
          title: 'Blood Relations',
          partId: 'part-b',
          partName: 'Logical Reasoning',
          hasSubunits: false,
          icaiWeightage: { minPercentage: 5, maxPercentage: 5, typicalMarks: '5 Marks' },
          estimatedStudyHours: 5,
          difficulty: 'Easy',
          importance: 'High',
          pdfUrl: 'https://resource.cdn.icai.org/88049bos-aps2232-ch12.pdf',
          pdfTitle: 'Chapter 12: Blood Relations',
          topics: [
            {
              id: 'qa-top-1201',
              topicNumber: 1,
              isUnit: false,
              title: 'Blood Relations',
              estimatedMinutes: 120,
              learningObjectives: [
                'Family tree diagramming and generational relationships',
                'Deciphering coded relationships and portrait puzzles'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: false,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88049bos-aps2232-ch12.pdf',
              pdfTitle: 'Chapter 12: Blood Relations'
            }
          ]
        },

        // PART C: Statistics (40 Marks, Chapters 13-18)
        {
          id: 'qa-ch-13',
          chapterNumber: 13,
          title: 'Statistical Description of Data and Sampling',
          partId: 'part-c',
          partName: 'Statistics',
          hasSubunits: true,
          icaiWeightage: { minPercentage: 5, maxPercentage: 7, typicalMarks: '5-7 Marks' },
          estimatedStudyHours: 10,
          difficulty: 'Easy',
          importance: 'High',
          description: 'Collection, classification, tabulation, graphical representation of data, and sampling theory.',
          topics: [
            {
              id: 'qa-top-1301',
              topicNumber: 1,
              unitNumber: 1,
              isUnit: true,
              title: 'Unit 1: Statistical Description of Data',
              estimatedMinutes: 120,
              learningObjectives: [
                'Primary vs secondary data, qualitative vs quantitative data',
                'Frequency distribution, class boundaries, and cumulative frequency',
                'Diagrams: Bar charts, pie charts; Graphs: Histograms, frequency polygon, ogives'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88050bos-aps2232-ch13u1.pdf',
              pdfTitle: 'Unit 1: Statistical Description of Data'
            },
            {
              id: 'qa-top-1302',
              topicNumber: 2,
              unitNumber: 2,
              isUnit: true,
              title: 'Unit 2: Sampling',
              estimatedMinutes: 90,
              learningObjectives: [
                'Census vs Sample survey, parameters vs statistics',
                'Random sampling methods (Simple, Stratified, Systematic, Cluster)',
                'Non-random sampling methods and sampling/non-sampling errors'
              ],
              hasPracticalProblems: false,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88051bos-aps2232-ch13u2.pdf',
              pdfTitle: 'Unit 2: Sampling'
            }
          ]
        },
        {
          id: 'qa-ch-14',
          chapterNumber: 14,
          title: 'Measures of Central Tendency and Dispersion',
          partId: 'part-c',
          partName: 'Statistics',
          hasSubunits: true,
          icaiWeightage: { minPercentage: 12, maxPercentage: 16, typicalMarks: '12-16 Marks' },
          estimatedStudyHours: 16,
          difficulty: 'Hard',
          importance: 'Essential',
          description: 'Mean, Median, Mode, Geometric Mean, Harmonic Mean, Range, Quartile Deviation, Mean Deviation, Standard Deviation, and Coefficient of Variation.',
          topics: [
            {
              id: 'qa-top-1401',
              topicNumber: 1,
              unitNumber: 1,
              isUnit: true,
              title: 'Unit 1: Measures of Central Tendency',
              estimatedMinutes: 180,
              learningObjectives: [
                'Arithmetic Mean, Weighted Mean, combined mean properties',
                'Median, partition values (quartiles, deciles, percentiles)',
                'Mode, relationship between Mean, Median, and Mode',
                'Geometric Mean and Harmonic Mean'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88052bos-aps2232-ch14u1.pdf',
              pdfTitle: 'Unit 1: Measures of Central Tendency'
            },
            {
              id: 'qa-top-1402',
              topicNumber: 2,
              unitNumber: 2,
              isUnit: true,
              title: 'Unit 2: Dispersion',
              estimatedMinutes: 180,
              learningObjectives: [
                'Absolute and Relative measures of dispersion',
                'Range, Quartile Deviation (QD), Mean Deviation (MD)',
                'Standard Deviation (SD) properties, variance, and Coefficient of Variation (CV)'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88057bos-aps2232-ch14u2.pdf',
              pdfTitle: 'Unit 2: Dispersion'
            }
          ]
        },
        {
          id: 'qa-ch-15',
          chapterNumber: 15,
          title: 'Probability',
          partId: 'part-c',
          partName: 'Statistics',
          hasSubunits: false,
          icaiWeightage: { minPercentage: 4, maxPercentage: 6, typicalMarks: '4-6 Marks' },
          estimatedStudyHours: 10,
          difficulty: 'Hard',
          importance: 'High',
          pdfUrl: 'https://resource.cdn.icai.org/88053bos-aps2232-ch15.pdf',
          pdfTitle: 'Chapter 15: Probability',
          topics: [
            {
              id: 'qa-top-1501',
              topicNumber: 1,
              isUnit: false,
              title: 'Probability',
              estimatedMinutes: 240,
              learningObjectives: [
                'Random experiments, sample space, mutually exclusive and independent events',
                'Classical, empirical, and axiomatic probability',
                'Addition and multiplication theorems of probability',
                'Conditional probability, Bayes Theorem, and Mathematical Expectation'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88053bos-aps2232-ch15.pdf',
              pdfTitle: 'Chapter 15: Probability'
            }
          ]
        },
        {
          id: 'qa-ch-16',
          chapterNumber: 16,
          title: 'Theoretical Distributions',
          partId: 'part-c',
          partName: 'Statistics',
          hasSubunits: false,
          icaiWeightage: { minPercentage: 4, maxPercentage: 6, typicalMarks: '4-6 Marks' },
          estimatedStudyHours: 10,
          difficulty: 'Hard',
          importance: 'High',
          pdfUrl: 'https://resource.cdn.icai.org/88054bos-aps2232-ch16.pdf',
          pdfTitle: 'Chapter 16: Theoretical Distributions',
          topics: [
            {
              id: 'qa-top-1601',
              topicNumber: 1,
              isUnit: false,
              title: 'Theoretical Distributions',
              estimatedMinutes: 240,
              learningObjectives: [
                'Binomial Distribution: Parameters, properties, mean and variance',
                'Poisson Distribution: Uni-parametric nature, additive property',
                'Normal Distribution: Bell-shaped curve, standard normal variate (Z), area properties'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88054bos-aps2232-ch16.pdf',
              pdfTitle: 'Chapter 16: Theoretical Distributions'
            }
          ]
        },
        {
          id: 'qa-ch-17',
          chapterNumber: 17,
          title: 'Correlation and Regression',
          partId: 'part-c',
          partName: 'Statistics',
          hasSubunits: false,
          icaiWeightage: { minPercentage: 5, maxPercentage: 7, typicalMarks: '5-7 Marks' },
          estimatedStudyHours: 10,
          difficulty: 'Medium',
          importance: 'High',
          pdfUrl: 'https://resource.cdn.icai.org/88055bos-aps2232-ch17.pdf',
          pdfTitle: 'Chapter 17: Correlation and Regression',
          topics: [
            {
              id: 'qa-top-1701',
              topicNumber: 1,
              isUnit: false,
              title: 'Correlation and Regression',
              estimatedMinutes: 240,
              learningObjectives: [
                'Scatter diagram, Karl Pearson coefficient of correlation (r) and its properties',
                'Spearman Rank correlation coefficient with tied/untied ranks',
                'Concurrent deviation method',
                'Regression lines (Y on X, X on Y), regression coefficients (byx, bxy) and properties'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88055bos-aps2232-ch17.pdf',
              pdfTitle: 'Chapter 17: Correlation and Regression'
            }
          ]
        },
        {
          id: 'qa-ch-18',
          chapterNumber: 18,
          title: 'Index Numbers',
          partId: 'part-c',
          partName: 'Statistics',
          hasSubunits: false,
          icaiWeightage: { minPercentage: 4, maxPercentage: 6, typicalMarks: '4-6 Marks' },
          estimatedStudyHours: 8,
          difficulty: 'Medium',
          importance: 'Medium',
          pdfUrl: 'https://resource.cdn.icai.org/88056bos-aps2232-ch18.pdf',
          pdfTitle: 'Chapter 18: Index Numbers',
          topics: [
            {
              id: 'qa-top-1801',
              topicNumber: 1,
              isUnit: false,
              title: 'Index Numbers',
              estimatedMinutes: 180,
              learningObjectives: [
                'Simple and weighted aggregative index numbers (Laspeyres, Paasche, Fisher ideal index)',
                'Tests of adequacy: Time Reversal Test, Factor Reversal Test, Circular Test',
                'Consumer Price Index (CPI), chain base index, base shifting, splicing, deflating'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88056bos-aps2232-ch18.pdf',
              pdfTitle: 'Chapter 18: Index Numbers'
            }
          ]
        }
      ]
    },
    {
      id: 'paper-4-business-economics',
      paperNumber: 4,
      code: 'BECO',
      title: 'Business Economics',
      shortTitle: 'Business Economics',
      type: 'Objective',
      totalMarks: 100,
      estimatedStudyHours: 140,
      color: {
        light: '#F59E0B',
        dark: '#FBBF24',
        theme: 'amber'
      },
      description: 'Applied microeconomics, macroeconomic fundamentals, national income accounting, public finance, monetary policy, international trade, and Indian economy perspectives.',
      chapters: [
        {
          id: 'eco-ch-01',
          chapterNumber: 1,
          title: 'Nature & Scope of Business Economics',
          hasSubunits: true,
          icaiWeightage: { minPercentage: 5, maxPercentage: 10, typicalMarks: '5-10 Marks' },
          estimatedStudyHours: 10,
          difficulty: 'Easy',
          importance: 'Medium',
          description: 'Definition, nature and scope of Business Economics, basic problems of an economy, and role of price mechanism.',
          topics: [
            {
              id: 'eco-top-0101',
              topicNumber: 1,
              unitNumber: 1,
              isUnit: true,
              title: 'Unit 1: Introduction',
              estimatedMinutes: 90,
              learningObjectives: [
                'Micro vs Macro Economics distinctions',
                'Nature of Business Economics: Applied, normative, multidisciplinary, pragmatic'
              ],
              hasPracticalProblems: false,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88059bos-aps2233-ch1u1.pdf',
              pdfTitle: 'Unit 1: Introduction',
              videoUrl: 'https://www.youtube.com/watch?v=7j3k8p5q0w9',
              videoTitle: 'Introduction to Business Economics in One Shot | CA Foundation'
            },
            {
              id: 'eco-top-0102',
              topicNumber: 2,
              unitNumber: 2,
              isUnit: true,
              title: 'Unit 2: Basic Problems of an Economy & Role of Price Mechanism',
              estimatedMinutes: 90,
              learningObjectives: [
                'Central economic problems: What, How, For whom to produce',
                'Capitalist, Socialist, and Mixed Economic systems and role of price mechanism'
              ],
              hasPracticalProblems: false,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88060bos-aps2233-ch1u2.pdf',
              pdfTitle: 'Unit 2: Basic Problems of an Economy & Role of Price Mechanism'
            }
          ]
        },
        {
          id: 'eco-ch-02',
          chapterNumber: 2,
          title: 'Theory of Demand and Supply',
          hasSubunits: true,
          icaiWeightage: { minPercentage: 10, maxPercentage: 15, typicalMarks: '10-15 Marks' },
          estimatedStudyHours: 18,
          difficulty: 'Medium',
          importance: 'High',
          description: 'Law of demand, elasticity of demand, consumer behaviour (cardinal and ordinal approaches), and theory of supply.',
          topics: [
            {
              id: 'eco-top-0201',
              topicNumber: 1,
              unitNumber: 1,
              isUnit: true,
              title: 'Unit 1: Law of Demand and Elasticity of Demand',
              estimatedMinutes: 120,
              learningObjectives: [
                'Law of Demand and reasons behind downward sloping demand curve',
                'Price, Income, and Cross Elasticity of Demand (Point, Arc, Total Outlay methods)',
                'Demand forecasting methods'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88061bos-aps2233-ch2u1.pdf',
              pdfTitle: 'Unit 1: Law of Demand and Elasticity of Demand',
              videoUrl: 'https://www.youtube.com/watch?v=3n8m2p5q1w0',
              videoTitle: 'Demand and Elasticity in One Shot | CA Foundation Economics'
            },
            {
              id: 'eco-top-0202',
              topicNumber: 2,
              unitNumber: 2,
              isUnit: true,
              title: 'Unit 2: Theory of Consumer Behaviour',
              estimatedMinutes: 120,
              learningObjectives: [
                'Cardinal Utility Analysis: Law of Diminishing Marginal Utility, Consumer Surplus',
                'Ordinal Approach: Indifference curves properties, budget line, consumer equilibrium'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88062bos-aps2233-ch2u2.pdf',
              pdfTitle: 'Unit 2: Theory of Consumer Behaviour'
            },
            {
              id: 'eco-top-0203',
              topicNumber: 3,
              unitNumber: 3,
              isUnit: true,
              title: 'Unit 3: Supply',
              estimatedMinutes: 90,
              learningObjectives: [
                'Law of Supply, determinants of supply, shifts in supply curve',
                'Elasticity of supply computation and determinants'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88063bos-aps2233-ch2u3.pdf',
              pdfTitle: 'Unit 3: Supply'
            }
          ]
        },
        {
          id: 'eco-ch-03',
          chapterNumber: 3,
          title: 'Theory of Production and Cost',
          hasSubunits: true,
          icaiWeightage: { minPercentage: 10, maxPercentage: 15, typicalMarks: '10-15 Marks' },
          estimatedStudyHours: 16,
          difficulty: 'Medium',
          importance: 'High',
          description: 'Production function, Law of Variable Proportions, Returns to Scale, short-run and long-run cost curves.',
          topics: [
            {
              id: 'eco-top-0301',
              topicNumber: 1,
              unitNumber: 1,
              isUnit: true,
              title: 'Unit 1: Theory of Production',
              estimatedMinutes: 120,
              learningObjectives: [
                'Factors of production (Land, Labour, Capital, Entrepreneur)',
                'Short-run production function: Law of Variable Proportions (TP, MP, AP)',
                'Long-run production function: Returns to Scale and Isoquants'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88064bos-aps2233-ch3u1.pdf',
              pdfTitle: 'Unit 1: Theory of Production',
              videoUrl: 'https://www.youtube.com/watch?v=9v6b3n2m1p0',
              videoTitle: 'Production and Cost in One Shot | CA Foundation Economics'
            },
            {
              id: 'eco-top-0302',
              topicNumber: 2,
              unitNumber: 2,
              isUnit: true,
              title: 'Unit 2: Theory of Cost',
              estimatedMinutes: 120,
              learningObjectives: [
                'Accounting vs Economic Cost, Explicit vs Implicit Cost, Sunk Cost, Opportunity Cost',
                'Short-run cost curves: TFC, TVC, TC, AFC, AVC, ATC, MC relationships',
                'Long-run average cost curve (Planning Curve / Envelope Curve)'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88065bos-aps2233-ch3u2.pdf',
              pdfTitle: 'Unit 2: Theory of Cost'
            }
          ]
        },
        {
          id: 'eco-ch-04',
          chapterNumber: 4,
          title: 'Price Determination in Different Markets',
          hasSubunits: true,
          icaiWeightage: { minPercentage: 10, maxPercentage: 15, typicalMarks: '10-15 Marks' },
          estimatedStudyHours: 18,
          difficulty: 'Hard',
          importance: 'High',
          description: 'Market structures, price and output equilibrium under Perfect Competition, Monopoly, Monopolistic Competition, and Oligopoly.',
          topics: [
            {
              id: 'eco-top-0401',
              topicNumber: 1,
              unitNumber: 1,
              isUnit: true,
              title: 'Unit 1: Meaning and Types of Markets',
              estimatedMinutes: 90,
              learningObjectives: [
                'Elements and classification of markets',
                'Revenue concepts: Total Revenue (TR), Average Revenue (AR), Marginal Revenue (MR) relationships'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88066bos-aps2233-ch4u1.pdf',
              pdfTitle: 'Unit 1: Meaning and Types of Markets',
              videoUrl: 'https://www.youtube.com/watch?v=1p2q3w4e5r6',
              videoTitle: 'Market Forms & Price Determination in One Shot | CA Foundation'
            },
            {
              id: 'eco-top-0402',
              topicNumber: 2,
              unitNumber: 2,
              isUnit: true,
              title: 'Unit 2: Determination of Prices',
              estimatedMinutes: 75,
              learningObjectives: [
                'Equilibrium price determination through interaction of market demand and market supply',
                'Effects of simultaneous shifts in demand and supply curves'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88067bos-aps2233-ch4u2.pdf',
              pdfTitle: 'Unit 2: Determination of Prices'
            },
            {
              id: 'eco-top-0403',
              topicNumber: 3,
              unitNumber: 3,
              isUnit: true,
              title: 'Unit 3: Price Output Determination under Different Market Forms',
              estimatedMinutes: 150,
              learningObjectives: [
                'Equilibrium of firm and industry under Perfect Competition in short-run and long-run',
                'Monopoly: Equilibrium and Price Discrimination (Degrees of price discrimination)',
                'Monopolistic Competition: Product differentiation and excess capacity',
                'Oligopoly: Kinked demand curve, price leadership, cartel models'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88068bos-aps2233-ch4u3.pdf',
              pdfTitle: 'Unit 3: Price Output Determination under Different Market Forms'
            }
          ]
        },
        {
          id: 'eco-ch-05',
          chapterNumber: 5,
          title: 'Business Cycles',
          hasSubunits: false,
          icaiWeightage: { minPercentage: 5, maxPercentage: 10, typicalMarks: '5-10 Marks' },
          estimatedStudyHours: 8,
          difficulty: 'Easy',
          importance: 'High',
          description: 'Phases of business cycles (Expansion, Peak, Contraction, Trough), characteristics, internal and external causes of economic fluctuations.',
          pdfUrl: 'https://resource.cdn.icai.org/88069bos-aps2233-ch5.pdf',
          pdfTitle: 'Chapter 5: Business Cycles',
          topics: [
            {
              id: 'eco-top-0501',
              topicNumber: 1,
              isUnit: false,
              title: 'Business Cycles',
              estimatedMinutes: 180,
              learningObjectives: [
                'Meaning and phases of Business Cycles: Expansion, Peak, Contraction (Recession/Depression), Trough',
                'Leading, lagging, and coincident economic indicators',
                'Internal causes (Investment fluctuations, monetary policy, psychological factors) and external causes (Wars, technological shocks, natural factors)',
                'Theories of business cycles (Schumpeter, Keynes, Hawtrey, Hayek)'
              ],
              hasPracticalProblems: false,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88069bos-aps2233-ch5.pdf',
              pdfTitle: 'Chapter 5: Business Cycles'
            }
          ]
        },
        {
          id: 'eco-ch-06',
          chapterNumber: 6,
          title: 'Determination of National Income',
          hasSubunits: true,
          icaiWeightage: { minPercentage: 10, maxPercentage: 15, typicalMarks: '10-15 Marks' },
          estimatedStudyHours: 16,
          difficulty: 'Hard',
          importance: 'Essential',
          description: 'National Income aggregates, methods of measurement, and Keynesian theory of determination of national income.',
          topics: [
            {
              id: 'eco-top-0601',
              topicNumber: 1,
              unitNumber: 1,
              isUnit: true,
              title: 'Unit 1: National Income Accounting',
              estimatedMinutes: 120,
              learningObjectives: [
                'Aggregates of National Income: GDP, GNP, NDP, NNP at Market Price and Factor Cost',
                'Personal Income, Disposable Income, Real vs Nominal GDP, GDP deflator',
                'Three measurement methods: Value Added (Product), Income, and Expenditure methods'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88070bos-aps2233-ch6u1.pdf',
              pdfTitle: 'Unit 1: National Income Accounting'
            },
            {
              id: 'eco-top-0602',
              topicNumber: 2,
              unitNumber: 2,
              isUnit: true,
              title: 'Unit 2: The Keynesian Theory of Determination of National Income',
              estimatedMinutes: 120,
              learningObjectives: [
                'Two-sector, three-sector, and four-sector model of income determination',
                'Consumption function, Marginal Propensity to Consume (MPC), MPS',
                'Investment multiplier and government expenditure multiplier'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88071bos-aps2233-ch6u2.pdf',
              pdfTitle: 'Unit 2: The Keynesian Theory of Determination of National Income'
            }
          ]
        },
        {
          id: 'eco-ch-07',
          chapterNumber: 7,
          title: 'Public Finance',
          hasSubunits: true,
          icaiWeightage: { minPercentage: 10, maxPercentage: 15, typicalMarks: '10-15 Marks' },
          estimatedStudyHours: 16,
          difficulty: 'Medium',
          importance: 'High',
          description: 'Fiscal functions, market failure, government intervention, budget making, public debt, and fiscal policy.',
          topics: [
            {
              id: 'eco-top-0701',
              topicNumber: 1,
              unitNumber: 1,
              isUnit: true,
              title: 'Unit 1: Fiscal Functions: An Overview, Centre and State Finance',
              estimatedMinutes: 75,
              learningObjectives: [
                'Musgrave three fiscal functions: Allocation, Distribution, and Stabilisation',
                'Division of financial powers between Centre and States in India'
              ],
              hasPracticalProblems: false,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88072bos-aps2233-ch7u1.pdf',
              pdfTitle: 'Unit 1: Fiscal Functions: An Overview, Centre and State Finance',
              videoUrl: 'https://www.youtube.com/watch?v=8m9n0b1v2c3',
              videoTitle: 'Public Finance in One Shot | CA Foundation Economics'
            },
            {
              id: 'eco-top-0702',
              topicNumber: 2,
              unitNumber: 2,
              isUnit: true,
              title: 'Unit 2: Market Failure/ Government intervention to correct Market Failure',
              estimatedMinutes: 90,
              learningObjectives: [
                'Sources of market failure: Market power, Externalities, Public goods, Asymmetric information',
                'Government corrective instruments: Pigouvian taxes, subsidies, price regulation'
              ],
              hasPracticalProblems: false,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88073bos-aps2233-ch7u2.pdf',
              pdfTitle: 'Unit 2: Market Failure/ Government intervention'
            },
            {
              id: 'eco-top-0703',
              topicNumber: 3,
              unitNumber: 3,
              isUnit: true,
              title: 'Unit 3: The Process of Budget Making: Sources of Revenue, Expenditure Management and Management of Public Debt',
              estimatedMinutes: 90,
              learningObjectives: [
                'Union Budget preparation, Revenue vs Capital Budget',
                'Fiscal deficit, Revenue deficit, Primary deficit calculations and implications',
                'Public debt management and FRBM Act guidelines'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88074bos-aps2233-ch7u3.pdf',
              pdfTitle: 'Unit 3: The Process of Budget Making'
            },
            {
              id: 'eco-top-0704',
              topicNumber: 4,
              unitNumber: 4,
              isUnit: true,
              title: 'Unit 4: Fiscal Policy',
              estimatedMinutes: 75,
              learningObjectives: [
                'Objectives of Fiscal Policy: Economic growth, price stability, resource allocation',
                'Automatic stabilisers vs Discretionary fiscal policy',
                'Expansionary and Contractionary fiscal measures and limitations'
              ],
              hasPracticalProblems: false,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88075bos-aps2233-ch7u4.pdf',
              pdfTitle: 'Unit 4: Fiscal Policy'
            }
          ]
        },
        {
          id: 'eco-ch-08',
          chapterNumber: 8,
          title: 'Money Market',
          hasSubunits: true,
          icaiWeightage: { minPercentage: 10, maxPercentage: 15, typicalMarks: '10-15 Marks' },
          estimatedStudyHours: 14,
          difficulty: 'Medium',
          importance: 'High',
          description: 'Money demand theories, money supply measures, credit creation, and monetary policy instruments.',
          topics: [
            {
              id: 'eco-top-0801',
              topicNumber: 1,
              unitNumber: 1,
              isUnit: true,
              title: 'Unit 1: The Concept of Money Demand: Important Theories',
              estimatedMinutes: 75,
              learningObjectives: [
                'Classical Quantity Theory of Money (Fisher Equation and Cambridge Approach)',
                'Keynesian Liquidity Preference Theory (Transactions, Precautionary, Speculative motives)',
                'Friedman modern quantity theory'
              ],
              hasPracticalProblems: false,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88076bos-aps2233-ch8u1.pdf',
              pdfTitle: 'Unit 1: The Concept of Money Demand',
              videoUrl: 'https://www.youtube.com/watch?v=5r6t7y8u9i0',
              videoTitle: 'Money Market in One Shot | CA Foundation Economics'
            },
            {
              id: 'eco-top-0802',
              topicNumber: 2,
              unitNumber: 2,
              isUnit: true,
              title: 'Unit 2: The Concept of Money Supply',
              estimatedMinutes: 75,
              learningObjectives: [
                'Monetary aggregates of RBI: M1, M2, M3, M4, Reserve Money (M0)',
                'Determinants of money supply, High Powered Money, Money Multiplier',
                'Emergence of digital currency and cryptocurrency terminology'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88077bos-aps2233-ch8u2.pdf',
              pdfTitle: 'Unit 2: The Concept of Money Supply'
            },
            {
              id: 'eco-top-0803',
              topicNumber: 3,
              unitNumber: 3,
              isUnit: true,
              title: 'Unit 3: Monetary Policy',
              estimatedMinutes: 90,
              learningObjectives: [
                'Monetary Policy Framework in India: Monetary Policy Committee (MPC)',
                'Quantitative tools: Repo Rate, Reverse Repo Rate, SDF, MSF, Bank Rate, CRR, SLR, Open Market Operations (OMO)',
                'Qualitative tools: Margin requirements, moral suasion, credit rationing'
              ],
              hasPracticalProblems: false,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88078bos-aps2233-ch8u3.pdf',
              pdfTitle: 'Unit 3: Monetary Policy'
            }
          ]
        },
        {
          id: 'eco-ch-09',
          chapterNumber: 9,
          title: 'International Trade',
          hasSubunits: true,
          icaiWeightage: { minPercentage: 10, maxPercentage: 15, typicalMarks: '10-15 Marks' },
          estimatedStudyHours: 16,
          difficulty: 'Hard',
          importance: 'High',
          description: 'Theories of international trade, trade policy instruments (tariffs, quotas), trade negotiations, exchange rates, and capital flows.',
          topics: [
            {
              id: 'eco-top-0901',
              topicNumber: 1,
              unitNumber: 1,
              isUnit: true,
              title: 'Unit 1: Theories of International Trade',
              estimatedMinutes: 90,
              learningObjectives: [
                'Mercantilism, Adam Smith Absolute Advantage Theory',
                'David Ricardo Comparative Advantage Theory, Heckscher-Ohlin Theory',
                'Modern Intra-industry trade theories'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88079bos-aps2233-ch9u1.pdf',
              pdfTitle: 'Unit 1: Theories of International Trade',
              videoUrl: 'https://www.youtube.com/watch?v=2m3n4b5v6c7',
              videoTitle: 'International Trade in One Shot | CA Foundation Economics'
            },
            {
              id: 'eco-top-0902',
              topicNumber: 2,
              unitNumber: 2,
              isUnit: true,
              title: 'Unit 2: The Instruments of Trade Policy',
              estimatedMinutes: 75,
              learningObjectives: [
                'Tariffs: Specific, ad-valorem, compound, protective tariffs',
                'Non-tariff measures: Import quotas, Voluntary Export Restraints (VER), SPS/TBT regulations'
              ],
              hasPracticalProblems: false,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88080bos-aps2233-ch9u2.pdf',
              pdfTitle: 'Unit 2: The Instruments of Trade Policy'
            },
            {
              id: 'eco-top-0903',
              topicNumber: 3,
              unitNumber: 3,
              isUnit: true,
              title: 'Unit 3: Trade Negotiations',
              estimatedMinutes: 60,
              learningObjectives: [
                'Evolution from GATT to World Trade Organization (WTO)',
                'Principles of WTO: MFN principle, National Treatment',
                'Regional Trade Agreements (RTAs), Free Trade Areas, Customs Unions'
              ],
              hasPracticalProblems: false,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88081bos-aps2233-ch9u3.pdf',
              pdfTitle: 'Unit 3: Trade Negotiations'
            },
            {
              id: 'eco-top-0904',
              topicNumber: 4,
              unitNumber: 4,
              isUnit: true,
              title: 'Unit 4: Exchange Rate and Its Economic Effects',
              estimatedMinutes: 90,
              learningObjectives: [
                'Nominal vs Real Exchange Rate (NER, RER, REER)',
                'Fixed vs Floating exchange rate regimes',
                'Economic effects of exchange rate depreciation/appreciation'
              ],
              hasPracticalProblems: true,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88082bos-aps2233-ch9u4.pdf',
              pdfTitle: 'Unit 4: Exchange Rate and Its Economic Effects'
            },
            {
              id: 'eco-top-0905',
              topicNumber: 5,
              unitNumber: 5,
              isUnit: true,
              title: 'Unit 5: International Capital Movements',
              estimatedMinutes: 75,
              learningObjectives: [
                'Foreign Direct Investment (FDI) vs Foreign Portfolio Investment (FPI)',
                'Motives and economic impacts of international capital flows on host nations'
              ],
              hasPracticalProblems: false,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88083bos-aps2233-ch9u5.pdf',
              pdfTitle: 'Unit 5: International Capital Movements'
            }
          ]
        },
        {
          id: 'eco-ch-10',
          chapterNumber: 10,
          title: 'Indian Economy',
          hasSubunits: false,
          icaiWeightage: { minPercentage: 10, maxPercentage: 15, typicalMarks: '10-15 Marks' },
          estimatedStudyHours: 12,
          difficulty: 'Medium',
          importance: 'High',
          description: 'Pre-independence legacy, sectoral growth (Agriculture, Industry, Services), economic reforms of 1991, NITI Aayog, and contemporary Indian economic initiatives.',
          pdfUrl: 'https://resource.cdn.icai.org/88084bos-aps2233-ch10.pdf',
          pdfTitle: 'Chapter 10: Indian Economy',
          topics: [
            {
              id: 'eco-top-1001',
              topicNumber: 1,
              isUnit: false,
              title: 'Indian Economy',
              estimatedMinutes: 240,
              learningObjectives: [
                'Major features and evolution of Indian economy from pre-independence to modern era',
                'Sectoral composition and structural transformation (Primary, Secondary, Tertiary)',
                'Economic reforms of 1991: Liberalisation, Privatisation, Globalisation (LPG)',
                'NITI Aayog role, contemporary developmental initiatives, and future growth drivers'
              ],
              hasPracticalProblems: false,
              hasTheoryQuestions: true,
              revisionCycleDefaultDays: [1, 7, 21, 45],
              pdfUrl: 'https://resource.cdn.icai.org/88084bos-aps2233-ch10.pdf',
              pdfTitle: 'Chapter 10: Indian Economy'
            }
          ]
        }
      ]
    }
  ]
};

const outputPath = path.join(__dirname, '..', 'src', 'data', 'syllabus_blueprint.json');
fs.writeFileSync(outputPath, JSON.stringify(blueprint, null, 2), 'utf-8');

console.log('Successfully wrote authoritative syllabus blueprint to:', outputPath);

let totalChapters = 0;
let totalTopics = 0;
blueprint.subjects.forEach(sub => {
  totalChapters += sub.chapters.length;
  const subTopics = sub.chapters.reduce((sum, ch) => sum + ch.topics.length, 0);
  totalTopics += subTopics;
  console.log(`${sub.code} (${sub.title}): ${sub.chapters.length} chapters, ${subTopics} units/topics`);
});
console.log(`GRAND TOTAL: ${totalChapters} chapters, ${totalTopics} units/topics`);

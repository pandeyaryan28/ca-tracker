import fs from 'fs';
import path from 'path';

const blueprintPath = path.resolve('src/data/syllabus_blueprint.json');
const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));

// Authoritative ICAI May 2026 Onwards PDF Links Map
const chapterPdfMap: Record<string, { pdfUrl: string; pdfTitle?: string }> = {
  // Paper 1: Accounting
  'acc-ch-01': { pdfUrl: 'https://resource.cdn.icai.org/88093bos-aps2240-ch1u1.pdf', pdfTitle: 'Ch 1: Theoretical Framework' },
  'acc-ch-02': { pdfUrl: 'https://resource.cdn.icai.org/88100bos-aps2240-ch2u1.pdf', pdfTitle: 'Ch 2: Accounting Process' },
  'acc-ch-03': { pdfUrl: 'https://resource.cdn.icai.org/88106bos-aps2240-ch3.pdf', pdfTitle: 'Ch 3: Bank Reconciliation Statement' },
  'acc-ch-04': { pdfUrl: 'https://resource.cdn.icai.org/88107bos-aps2240-ch4.pdf', pdfTitle: 'Ch 4: Inventories' },
  'acc-ch-05': { pdfUrl: 'https://resource.cdn.icai.org/88108bos-aps2240-ch5.pdf', pdfTitle: 'Ch 5: Depreciation and Amortisation' },
  'acc-ch-06': { pdfUrl: 'https://resource.cdn.icai.org/88109bos-aps2240-ch6.pdf', pdfTitle: 'Ch 6: Bills of Exchange and Promissory Notes' },
  'acc-ch-07': { pdfUrl: 'https://resource.cdn.icai.org/88110bos-aps2240-ch7u1.pdf', pdfTitle: 'Ch 7: Preparation of Final Accounts of Sole Proprietors' },
  'acc-ch-08': { pdfUrl: 'https://resource.cdn.icai.org/88115bos-aps2240-ch8.pdf', pdfTitle: 'Ch 8: Financial Statements of Not-for-Profit Organisations' },
  'acc-ch-09': { pdfUrl: 'https://resource.cdn.icai.org/88116bos-aps2240-ch9.pdf', pdfTitle: 'Ch 9: Accounts from Incomplete Records' },
  'acc-ch-10': { pdfUrl: 'https://resource.cdn.icai.org/88117bos-aps2240-ch10u1.pdf', pdfTitle: 'Ch 10: Partnership and LLP Accounts' },
  'acc-ch-11': { pdfUrl: 'https://resource.cdn.icai.org/88134bos-aps2240-ch11u1.pdf', pdfTitle: 'Ch 11: Company Accounts' },

  // Paper 2: Business Laws
  'law-ch-01': { pdfUrl: 'https://resource.cdn.icai.org/88015bos-aps2231-ch1.pdf', pdfTitle: 'Ch 1: Indian Regulatory Framework' },
  'law-ch-02': { pdfUrl: 'https://resource.cdn.icai.org/88017bos-aps2231-ch2u1.pdf', pdfTitle: 'Ch 2: The Indian Contract Act, 1872' },
  'law-ch-03': { pdfUrl: 'https://resource.cdn.icai.org/88026bos-aps2231-ch3u1.pdf', pdfTitle: 'Ch 3: The Sale of Goods Act, 1930' },
  'law-ch-04': { pdfUrl: 'https://resource.cdn.icai.org/88030bos-aps2231-ch4u1.pdf', pdfTitle: 'Ch 4: The Indian Partnership Act, 1932' },
  'law-ch-05': { pdfUrl: 'https://resource.cdn.icai.org/88033bos-aps2231-ch5.pdf', pdfTitle: 'Ch 5: The Limited Liability Partnership Act, 2008' },
  'law-ch-06': { pdfUrl: 'https://resource.cdn.icai.org/88034bos-aps2231-ch6.pdf', pdfTitle: 'Ch 6: The Companies Act, 2013' },
  'law-ch-07': { pdfUrl: 'https://resource.cdn.icai.org/88035bos-aps2231-ch7.pdf', pdfTitle: 'Ch 7: The Negotiable Instruments Act, 1881' },

  // Paper 3: Quantitative Aptitude
  'qa-ch-01': { pdfUrl: 'https://resource.cdn.icai.org/88037bos-aps2232-ch1.pdf', pdfTitle: 'Ch 1: Ratio and Proportion, Indices, Logarithms' },
  'qa-ch-02': { pdfUrl: 'https://resource.cdn.icai.org/88038bos-aps2232-ch2.pdf', pdfTitle: 'Ch 2: Equations' },
  'qa-ch-03': { pdfUrl: 'https://resource.cdn.icai.org/88039bos-aps2232-ch3.pdf', pdfTitle: 'Ch 3: Linear Inequalities' },
  'qa-ch-04': { pdfUrl: 'https://resource.cdn.icai.org/88040bos-aps2232-ch4.pdf', pdfTitle: 'Ch 4: Mathematics of Finance' },
  'qa-ch-05': { pdfUrl: 'https://resource.cdn.icai.org/88041bos-aps2232-ch5.pdf', pdfTitle: 'Ch 5: Basic Concepts of Permutations and Combinations' },
  'qa-ch-06': { pdfUrl: 'https://resource.cdn.icai.org/88042bos-aps2232-ch6.pdf', pdfTitle: 'Ch 6: Sequence and Series - AP and GP' },
  'qa-ch-07': { pdfUrl: 'https://resource.cdn.icai.org/88043bos-aps2232-ch7.pdf', pdfTitle: 'Ch 7: Sets, Relations and Functions' },
  'qa-ch-08': { pdfUrl: 'https://resource.cdn.icai.org/88045bos-aps2232-ch8u2.pdf', pdfTitle: 'Ch 8: Basic Applications of Differential and Integral Calculus' },
  'qa-ch-09': { pdfUrl: 'https://resource.cdn.icai.org/88046bos-aps2232-ch9.pdf', pdfTitle: 'Ch 9: Number Series, Coding and Decoding and Odd Man Out' },
  'qa-ch-10': { pdfUrl: 'https://resource.cdn.icai.org/88047bos-aps2232-ch10.pdf', pdfTitle: 'Ch 10: Direction Sense Test' },
  'qa-ch-11': { pdfUrl: 'https://resource.cdn.icai.org/88048bos-aps2232-ch11.pdf', pdfTitle: 'Ch 11: Seating Arrangements' },
  'qa-ch-12': { pdfUrl: 'https://resource.cdn.icai.org/88049bos-aps2232-ch12.pdf', pdfTitle: 'Ch 12: Blood Relations' },
  'qa-ch-13': { pdfUrl: 'https://resource.cdn.icai.org/88050bos-aps2232-ch13u1.pdf', pdfTitle: 'Ch 13: Statistical Description of Data & Sampling' },
  'qa-ch-14': { pdfUrl: 'https://resource.cdn.icai.org/88052bos-aps2232-ch14u1.pdf', pdfTitle: 'Ch 14: Measures of Central Tendency and Dispersion' },
  'qa-ch-15': { pdfUrl: 'https://resource.cdn.icai.org/88053bos-aps2232-ch15.pdf', pdfTitle: 'Ch 15: Probability' },
  'qa-ch-16': { pdfUrl: 'https://resource.cdn.icai.org/88054bos-aps2232-ch16.pdf', pdfTitle: 'Ch 16: Theoretical Distributions' },
  'qa-ch-17': { pdfUrl: 'https://resource.cdn.icai.org/88055bos-aps2232-ch17.pdf', pdfTitle: 'Ch 17: Correlation and Regression' },
  'qa-ch-18': { pdfUrl: 'https://resource.cdn.icai.org/88056bos-aps2232-ch18.pdf', pdfTitle: 'Ch 18: Index Numbers' },

  // Paper 4: Business Economics
  'eco-ch-01': { pdfUrl: 'https://resource.cdn.icai.org/88059bos-aps2233-ch1u1.pdf', pdfTitle: 'Ch 1: Nature & Scope of Business Economics' },
  'eco-ch-02': { pdfUrl: 'https://resource.cdn.icai.org/88061bos-aps2233-ch2u1.pdf', pdfTitle: 'Ch 2: Theory of Demand and Supply' },
  'eco-ch-03': { pdfUrl: 'https://resource.cdn.icai.org/88064bos-aps2233-ch3u1.pdf', pdfTitle: 'Ch 3: Theory of Production and Cost' },
  'eco-ch-04': { pdfUrl: 'https://resource.cdn.icai.org/88066bos-aps2233-ch4u1.pdf', pdfTitle: 'Ch 4: Price Determination in Different Markets' },
  'eco-ch-05': { pdfUrl: 'https://resource.cdn.icai.org/88070bos-aps2233-ch6u1.pdf', pdfTitle: 'Ch 5: Determination of National Income' },
  'eco-ch-06': { pdfUrl: 'https://resource.cdn.icai.org/88072bos-aps2233-ch7u1.pdf', pdfTitle: 'Ch 6: Public Finance' },
  'eco-ch-07': { pdfUrl: 'https://resource.cdn.icai.org/88076bos-aps2233-ch8u1.pdf', pdfTitle: 'Ch 7: Money Market' },
  'eco-ch-08': { pdfUrl: 'https://resource.cdn.icai.org/88079bos-aps2233-ch9u1.pdf', pdfTitle: 'Ch 8: International Trade' },
  'eco-ch-09': { pdfUrl: 'https://resource.cdn.icai.org/88084bos-aps2233-ch10.pdf', pdfTitle: 'Ch 9: Indian Economy' },
};

// Unit-level specific PDF links
const topicPdfMap: Record<string, { pdfUrl: string; pdfTitle?: string }> = {
  // Paper 1: Chapter 1 Units
  'acc-top-0101': { pdfUrl: 'https://resource.cdn.icai.org/88093bos-aps2240-ch1u1.pdf', pdfTitle: 'Unit 1: Meaning and Scope of Accounting' },
  'acc-top-0102': { pdfUrl: 'https://resource.cdn.icai.org/88094bos-aps2240-ch1u2.pdf', pdfTitle: 'Unit 2: Accounting Concepts, Principles and Conventions' },
  'acc-top-0103': { pdfUrl: 'https://resource.cdn.icai.org/88095bos-aps2240-ch1u3.pdf', pdfTitle: 'Unit 3: Capital and Revenue Expenditures and Receipts' },
  'acc-top-0104': { pdfUrl: 'https://resource.cdn.icai.org/88096bos-aps2240-ch1u4.pdf', pdfTitle: 'Unit 4: Contingent Assets and Contingent Liabilities' },
  'acc-top-0105': { pdfUrl: 'https://resource.cdn.icai.org/88097bos-aps2240-ch1u5.pdf', pdfTitle: 'Unit 5: Accounting Policies' },
  'acc-top-0106': { pdfUrl: 'https://resource.cdn.icai.org/88098bos-aps2240-ch1u6.pdf', pdfTitle: 'Unit 6: Accounting as a Measurement Discipline' },
  'acc-top-0107': { pdfUrl: 'https://resource.cdn.icai.org/88099bos-aps2240-ch1u7.pdf', pdfTitle: 'Unit 7: Accounting Standards' },

  // Paper 1: Chapter 2 Units
  'acc-top-0201': { pdfUrl: 'https://resource.cdn.icai.org/88100bos-aps2240-ch2u1.pdf', pdfTitle: 'Unit 1: Basic Accounting Procedures – Journal entries' },
  'acc-top-0202': { pdfUrl: 'https://resource.cdn.icai.org/88101bos-aps2240-ch2u2.pdf', pdfTitle: 'Unit 2: Ledgers' },
  'acc-top-0203': { pdfUrl: 'https://resource.cdn.icai.org/88102bos-aps2240-ch2u3.pdf', pdfTitle: 'Unit 3: Trial Balance' },
  'acc-top-0204': { pdfUrl: 'https://resource.cdn.icai.org/88103bos-aps2240-ch2u4.pdf', pdfTitle: 'Unit 4: Subsidiary Books' },
  'acc-top-0205': { pdfUrl: 'https://resource.cdn.icai.org/88104bos-aps2240-ch2u5.pdf', pdfTitle: 'Unit 5: Cash Book' },
  'acc-top-0206': { pdfUrl: 'https://resource.cdn.icai.org/88105bos-aps2240-ch2u6.pdf', pdfTitle: 'Unit 6: Rectification of Errors' },

  // Paper 1: Chapter 3, 4, 5, 6
  'acc-top-0301': { pdfUrl: 'https://resource.cdn.icai.org/88106bos-aps2240-ch3.pdf', pdfTitle: 'Ch 3: Bank Reconciliation Statement' },
  'acc-top-0302': { pdfUrl: 'https://resource.cdn.icai.org/88106bos-aps2240-ch3.pdf', pdfTitle: 'Ch 3: Bank Reconciliation Statement (Adjusted Cash Book)' },
  'acc-top-0401': { pdfUrl: 'https://resource.cdn.icai.org/88107bos-aps2240-ch4.pdf', pdfTitle: 'Ch 4: Inventories Valuation' },
  'acc-top-0402': { pdfUrl: 'https://resource.cdn.icai.org/88107bos-aps2240-ch4.pdf', pdfTitle: 'Ch 4: Inventory Systems (Periodic & Perpetual)' },
  'acc-top-0501': { pdfUrl: 'https://resource.cdn.icai.org/88108bos-aps2240-ch5.pdf', pdfTitle: 'Ch 5: Depreciation Concepts & Methods' },
  'acc-top-0502': { pdfUrl: 'https://resource.cdn.icai.org/88108bos-aps2240-ch5.pdf', pdfTitle: 'Ch 5: Accounting Treatment of Depreciation' },
  'acc-top-0601': { pdfUrl: 'https://resource.cdn.icai.org/88109bos-aps2240-ch6.pdf', pdfTitle: 'Ch 6: Bills of Exchange & Promissory Notes' },
  'acc-top-0602': { pdfUrl: 'https://resource.cdn.icai.org/88109bos-aps2240-ch6.pdf', pdfTitle: 'Ch 6: Accommodation Bills & Insolvency' },

  // Paper 1: Chapter 7 Units
  'acc-top-0701': { pdfUrl: 'https://resource.cdn.icai.org/88110bos-aps2240-ch7u1.pdf', pdfTitle: 'Unit 1: Final Accounts of Non-Manufacturing Entities' },
  'acc-top-0702': { pdfUrl: 'https://resource.cdn.icai.org/88111bos-aps2240-ch7u2.pdf', pdfTitle: 'Unit 2: Final Accounts of Manufacturing Entities' },

  // Paper 1: Chapter 8 & 9
  'acc-top-0801': { pdfUrl: 'https://resource.cdn.icai.org/88115bos-aps2240-ch8.pdf', pdfTitle: 'Ch 8: Not-for-Profit Organisations (Receipts & Payments, Income & Expenditure)' },
  'acc-top-0802': { pdfUrl: 'https://resource.cdn.icai.org/88115bos-aps2240-ch8.pdf', pdfTitle: 'Ch 8: NPO Balance Sheet & Special Funds' },
  'acc-top-0901': { pdfUrl: 'https://resource.cdn.icai.org/88116bos-aps2240-ch9.pdf', pdfTitle: 'Ch 9: Single Entry System & Statement of Affairs' },
  'acc-top-0902': { pdfUrl: 'https://resource.cdn.icai.org/88116bos-aps2240-ch9.pdf', pdfTitle: 'Ch 9: Incomplete Records to Double Entry Conversion' },

  // Paper 1: Chapter 10 Units
  'acc-top-1001': { pdfUrl: 'https://resource.cdn.icai.org/88117bos-aps2240-ch10u1.pdf', pdfTitle: 'Unit 1: Introduction to Partnership Accounts' },
  'acc-top-1002': { pdfUrl: 'https://resource.cdn.icai.org/88118bos-aps2240-ch10u2.pdf', pdfTitle: 'Unit 2: Treatment of Goodwill in Partnership Accounts' },
  'acc-top-1003': { pdfUrl: 'https://resource.cdn.icai.org/88119bos-aps2240-ch10u3.pdf', pdfTitle: 'Unit 3: Admission of a New Partner' },
  'acc-top-1004': { pdfUrl: 'https://resource.cdn.icai.org/88120bos-aps2240-ch10u4.pdf', pdfTitle: 'Unit 4: Retirement of a Partner' },
  'acc-top-1005': { pdfUrl: 'https://resource.cdn.icai.org/88121bos-aps2240-ch10u5.pdf', pdfTitle: 'Unit 5: Death of a Partner' },
  'acc-top-1006': { pdfUrl: 'https://resource.cdn.icai.org/88122bos-aps2240-ch10u6.pdf', pdfTitle: 'Unit 6: Dissolution of Partnership Firms and LLPs' },

  // Paper 1: Chapter 11 Units
  'acc-top-1101': { pdfUrl: 'https://resource.cdn.icai.org/88134bos-aps2240-ch11u1.pdf', pdfTitle: 'Unit 1: Introduction to Company Accounts' },
  'acc-top-1102': { pdfUrl: 'https://resource.cdn.icai.org/88135bos-aps2240-ch11u2.pdf', pdfTitle: 'Unit 2: Issue, Forfeiture and Re-Issue of Shares' },
  'acc-top-1103': { pdfUrl: 'https://resource.cdn.icai.org/88136bos-aps2240-ch11u3.pdf', pdfTitle: 'Unit 3: Issue of Debentures' },
  'acc-top-1104': { pdfUrl: 'https://resource.cdn.icai.org/88137bos-aps2240-ch11u4.pdf', pdfTitle: 'Unit 4: Accounting for Bonus Issue and Right Issue' },
  'acc-top-1105': { pdfUrl: 'https://resource.cdn.icai.org/88138bos-aps2240-ch11u5.pdf', pdfTitle: 'Unit 5: Redemption of Preference Shares' },
  'acc-top-1106': { pdfUrl: 'https://resource.cdn.icai.org/88139bos-aps2240-ch11u6.pdf', pdfTitle: 'Unit 6: Redemption of Debentures' },

  // Paper 2: Chapter 1
  'law-top-0101': { pdfUrl: 'https://resource.cdn.icai.org/88015bos-aps2231-ch1.pdf', pdfTitle: 'Ch 1: Indian Legal System & Sources of Law' },
  'law-top-0102': { pdfUrl: 'https://resource.cdn.icai.org/88015bos-aps2231-ch1.pdf', pdfTitle: 'Ch 1: Legislative Process in India' },
  'law-top-0103': { pdfUrl: 'https://resource.cdn.icai.org/88015bos-aps2231-ch1.pdf', pdfTitle: 'Ch 1: Court Structure & Regulatory Bodies' },

  // Paper 2: Chapter 2 Units
  'law-top-0201': { pdfUrl: 'https://resource.cdn.icai.org/88017bos-aps2231-ch2u1.pdf', pdfTitle: 'Unit 1: Nature of Contracts' },
  'law-top-0202': { pdfUrl: 'https://resource.cdn.icai.org/88018bos-aps2231-ch2u2.pdf', pdfTitle: 'Unit 2: Consideration' },
  'law-top-0203': { pdfUrl: 'https://resource.cdn.icai.org/88019bos-aps2231-ch2u3.pdf', pdfTitle: 'Unit 3: Other Essential Elements of a Contract' },
  'law-top-0204': { pdfUrl: 'https://resource.cdn.icai.org/88020bos-aps2231-ch2u4.pdf', pdfTitle: 'Unit 4: Performance of Contract' },
  'law-top-0205': { pdfUrl: 'https://resource.cdn.icai.org/88021bos-aps2231-ch2u5.pdf', pdfTitle: 'Unit 5: Breach of Contract and its Remedies' },
  'law-top-0206': { pdfUrl: 'https://resource.cdn.icai.org/88022bos-aps2231-ch2u6.pdf', pdfTitle: 'Unit 6: Contingent and Quasi Contracts' },
  'law-top-0207': { pdfUrl: 'https://resource.cdn.icai.org/88023bos-aps2231-ch2u7.pdf', pdfTitle: 'Unit 7: Contract of Indemnity and Guarantee' },
  'law-top-0208': { pdfUrl: 'https://resource.cdn.icai.org/88024bos-aps2231-ch2u8.pdf', pdfTitle: 'Unit 8: Bailment and Pledge' },
  'law-top-0209': { pdfUrl: 'https://resource.cdn.icai.org/88025bos-aps2231-ch2u9.pdf', pdfTitle: 'Unit 9: Agency' },

  // Paper 2: Chapter 3 Units
  'law-top-0301': { pdfUrl: 'https://resource.cdn.icai.org/88026bos-aps2231-ch3u1.pdf', pdfTitle: 'Unit 1: Formation of the Contract of Sale' },
  'law-top-0302': { pdfUrl: 'https://resource.cdn.icai.org/88027bos-aps2231-ch3u2.pdf', pdfTitle: 'Unit 2: Conditions & Warranties' },
  'law-top-0303': { pdfUrl: 'https://resource.cdn.icai.org/88028bos-aps2231-ch3u3.pdf', pdfTitle: 'Unit 3: Transfer of Ownership and Delivery of Goods' },
  'law-top-0304': { pdfUrl: 'https://resource.cdn.icai.org/88029bos-aps2231-ch3u4.pdf', pdfTitle: 'Unit 4: Unpaid Seller' },

  // Paper 2: Chapter 4 Units
  'law-top-0401': { pdfUrl: 'https://resource.cdn.icai.org/88030bos-aps2231-ch4u1.pdf', pdfTitle: 'Unit 1: General Nature of Partnership' },
  'law-top-0402': { pdfUrl: 'https://resource.cdn.icai.org/88031bos-aps2231-ch4u2.pdf', pdfTitle: 'Unit 2: Relations of Partners' },
  'law-top-0403': { pdfUrl: 'https://resource.cdn.icai.org/88032bos-aps2231-ch4u3.pdf', pdfTitle: 'Unit 3: Registration and Dissolution of a Firm' },

  // Paper 2: Chapter 5, 6, 7
  'law-top-0501': { pdfUrl: 'https://resource.cdn.icai.org/88033bos-aps2231-ch5.pdf', pdfTitle: 'Ch 5: Salient Features & Designated Partners of LLP' },
  'law-top-0502': { pdfUrl: 'https://resource.cdn.icai.org/88033bos-aps2231-ch5.pdf', pdfTitle: 'Ch 5: Incorporation of LLP & LLP Agreement' },
  'law-top-0503': { pdfUrl: 'https://resource.cdn.icai.org/88033bos-aps2231-ch5.pdf', pdfTitle: 'Ch 5: Conversion, Differences & Winding Up of LLP' },
  'law-top-0601': { pdfUrl: 'https://resource.cdn.icai.org/88034bos-aps2231-ch6.pdf', pdfTitle: 'Ch 6: Company Characteristics & Corporate Veil' },
  'law-top-0602': { pdfUrl: 'https://resource.cdn.icai.org/88034bos-aps2231-ch6.pdf', pdfTitle: 'Ch 6: Classification and Types of Companies' },
  'law-top-0603': { pdfUrl: 'https://resource.cdn.icai.org/88034bos-aps2231-ch6.pdf', pdfTitle: 'Ch 6: Incorporation of Company & SPICe+' },
  'law-top-0604': { pdfUrl: 'https://resource.cdn.icai.org/88034bos-aps2231-ch6.pdf', pdfTitle: 'Ch 6: Memorandum (MOA) & Articles of Association (AOA)' },
  'law-top-0605': { pdfUrl: 'https://resource.cdn.icai.org/88034bos-aps2231-ch6.pdf', pdfTitle: 'Ch 6: Share Capital Basics & Debentures' },
  'law-top-0701': { pdfUrl: 'https://resource.cdn.icai.org/88035bos-aps2231-ch7.pdf', pdfTitle: 'Ch 7: Promissory Notes, Bills of Exchange & Cheques' },
  'law-top-0702': { pdfUrl: 'https://resource.cdn.icai.org/88035bos-aps2231-ch7.pdf', pdfTitle: 'Ch 7: Holder, Holder in Due Course (HDC) & Negotiation' },
  'law-top-0703': { pdfUrl: 'https://resource.cdn.icai.org/88035bos-aps2231-ch7.pdf', pdfTitle: 'Ch 7: Crossing of Cheques & Material Alteration' },
  'law-top-0704': { pdfUrl: 'https://resource.cdn.icai.org/88035bos-aps2231-ch7.pdf', pdfTitle: 'Ch 7: Dishonour of Cheques & Penalties' },

  // Paper 3: Quantitative Aptitude
  'qa-top-0101': { pdfUrl: 'https://resource.cdn.icai.org/88037bos-aps2232-ch1.pdf', pdfTitle: 'Ch 1: Ratio and Proportion' },
  'qa-top-0102': { pdfUrl: 'https://resource.cdn.icai.org/88037bos-aps2232-ch1.pdf', pdfTitle: 'Ch 1: Laws of Indices' },
  'qa-top-0103': { pdfUrl: 'https://resource.cdn.icai.org/88037bos-aps2232-ch1.pdf', pdfTitle: 'Ch 1: Logarithms' },
  'qa-top-0201': { pdfUrl: 'https://resource.cdn.icai.org/88038bos-aps2232-ch2.pdf', pdfTitle: 'Ch 2: Linear Equations' },
  'qa-top-0202': { pdfUrl: 'https://resource.cdn.icai.org/88038bos-aps2232-ch2.pdf', pdfTitle: 'Ch 2: Quadratic and Cubic Equations' },
  'qa-top-0301': { pdfUrl: 'https://resource.cdn.icai.org/88039bos-aps2232-ch3.pdf', pdfTitle: 'Ch 3: Linear Inequalities' },
  'qa-top-0401': { pdfUrl: 'https://resource.cdn.icai.org/88040bos-aps2232-ch4.pdf', pdfTitle: 'Ch 4: Simple Interest and Compound Interest' },
  'qa-top-0402': { pdfUrl: 'https://resource.cdn.icai.org/88040bos-aps2232-ch4.pdf', pdfTitle: 'Ch 4: Annuities: Future Value and Present Value' },
  'qa-top-0403': { pdfUrl: 'https://resource.cdn.icai.org/88040bos-aps2232-ch4.pdf', pdfTitle: 'Ch 4: Sinking Fund, Leasing, Perpetuity, Bond & NPV' },
  'qa-top-0501': { pdfUrl: 'https://resource.cdn.icai.org/88041bos-aps2232-ch5.pdf', pdfTitle: 'Ch 5: Principles of Counting & Permutations' },
  'qa-top-0502': { pdfUrl: 'https://resource.cdn.icai.org/88041bos-aps2232-ch5.pdf', pdfTitle: 'Ch 5: Combinations and Grouping' },
  'qa-top-0601': { pdfUrl: 'https://resource.cdn.icai.org/88042bos-aps2232-ch6.pdf', pdfTitle: 'Ch 6: Arithmetic Progression (AP)' },
  'qa-top-0602': { pdfUrl: 'https://resource.cdn.icai.org/88042bos-aps2232-ch6.pdf', pdfTitle: 'Ch 6: Geometric Progression (GP) & Special Series' },
  'qa-top-0701': { pdfUrl: 'https://resource.cdn.icai.org/88043bos-aps2232-ch7.pdf', pdfTitle: 'Ch 7: Sets and Venn Diagrams' },
  'qa-top-0702': { pdfUrl: 'https://resource.cdn.icai.org/88043bos-aps2232-ch7.pdf', pdfTitle: 'Ch 7: Relations and Functions' },
  'qa-top-0801': { pdfUrl: 'https://resource.cdn.icai.org/88045bos-aps2232-ch8u2.pdf', pdfTitle: 'Ch 8: Differential Calculus' },
  'qa-top-0802': { pdfUrl: 'https://resource.cdn.icai.org/88045bos-aps2232-ch8u2.pdf', pdfTitle: 'Ch 8: Integral Calculus & Consumer/Producer Surplus' },
  'qa-top-0901': { pdfUrl: 'https://resource.cdn.icai.org/88046bos-aps2232-ch9.pdf', pdfTitle: 'Ch 9: Number Series and Letter Series' },
  'qa-top-0902': { pdfUrl: 'https://resource.cdn.icai.org/88046bos-aps2232-ch9.pdf', pdfTitle: 'Ch 9: Coding-Decoding & Odd Man Out' },
  'qa-top-1001': { pdfUrl: 'https://resource.cdn.icai.org/88047bos-aps2232-ch10.pdf', pdfTitle: 'Ch 10: Direction Sense Test' },
  'qa-top-1101': { pdfUrl: 'https://resource.cdn.icai.org/88048bos-aps2232-ch11.pdf', pdfTitle: 'Ch 11: Linear and Circular Seating Arrangements' },
  'qa-top-1201': { pdfUrl: 'https://resource.cdn.icai.org/88049bos-aps2232-ch12.pdf', pdfTitle: 'Ch 12: Blood Relations & Coded Puzzles' },
  'qa-top-1301': { pdfUrl: 'https://resource.cdn.icai.org/88050bos-aps2232-ch13u1.pdf', pdfTitle: 'Unit I: Statistical Description of Data' },
  'qa-top-1302': { pdfUrl: 'https://resource.cdn.icai.org/88051bos-aps2232-ch13u2.pdf', pdfTitle: 'Unit II: Sampling & Diagrammatic Representation' },
  'qa-top-1401': { pdfUrl: 'https://resource.cdn.icai.org/88052bos-aps2232-ch14u1.pdf', pdfTitle: 'Unit I: Measures of Central Tendency (Mean, Median, Mode)' },
  'qa-top-1402': { pdfUrl: 'https://resource.cdn.icai.org/88057bos-aps2232-ch14u2.pdf', pdfTitle: 'Unit II: Measures of Dispersion (SD, Variance, MD, QD, CV)' },
  'qa-top-1501': { pdfUrl: 'https://resource.cdn.icai.org/88053bos-aps2232-ch15.pdf', pdfTitle: 'Ch 15: Basic Probability & Theorems' },
  'qa-top-1502': { pdfUrl: 'https://resource.cdn.icai.org/88053bos-aps2232-ch15.pdf', pdfTitle: 'Ch 15: Conditional Probability & Bayes Theorem' },
  'qa-top-1601': { pdfUrl: 'https://resource.cdn.icai.org/88054bos-aps2232-ch16.pdf', pdfTitle: 'Ch 16: Binomial Distribution' },
  'qa-top-1602': { pdfUrl: 'https://resource.cdn.icai.org/88054bos-aps2232-ch16.pdf', pdfTitle: 'Ch 16: Poisson Distribution' },
  'qa-top-1603': { pdfUrl: 'https://resource.cdn.icai.org/88054bos-aps2232-ch16.pdf', pdfTitle: 'Ch 16: Normal (Gaussian) Distribution' },
  'qa-top-1701': { pdfUrl: 'https://resource.cdn.icai.org/88055bos-aps2232-ch17.pdf', pdfTitle: 'Ch 17: Correlation Analysis' },
  'qa-top-1702': { pdfUrl: 'https://resource.cdn.icai.org/88055bos-aps2232-ch17.pdf', pdfTitle: 'Ch 17: Regression Analysis & Properties' },
  'qa-top-1801': { pdfUrl: 'https://resource.cdn.icai.org/88056bos-aps2232-ch18.pdf', pdfTitle: 'Ch 18: Index Number Formulas & Weighted Aggregates' },
  'qa-top-1802': { pdfUrl: 'https://resource.cdn.icai.org/88056bos-aps2232-ch18.pdf', pdfTitle: 'Ch 18: Tests of Adequacy, Splicing & Deflating' },

  // Paper 4: Business Economics
  'eco-top-0101': { pdfUrl: 'https://resource.cdn.icai.org/88059bos-aps2233-ch1u1.pdf', pdfTitle: 'Unit 1: Introduction to Business Economics' },
  'eco-top-0102': { pdfUrl: 'https://resource.cdn.icai.org/88060bos-aps2233-ch1u2.pdf', pdfTitle: 'Unit 2: Basic Problems of Economy & Price Mechanism' },
  'eco-top-0201': { pdfUrl: 'https://resource.cdn.icai.org/88061bos-aps2233-ch2u1.pdf', pdfTitle: 'Unit 1: Law of Demand & Elasticity of Demand' },
  'eco-top-0202': { pdfUrl: 'https://resource.cdn.icai.org/88062bos-aps2233-ch2u2.pdf', pdfTitle: 'Unit 2: Theory of Consumer Behaviour' },
  'eco-top-0203': { pdfUrl: 'https://resource.cdn.icai.org/88063bos-aps2233-ch2u3.pdf', pdfTitle: 'Unit 3: Supply and Elasticity of Supply' },
  'eco-top-0204': { pdfUrl: 'https://resource.cdn.icai.org/88061bos-aps2233-ch2u1.pdf', pdfTitle: 'Demand Forecasting Techniques' },
  'eco-top-0301': { pdfUrl: 'https://resource.cdn.icai.org/88064bos-aps2233-ch3u1.pdf', pdfTitle: 'Unit 1: Theory of Production & Returns to Scale' },
  'eco-top-0302': { pdfUrl: 'https://resource.cdn.icai.org/88065bos-aps2233-ch3u2.pdf', pdfTitle: 'Unit 2: Theory of Cost (Short & Long Run)' },
  'eco-top-0401': { pdfUrl: 'https://resource.cdn.icai.org/88066bos-aps2233-ch4u1.pdf', pdfTitle: 'Unit 1: Meaning and Types of Markets' },
  'eco-top-0402': { pdfUrl: 'https://resource.cdn.icai.org/88067bos-aps2233-ch4u2.pdf', pdfTitle: 'Unit 2: Determination of Prices' },
  'eco-top-0403': { pdfUrl: 'https://resource.cdn.icai.org/88068bos-aps2233-ch4u3.pdf', pdfTitle: 'Unit 3: Price Output Determination (Monopoly)' },
  'eco-top-0404': { pdfUrl: 'https://resource.cdn.icai.org/88068bos-aps2233-ch4u3.pdf', pdfTitle: 'Unit 3: Monopolistic Competition & Oligopoly' },
  'eco-top-0501': { pdfUrl: 'https://resource.cdn.icai.org/88070bos-aps2233-ch6u1.pdf', pdfTitle: 'Unit 1: National Income Accounting' },
  'eco-top-0502': { pdfUrl: 'https://resource.cdn.icai.org/88070bos-aps2233-ch6u1.pdf', pdfTitle: 'Unit 1: Measurement of National Income' },
  'eco-top-0503': { pdfUrl: 'https://resource.cdn.icai.org/88071bos-aps2233-ch6u2.pdf', pdfTitle: 'Unit 2: Keynesian Theory of National Income Determination' },
  'eco-top-0601': { pdfUrl: 'https://resource.cdn.icai.org/88072bos-aps2233-ch7u1.pdf', pdfTitle: 'Unit 1 & 2: Fiscal Functions & Market Failure' },
  'eco-top-0602': { pdfUrl: 'https://resource.cdn.icai.org/88074bos-aps2233-ch7u3.pdf', pdfTitle: 'Unit 3 & 4: Budget Making & Fiscal Policy' },
  'eco-top-0701': { pdfUrl: 'https://resource.cdn.icai.org/88076bos-aps2233-ch8u1.pdf', pdfTitle: 'Unit 1: Concept of Money Demand' },
  'eco-top-0702': { pdfUrl: 'https://resource.cdn.icai.org/88077bos-aps2233-ch8u2.pdf', pdfTitle: 'Unit 2: Money Supply Measures' },
  'eco-top-0703': { pdfUrl: 'https://resource.cdn.icai.org/88078bos-aps2233-ch8u3.pdf', pdfTitle: 'Unit 3: Monetary Policy Instruments of RBI' },
  'eco-top-0801': { pdfUrl: 'https://resource.cdn.icai.org/88079bos-aps2233-ch9u1.pdf', pdfTitle: 'Unit 1: Theories of International Trade' },
  'eco-top-0802': { pdfUrl: 'https://resource.cdn.icai.org/88080bos-aps2233-ch9u2.pdf', pdfTitle: 'Unit 2: Instruments of Trade Policy' },
  'eco-top-0803': { pdfUrl: 'https://resource.cdn.icai.org/88081bos-aps2233-ch9u3.pdf', pdfTitle: 'Unit 3 & 4: Trade Negotiations & Exchange Rates' },
  'eco-top-0901': { pdfUrl: 'https://resource.cdn.icai.org/88084bos-aps2233-ch10.pdf', pdfTitle: 'Ch 9: Sectoral Growth & Evolution of Indian Economy' },
  'eco-top-0902': { pdfUrl: 'https://resource.cdn.icai.org/88084bos-aps2233-ch10.pdf', pdfTitle: 'Ch 9: Economic Reforms & Contemporary Initiatives' },
};

let attachedChapters = 0;
let attachedTopics = 0;

for (const sub of blueprint.subjects) {
  for (const ch of sub.chapters) {
    if (chapterPdfMap[ch.id]) {
      ch.pdfUrl = chapterPdfMap[ch.id].pdfUrl;
      ch.pdfTitle = chapterPdfMap[ch.id].pdfTitle;
      attachedChapters++;
    }
    for (const top of ch.topics) {
      if (topicPdfMap[top.id]) {
        top.pdfUrl = topicPdfMap[top.id].pdfUrl;
        top.pdfTitle = topicPdfMap[top.id].pdfTitle;
        attachedTopics++;
      } else if (ch.pdfUrl) {
        top.pdfUrl = ch.pdfUrl;
        top.pdfTitle = `${ch.title} - ${top.title}`;
        attachedTopics++;
      }
    }
  }
}

fs.writeFileSync(blueprintPath, JSON.stringify(blueprint, null, 2), 'utf8');
console.log(`\n Successfully updated syllabus_blueprint.json:`);
console.log(`- Attached PDFs to ${attachedChapters} chapters.`);
console.log(`- Attached PDFs to ${attachedTopics} topics.`);

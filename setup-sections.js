const TOKEN   = process.env.CONTENTFUL_CMA_TOKEN || 'YOUR_CMA_TOKEN';
const SPACE   = 'tabc1qgaltm6';
const ENV     = 'master';
const BASE    = `https://api.contentful.com/spaces/${SPACE}/environments/${ENV}`;

const headers = {
  'Authorization': `Bearer ${TOKEN}`,
  'Content-Type': 'application/json'
};

async function createOrSkip(id, config) {
  try {
    const check = await fetch(`${BASE}/content_types/${id}`, { headers });
    if (check.ok) {
      console.log(`⏭  Type ${id} already exists`);
      return;
    }
  } catch(e) {}

  const res = await fetch(`${BASE}/content_types/${id}`, {
    method: 'PUT',
    headers: { ...headers, 'X-Contentful-Version': '0' },
    body: JSON.stringify(config)
  });
  const data = await res.json();
  if (!res.ok) {
    console.error(`✗ ${id}:`, data.message);
    return;
  }
  // Publish
  await fetch(`${BASE}/content_types/${id}/published`, {
    method: 'PUT',
    headers: { ...headers, 'X-Contentful-Version': data.sys.version }
  });
  console.log(`✓ Created Type: ${id}`);
}

async function createEntry(contentType, fields, entryId) {
  const checkRes = await fetch(`${BASE}/entries/${entryId}`, { headers });
  if (checkRes.ok) {
    console.log(`⏭  Entry ${entryId} exists`);
    return;
  }
  const res = await fetch(`${BASE}/entries/${entryId}`, {
    method: 'PUT',
    headers: {
      ...headers,
      'X-Contentful-Content-Type': contentType,
      'X-Contentful-Version': '0'
    },
    body: JSON.stringify({ fields })
  });
  const data = await res.json();
  if (!res.ok) {
    console.error('Entry error:', data.message, fields);
    return null;
  }
  // Publish entry
  await fetch(`${BASE}/entries/${entryId}/published`, {
    method: 'PUT',
    headers: { ...headers, 'X-Contentful-Version': data.sys.version }
  });
  console.log(`✓ Entry: ${entryId}`);
  return data;
}

function tf(val) { return { 'en-US': val }; }

async function main() {
  console.log('Building Finzoop Hero, FAQ, and SEO infrastructure...\n');

  // 1. faq Content Type
  await createOrSkip('faq', {
    name: 'FAQ',
    displayField: 'question',
    fields: [
      { id: 'question', name: 'Question', type: 'Symbol', required: true },
      { id: 'answer', name: 'Answer', type: 'Text', required: true },
      { id: 'category', name: 'Category Slug', type: 'Symbol', required: true },
      { id: 'sortOrder', name: 'Sort Order', type: 'Integer' },
      { id: 'isPublished', name: 'Published', type: 'Boolean' }
    ]
  });

  // 2. pageSeo Content Type
  await createOrSkip('pageSeo', {
    name: 'Page SEO',
    displayField: 'pageIdentifier',
    fields: [
      { id: 'pageIdentifier', name: 'Page Identifier', type: 'Symbol', required: true },
      { id: 'metaTitle', name: 'Meta Title', type: 'Symbol' },
      { id: 'metaDescription', name: 'Meta Description', type: 'Text' },
      { id: 'metaKeywords', name: 'Keywords', type: 'Symbol' },
      { id: 'ogTitle', name: 'OG Title', type: 'Symbol' },
      { id: 'ogDescription', name: 'OG Description', type: 'Text' },
      { id: 'ogImage', name: 'OG Image', type: 'Link', linkType: 'Asset' },
      { id: 'canonicalUrl', name: 'Canonical URL', type: 'Symbol' }
    ]
  });

  // 3. heroBanner Content Type
  await createOrSkip('heroBanner', {
    name: 'Hero Banner',
    displayField: 'identifier',
    fields: [
      { id: 'identifier', name: 'Identifier', type: 'Symbol', required: true },
      { id: 'badgeText', name: 'Badge Text', type: 'Symbol' },
      { id: 'headingLine1', name: 'Heading Line 1', type: 'Symbol' },
      { id: 'headingHighlightWord', name: 'Highlight Word', type: 'Symbol' },
      { id: 'subheading', name: 'Subheading', type: 'Text' },
      { id: 'ctaPrimaryLabel', name: 'Primary CTA Label', type: 'Symbol' },
      { id: 'ctaPrimaryUrl', name: 'Primary CTA URL', type: 'Symbol' },
      { id: 'ctaSecondaryLabel', name: 'Secondary CTA Label', type: 'Symbol' },
      { id: 'ctaSecondaryUrl', name: 'Secondary CTA URL', type: 'Symbol' },
      { id: 'backgroundType', name: 'Background Type', type: 'Symbol' }
    ]
  });

  // --- Seed Data ---

  // Hero: Loans
  await createEntry('heroBanner', {
    identifier: tf('loans'),
    badgeText: tf('Trusted by 1M+ Users'),
    headingLine1: tf('Get the best Interest Rates on Loans'),
    headingHighlightWord: tf('Interest Rates'),
    subheading: tf('Compare top banks and get instant approval with minimal documentation.'),
    ctaPrimaryLabel: tf('Apply Now'),
    ctaPrimaryUrl: tf('#'),
    ctaSecondaryLabel: tf('Check Eligibility'),
    ctaSecondaryUrl: tf('#'),
    backgroundType: tf('color')
  }, 'hero-loans');

  // Hero: Home
  await createEntry('heroBanner', {
    identifier: tf('home'),
    badgeText: tf('India\'s #1 Finance Portal'),
    headingLine1: tf('Master your Money with Finzoop'),
    headingHighlightWord: tf('Finzoop'),
    subheading: tf('Calculators, product comparisons, and expert advice to help you grow your wealth.'),
    ctaPrimaryLabel: tf('Browse Calculators'),
    ctaPrimaryUrl: tf('calculators.html'),
    ctaSecondaryLabel: tf('Compare Loans'),
    ctaSecondaryUrl: tf('loans.html'),
    backgroundType: tf('color')
  }, 'hero-home');

  // SEO: Home
  await createEntry('pageSeo', {
    pageIdentifier: tf('home'),
    metaTitle: tf('Finzoop - Compare Loans, Mutual Funds & Insurance'),
    metaDescription: tf('Finzoop helps you make better financial decisions by comparing interest rates, calculating returns, and finding the best plans.')
  }, 'seo-home');

  // FAQs: SIP
  const faqs = [
    { q: 'What is a SIP?', a: 'Systematic Investment Plan (SIP) allows you to invest small amounts regularly in mutual funds.', cat: 'sip' },
    { q: 'Can I stop my SIP anytime?', a: 'Yes, you can pause or stop your SIP whenever you want without any penalty.', cat: 'sip' },
    { q: 'Is SIP better than Lumpsum?', a: 'SIP is better for long-term wealth creation as it averages the cost of purchase.', cat: 'sip' }
  ];

  for (let i = 0; i < faqs.length; i++) {
    await createEntry('faq', {
      question: tf(faqs[i].q),
      answer: tf(faqs[i].a),
      category: tf(faqs[i].cat),
      sortOrder: tf(i + 1),
      isPublished: tf(true)
    }, `faq-sip-${i}`);
  }

  console.log('\n✅ Infrastructure setup complete!');
}

main().catch(console.error);

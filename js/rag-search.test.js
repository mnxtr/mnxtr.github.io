import { expandQuery, normalizeText, searchPortfolio } from './rag-search.js';

const documents = [
  {
    id: 'traffic-signs',
    title: 'Traffic Symbol Recognition',
    description: 'Real-time traffic-sign detection using YOLO and OpenCV.',
    content: 'Computer-vision inference for edge-oriented applications.',
    sourceType: 'project',
    sourceLabel: 'Project · Computer Vision',
    url: 'project.html',
    tags: ['computer vision', 'YOLO', 'OpenCV', 'real time'],
  },
  {
    id: 'crm',
    title: 'Customer Relationship Management System',
    description: 'Backend application using FastAPI and PostgreSQL.',
    content: 'REST APIs, relational data, and authentication.',
    sourceType: 'project',
    sourceLabel: 'Project · Backend',
    url: 'project.html',
    tags: ['backend', 'FastAPI', 'Python', 'PostgreSQL'],
  },
  {
    id: 'medical',
    title: 'Cardiovascular ML Ensemble',
    description: 'Medical classification from EKG data.',
    content: 'Healthcare machine learning and ensemble modelling.',
    sourceType: 'project',
    sourceLabel: 'Project · Medical AI',
    url: 'project.html',
    tags: ['healthcare', 'EKG', 'TensorFlow'],
  },
];

describe('portfolio retrieval', () => {
  test('normalizes punctuation and spacing', () => {
    expect(normalizeText(' FastAPI / PostgreSQL — API ')).toBe('fastapi postgresql api');
  });

  test('expands backend-related intent', () => {
    const { terms } = expandQuery('backend internship');

    expect(terms).toEqual(expect.arrayContaining(['backend', 'fastapi', 'api', 'internship']));
  });

  test('ranks backend evidence first for API queries', () => {
    const results = searchPortfolio(documents, 'secure backend API with a database');

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ id: 'crm', confidence: 'Strong match' });
    expect(results[0].score).toBeGreaterThan(20);
  });

  test('maps edge and real-time intent to the vision project', () => {
    const results = searchPortfolio(documents, 'real-time edge vision project');

    expect(results[0].id).toBe('traffic-signs');
  });

  test('maps healthcare wording to the medical project', () => {
    const results = searchPortfolio(documents, 'healthcare machine learning work');

    expect(results[0].id).toBe('medical');
  });

  test('returns no evidence for an unrelated query', () => {
    expect(searchPortfolio(documents, 'marine biology coral reef research')).toEqual([]);
  });
});

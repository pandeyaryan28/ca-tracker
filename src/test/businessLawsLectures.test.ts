import { describe, it, expect } from 'vitest';
import { loadSeedLectures, loadSeedSyllabus, normalizeSubjectId } from '@/lib/seedLoader';
import lawLecturesRaw from '@/data/law_lectures.json';

describe('Business Laws Lecture & Checklist Mapping Suite', () => {
  it('loads all 7 Business Laws lectures from seed', () => {
    const allLectures = loadSeedLectures();
    const lawLectures = allLectures.filter(
      (l) => normalizeSubjectId(l.subjectId) === 'paper2'
    );

    expect(lawLectures).toHaveLength(7);
  });

  it('verifies exact 1:1 mapping between YouTube playlist and Business Law chapters', () => {
    const expectedMappings = [
      {
        order: 1,
        chapterId: 'law-ch-01',
        youtubeId: 'JMg3dc9ScqY',
        videoUrl: 'https://www.youtube.com/watch?v=JMg3dc9ScqY',
        titlePart: 'Indian Regulatory Framework',
      },
      {
        order: 2,
        chapterId: 'law-ch-02',
        youtubeId: '0LKZepFh_k4',
        videoUrl: 'https://www.youtube.com/watch?v=0LKZepFh_k4',
        titlePart: 'Indian Contract Act, 1872',
      },
      {
        order: 3,
        chapterId: 'law-ch-03',
        youtubeId: 'bIYOCtNmeiQ',
        videoUrl: 'https://www.youtube.com/watch?v=bIYOCtNmeiQ',
        titlePart: 'The Sale of Good Act,1930',
      },
      {
        order: 4,
        chapterId: 'law-ch-04',
        youtubeId: '6UOCCrLCJy8',
        videoUrl: 'https://www.youtube.com/watch?v=6UOCCrLCJy8',
        titlePart: 'The Indian Partnership Act, 1932',
      },
      {
        order: 5,
        chapterId: 'law-ch-05',
        youtubeId: '1Zf4YF0WCAg',
        videoUrl: 'https://www.youtube.com/watch?v=1Zf4YF0WCAg',
        titlePart: 'The Limited Liability Partnership Act, 2008',
      },
      {
        order: 6,
        chapterId: 'law-ch-06',
        youtubeId: 'Qbvhm8hvuw0',
        videoUrl: 'https://www.youtube.com/watch?v=Qbvhm8hvuw0',
        titlePart: 'Companies Act One Shot',
      },
      {
        order: 7,
        chapterId: 'law-ch-07',
        youtubeId: 'jo60ZB33f-c',
        videoUrl: 'https://www.youtube.com/watch?v=jo60ZB33f-c',
        titlePart: 'The Negotiable Instruments Act, 1881',
      },
    ];

    expect(lawLecturesRaw).toHaveLength(7);

    expectedMappings.forEach((exp) => {
      const lecture = lawLecturesRaw.find((l) => l.chapterId === exp.chapterId);
      expect(lecture).toBeDefined();
      expect(lecture?.order).toBe(exp.order);
      expect(lecture?.youtubeId).toBe(exp.youtubeId);
      expect(lecture?.videoUrl).toBe(exp.videoUrl);
      expect(lecture?.title).toContain(exp.titlePart);
    });
  });

  it('verifies chapters in syllabus blueprint contain the correct video links for Checklist tab', () => {
    const { chapters } = loadSeedSyllabus();
    const lawChapters = chapters.filter((c) => c.subjectId === 'paper2');

    expect(lawChapters).toHaveLength(7);

    const chapterVideoExpected: Record<string, string> = {
      'law-ch-01': 'https://www.youtube.com/watch?v=JMg3dc9ScqY',
      'law-ch-02': 'https://www.youtube.com/watch?v=0LKZepFh_k4',
      'law-ch-03': 'https://www.youtube.com/watch?v=bIYOCtNmeiQ',
      'law-ch-04': 'https://www.youtube.com/watch?v=6UOCCrLCJy8',
      'law-ch-05': 'https://www.youtube.com/watch?v=1Zf4YF0WCAg',
      'law-ch-06': 'https://www.youtube.com/watch?v=Qbvhm8hvuw0',
      'law-ch-07': 'https://www.youtube.com/watch?v=jo60ZB33f-c',
    };

    lawChapters.forEach((ch) => {
      expect(ch.videoUrl).toBe(chapterVideoExpected[ch.id]);
      expect(ch.videoTitle).toBeDefined();
      expect(ch.videoTitle!.length).toBeGreaterThan(0);
      
      // All topics in the chapter should also have videoUrl
      ch.topics.forEach((topic) => {
        expect(topic.videoUrl).toBe(chapterVideoExpected[ch.id]);
        expect(topic.videoTitle).toBeDefined();
      });
    });
  });

  it('loads all 7 Business Economics lectures and maps to all 10 chapters', () => {
    const allLectures = loadSeedLectures();
    const ecoLectures = allLectures.filter(
      (l) => normalizeSubjectId(l.subjectId) === 'paper4'
    );

    expect(ecoLectures).toHaveLength(7);

    const { chapters } = loadSeedSyllabus();
    const ecoChapters = chapters.filter((c) => c.subjectId === 'paper4');
    expect(ecoChapters).toHaveLength(10);

    // Verify each of the 10 chapters has a valid videoUrl from the Chanakya 3.0 playlist
    ecoChapters.forEach((ch) => {
      expect(ch.videoUrl).toBeDefined();
      expect(ch.videoUrl).toContain('https://www.youtube.com/watch?v=');
      expect(ch.videoTitle).toBeDefined();

      ch.topics.forEach((top) => {
        expect(top.videoUrl).toBe(ch.videoUrl);
      });
    });
  });
});

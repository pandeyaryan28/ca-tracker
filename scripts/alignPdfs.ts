import fs from 'fs';
import path from 'path';

const blueprintPath = path.resolve('src/data/syllabus_blueprint.json');
const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));

for (const sub of blueprint.subjects) {
  console.log('\n=============================================');
  console.log('SUBJECT:', sub.id, '-', sub.title);
  console.log('=============================================');
  for (const ch of sub.chapters) {
    console.log('  Chapter', ch.chapterNumber, ':', ch.id, '-', ch.title, `(${ch.topics.length} topics)`);
    for (const top of ch.topics) {
      console.log('    Topic', top.topicNumber, ':', top.id, '-', top.title);
    }
  }
}

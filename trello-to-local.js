// trello-to-local.js
import fs from 'fs';
import crypto from 'crypto';


function transformTrelloToLocal(trelloData) {
  // Create the board object
  const board = {
    id: crypto.randomUUID ? crypto.randomUUID() : generateId(),
    title: trelloData.name,
    createdAt: trelloData.dateLastActivity || new Date().toISOString(),
    lists: []
  };

  // Transform lists
  trelloData.lists.forEach(trelloList => {
    const list = {
      id: crypto.randomUUID ? crypto.randomUUID() : generateId(),
      title: trelloList.name,
      cards: []
    };

    // Find cards for this list
    const cardsInList = trelloData.cards.filter(card => card.idList === trelloList.id);

    // Transform cards
    cardsInList.forEach(trelloCard => {
      const card = {
        id: crypto.randomUUID ? crypto.randomUUID() : generateId(),
        title: trelloCard.name,
        description: trelloCard.desc || "",
        createdAt: trelloCard.dateLastActivity,
        labels: trelloCard.labels.map(label => label.color).filter(Boolean),
        checklist: []
      };

      // Transform checklists
      if (trelloCard.idChecklists && trelloCard.idChecklists.length > 0) {
        trelloCard.idChecklists.forEach(checklistId => {
          const trelloChecklist = trelloData.checklists.find(cl => cl.id === checklistId);
          if (trelloChecklist && trelloChecklist.checkItems) {
            trelloChecklist.checkItems.forEach(item => {
              card.checklist.push({
                id: crypto.randomUUID ? crypto.randomUUID() : generateId(),
                text: item.name,
                completed: item.state === 'complete'
              });
            });
          }
        });
      }

      list.cards.push(card);
    });

    board.lists.push(list);
  });

  // Return in the format your app expects
  return {
    boards: [board],
    currentBoard: null
  };
}

// Simple ID generator for Node.js environments without crypto.randomUUID
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Read input file
const trelloJson = JSON.parse(fs.readFileSync('trello-export.json', 'utf8'));

// Transform
const localFormat = transformTrelloToLocal(trelloJson);

// Write output
fs.writeFileSync('local-import.json', JSON.stringify(localFormat, null, 2));

console.log('✅ Conversion complete! Output saved to local-import.json');
console.log(`Converted ${localFormat.boards[0].lists.length} lists and ${localFormat.boards[0].lists.reduce((sum, list) => sum + list.cards.length, 0)} cards`);
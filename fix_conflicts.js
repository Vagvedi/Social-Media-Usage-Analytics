const fs = require('fs');

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // A regex to find Git merge conflicts and only keep the HEAD portion.
    // Format: <<<<<<< HEAD\n(HEAD content)\n=======\n(remote content)\n>>>>>>> branch\n
    // This removes the markers and keeps exactly the HEAD block.
    const regex = /<<<<<<< HEAD\r?\n([\s\S]*?)=======\r?\n[\s\S]*?>>>>>>>[^\n]*\r?\n?/g;
    
    const newContent = content.replace(regex, '\$1');
    
    if (content !== newContent) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log('Fixed:', filePath);
    } else {
      console.log('No conflicts found or unchanged:', filePath);
    }
  } catch (err) {
    console.error('Error processing', filePath, err);
  }
}

fixFile('f:/Vagvedi/Desktop/STUFF/Social-Media-Usage-Analytics/frontend/src/pages/DigitalMirrorMode.jsx');
fixFile('f:/Vagvedi/Desktop/STUFF/Social-Media-Usage-Analytics/README.md');

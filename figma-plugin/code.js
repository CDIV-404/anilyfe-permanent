async function loadFonts() {
  await figma.loadFontAsync({ family: "Inter", style: "Regular" });
  await figma.loadFontAsync({ family: "Inter", style: "Medium" });
  await figma.loadFontAsync({ family: "Inter", style: "Bold" });
}

function solid(hex, opacity = 1) {
  const value = hex.replace("#", "");
  return [{ type: "SOLID", color: { r: parseInt(value.slice(0, 2), 16) / 255, g: parseInt(value.slice(2, 4), 16) / 255, b: parseInt(value.slice(4, 6), 16) / 255 }, opacity }];
}

function rect(parent, x, y, width, height, color, radius = 0) {
  const item = figma.createRectangle();
  item.resize(width, height); item.x = x; item.y = y; item.fills = solid(color); item.cornerRadius = radius; parent.appendChild(item); return item;
}

function label(parent, text, x, y, size = 13, color = "#67506D", weight = "Regular", width = 300) {
  const item = figma.createText();
  item.fontName = { family: "Inter", style: weight }; item.fontSize = size; item.characters = text; item.x = x; item.y = y; item.resize(width, Math.max(size * 1.4, 22)); item.fills = solid(color); parent.appendChild(item); return item;
}

function line(parent, x, y, width, color = "#DCCFDD") { return rect(parent, x, y, width, 1, color); }

async function createBoard() {
  await loadFonts();
  const page = figma.currentPage;
  const board = figma.createFrame();
  board.name = "Anilyfe / Permanent Website / Design Source";
  board.resize(1440, 1900);
  board.x = 0; board.y = 0;
  board.fills = solid("#FBF7FC");
  page.appendChild(board);

  label(board, "AN  |  LYFE", 74, 44, 26, "#55425E", "Bold");
  label(board, "COLLECTIONS      CURATED FINDS      FIGMA SOURCE", 820, 53, 10, "#75667F", "Medium", 430);
  line(board, 62, 98, 1316);

  label(board, "ANILYFE PERMANENT EDITION", 102, 202, 10, "#947D92", "Bold");
  label(board, "Collect worlds", 102, 243, 77, "#55425E", "Medium", 540);
  label(board, "with feeling.", 102, 324, 77, "#A87992", "Medium", 540);
  label(board, "A calmer marketplace for the things that make anime fandom feel like home. Explore thoughtful physical, digital, and collectible pieces.", 104, 430, 14, "#766780", "Regular", 420);
  rect(board, 104, 515, 214, 48, "#67506D", 3); label(board, "EXPLORE THE COLLECTIONS  ↗", 121, 531, 10, "#FFFFFF", "Bold", 190);
  label(board, "SEE THE DESIGN SOURCE  ›", 348, 532, 10, "#806481", "Medium", 210);

  const modelPanel = figma.createFrame();
  modelPanel.name = "Interactive 3D preview / website reference";
  modelPanel.resize(620, 470); modelPanel.x = 697; modelPanel.y = 164; modelPanel.fills = solid("#F4EDF8"); modelPanel.cornerRadius = 2; board.appendChild(modelPanel);
  label(modelPanel, "01 / 08", 18, 14, 9, "#96859A", "Medium", 90); label(modelPanel, "INTERACTIVE OBJECT STUDY", 360, 14, 9, "#96859A", "Medium", 240);
  rect(modelPanel, 18, 42, 584, 406, "#FBF9FB", 1);
  label(modelPanel, "Three.js GLB model lives in the website", 144, 220, 14, "#866F88", "Medium", 350);
  label(modelPanel, "The Figma source defines placement, style, and labels.", 129, 247, 11, "#A891A1", "Regular", 380);

  line(board, 62, 710, 1316); label(board, "QUIETLY COLLECTIBLE     ·     BUILT FOR FANDOM     ·     GENTLE MOTION     ·     ALWAYS EVOLVING", 245, 732, 10, "#857089", "Medium", 940); line(board, 62, 762, 1316);
  label(board, "EXPLORE BY FEELING", 102, 870, 10, "#947D92", "Bold"); label(board, "Categories with a little more world inside them.", 102, 906, 55, "#5A485F", "Medium", 720);

  const categoryNames = ["Figures & collectibles", "Clothing & apparel", "Manga & books", "Accessories", "Posters & wall art", "Digital products", "Home & living", "Cosplay"];
  categoryNames.forEach((name, index) => {
    const column = index % 4; const row = Math.floor(index / 4); const x = 102 + column * 304; const y = 1050 + row * 83;
    rect(board, x, y, 292, 72, index === 0 ? "#FFFDFE" : "#F8F2F8", 0); label(board, `0${index + 1}`, x + 14, y + 13, 8, "#B49AA9", "Medium"); label(board, name, x + 14, y + 36, 12, "#604B62", "Medium", 245);
  });

  rect(board, 102, 1245, 1216, 180, "#FFFCFE", 1); label(board, "FIGURES & COLLECTIBLES", 125, 1272, 10, "#947D92", "Bold"); label(board, "Sculpted stories for shelves, desks, and devoted collections.", 125, 1305, 30, "#604C65", "Medium", 715); label(board, "Original heroes  ·  Mecha & robots  ·  Limited editions", 125, 1370, 10, "#92748C", "Regular", 520);

  label(board, "GENTLE DISCOVERIES", 102, 1510, 10, "#947D92", "Bold"); label(board, "Curated finds for every kind of fan.", 102, 1544, 52, "#5A485F", "Medium", 900);
  ["Sage mode figure", "Shadow crest hoodie", "Battle scene print", "Shonen box set"].forEach((name, index) => {
    const x = 102 + index * 305; rect(board, x, 1640, 280, 160, ["#EEE7F7", "#FAE8E8", "#E9F5EF", "#FAF2E5"][index], 1); label(board, `0${index + 1}`, x + 14, 1654, 8, "#9E8396", "Medium"); label(board, name, x + 14, 1760, 18, "#614E65", "Medium", 210);
  });
  figma.viewport.scrollAndZoomIntoView([board]);
  figma.notify("Anilyfe design source board created. Add image assets with Figma’s image fill tools when ready.");
  figma.closePlugin();
}

createBoard().catch((error) => { figma.notify(`Anilyfe source board could not be created: ${error.message}`); figma.closePlugin(); });

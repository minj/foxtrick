function playerDropped(dropDivId, playerDivElement) {
  
  try {
    
    if ($(dropDivId).firstChild) {
      movePlayerBackToList($(dropDivId).firstChild);
    }
    
   $(dropDivId).appendChild(playerDivElement);
   
  
  } catch (e) {
    alert(e);
  }
  
  
}

function movePlayerBackToList(playerDivElement) {
  $('foxtrick-playerlist').appendChild(playerDivElement);
}
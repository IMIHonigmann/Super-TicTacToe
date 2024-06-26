let room;

let isX = true; // Track which player's turn it is.
let isFieldEditable;
let subCellList = document.querySelectorAll('[class^="subcell"]');
let fieldList = document.querySelectorAll('[class^="field"]');
let color1 = 'black'; // Player 1 color
let color2 = 'red'; // Player 2 color
let currentField;
let chooseCustomField = false; // Flag to allow choosing any field if current one is done.
let latestWonField;
let latestChosenField;
let clickedValidField = false;
let playedOnce = false;
let playSolo = true;

let setUpGameOnce = false;


document.getElementById('playsolobutton').addEventListener('click', () => {
  playSolo = true;
});


document.getElementById('submitipbutton').addEventListener('click', () => {
  document.getElementById('mothercontainer').classList.remove('hidden');
  document.getElementById('roominputs').classList.remove('hidden');
  const ipinput = document.getElementById('ipinput');
  if(ipinput.value === '') ipinput.value = 'localhost';
  const submitipbutton = document.getElementById('submitipbutton');
  const socket = io(`ws://${ipinput.value}:8080`);
  ipinput.remove();
  submitipbutton.remove();
  socket.on('connect', () => {
  if(document.getElementById("playsolobutton")) {
    document.getElementById("playsolobutton").remove();
  }
  console.log('Connected!');
  document.getElementById('connectionstatus').textContent = `Status: Online, Connect to a room to play multiplayer`;
  socket.emit('message', '<connected> ' + socket.id);

  document.getElementById('joinbutton').addEventListener('click', () => {
    room = document.getElementById('roominput').value;
    console.log(room);
    socket.emit('joinRoom', room, (cbmessage) => {
      playSolo = false;
      console.log(cbmessage);
      document.getElementById('connectionstatus').textContent = `Status: ${cbmessage}`;
    });
  });
});

socket.on('logmessage', (msg) => {
  console.log(msg);
});

subCellList.forEach(function(subcell) {
  subcell.style.backgroundColor = '#F2F2F2';

  subcell.addEventListener('click', function(event) {
    let className = event.target.classList[0];
    let numberAsString = className.charAt(className.length - 1);
    let parentField = event.target.closest('table').closest('td');

    if(!parentField.classList.contains('isNotEditable') && !playSolo) {
      document.querySelector('.maintable').classList.add('unclickable');
      clickedValidField = true;
    }

    // Check if the user can choose custom field and the parent field is not already done.
    if (chooseCustomField && !parentField.classList.contains('isDone')) {
      for (let i = 1; i <= 9; i++) {
        if (document.querySelector('.field' + i).classList.contains('isDone')) {
          document.querySelector('.field' + i).classList.add('isNotEditable');
        } else {
          document.querySelector('.field' + i).style.backgroundColor = 'purple';
          document.querySelector('.field' + i).classList.add('isNotEditable');
          parentField.style.backgroundColor = 'white';
          parentField.classList.remove('isNotEditable');
        }
      }
      chooseCustomField = false;
    }

    // Ensure the clicked cell is neither player color and the parent field is not 'NotEditable'
    if (event.target.style.backgroundColor != color1 && 
        event.target.style.backgroundColor != color2 &&
        !parentField.classList.contains('isNotEditable')) {
      
      // Set up the game and apply initial rules post first move.
      if (setUpGameOnce) {
        if (!parentField.classList.contains('isDone')) {
          parentField.classList.add('isNotEditable');
          parentField.style.backgroundColor = 'purple';
        }

        if (!parentField.classList.contains('isDone') &&
            !document.querySelector('.field' + numberAsString).classList.contains('isDone')) {
          document.querySelector('.field' + numberAsString).classList.remove('isNotEditable');
          document.querySelector('.field' + numberAsString).style.backgroundColor = 'white';
        }
      }

      // Handle the player's move
      if (!parentField.classList.contains('isDone')) {
        const li = document.createElement('li');
        if (isX) {
          event.target.style.backgroundColor = color1;
          event.target.classList.add('color1');
          li.textContent = color1;
          document.getElementById('winnerText').textContent = "It's Player " + color2 + "'s turn";
        } else {
          event.target.style.backgroundColor = color2;
          event.target.classList.add('color2');
          li.textContent = color2;
          document.getElementById('winnerText').textContent = "It's Player " + color1 + "'s turn";
        }
        document.getElementById('livecounter').appendChild(li);
        isX = !isX;
      }

      // Allow choosing any field if the next field is already won.
      if (document.querySelector('.field' + numberAsString).classList.contains('isDone')) {
        for (let i = 1; i <= 9; i++) {
          if (!document.querySelector('.field' + i).classList.contains('isDone')) {
            document.querySelector('.field' + i).classList.remove('isNotEditable');
            document.querySelector('.field' + i).style.backgroundColor = 'white';
          }
        }
        chooseCustomField = true;
      }
    }

    // First move setup
    if (!setUpGameOnce) {
      if(document.getElementById("roominput")) {
        document.getElementById("roominput").remove();
      }
      if(document.getElementById("joinbutton")) {
        document.getElementById("joinbutton").remove();
      }
      document.querySelector('.field' + numberAsString).classList.add('startfield');
      for (let i = 1; i <= 9; i++) {
        if (document.querySelector('.field' + i).classList.contains('startfield')) {
          document.querySelector('.field' + i).style.backgroundColor = 'white';
          document.querySelector('.field' + i).classList.remove('isNotEditable');
        } else {
          document.querySelector('.field' + i).style.backgroundColor = 'purple';
          document.querySelector('.field' + i).classList.add('isNotEditable');
        }
      }
      setUpGameOnce = true;
    }

    // Check for winner after every move
    checkRows(event.target, numberAsString);
    checkFields();

    const targetElement = event.target;
    const elementIdentifier = {
      id: targetElement.id,
      class: targetElement.className,
      tagName: targetElement.tagName,
      classList: targetElement.classList,
    };

    socket.emit('sendChoice', socket.id, elementIdentifier, room, numberAsString, clickedValidField);
    clickedValidField = false;
  });
});

function checkRows(cellTarget, numAsString) {
  let cell = cellTarget.classList;
  let parentField = cellTarget.closest('table').closest('td');

  function compareRows(table, cell, othercell1, othercell2) {
    if (
      !document.querySelector('.subcell' + table + cell).closest('table').closest('td').classList.contains('isDone') &&
      document.querySelector('.subcell' + table + cell).style.backgroundColor === document.querySelector('.subcell' + table + othercell1).style.backgroundColor &&
      document.querySelector('.subcell' + table + cell).style.backgroundColor === document.querySelector('.subcell' + table + othercell2).style.backgroundColor &&
      (
        document.querySelector('.subcell' + table + cell).style.backgroundColor === color1 ||
        document.querySelector('.subcell' + table + cell).style.backgroundColor === color2
      )
    ) {
      latestWonField = document.querySelector('.subcell' + table + cell).closest('table').closest('td').classList;
      document.querySelector('.subcell' + table + cell).closest('table').closest('td').classList.add('isDone');
      const audio1 = new Audio('fielddone.mp3');
      audio1.play();
      parentField.style.backgroundColor = document.querySelector('.subcell' + table + cell).style.backgroundColor;

      // Allow choosing any field if the next field is already won
      if (document.querySelector('.field' + numAsString).classList.contains('isDone')) {
        for (let i = 1; i <= 9; i++) {
          if (!document.querySelector('.field' + i).classList.contains('isDone')) {
            document.querySelector('.field' + i).classList.remove('isNotEditable');
            document.querySelector('.field' + i).style.backgroundColor = 'white';
          }
        }
        chooseCustomField = true;
      }
      return true;
    }
    return false;
  }

  // Sequential row/column/diagonal check for 3x3 field grid
  for (let table = 1; table <= 9; table++) {
    for (let cell = 1; cell <= 7; cell += 3)
      compareRows(table, cell, [cell + 1], [cell + 2]);
    for (let cell = 1; cell <= 3; cell++)
      compareRows(table, cell, [cell + 3], [cell + 6]);
    compareRows(table, 1, 5, 9);
    compareRows(table, 3, 5, 7);
  }
}

function styleCellWinner(winnerNum) {
  alert(getCellParentCL(event.target.classList));
  document.getElementById('winnerText').textContent = 'GEWINNER GEWINNER HUEHNCHENDINNER';
  parentField.classList.add('notEditable');
  parentField.style.backgroundColor = isP1('subcell' + winnerNum);
  parentField.style.borderRadius = '20px';
}

function getCellParentCL(subcell) {
  return document.querySelector('.' + subcell).closest('table').closest('td').classList;
}

function checkFields() {
  for (let i = 1; i <= 3; i++) {
    const audio1 = new Audio('fielddone.mp3');
    const audio2 = new Audio('vine-boom.mp3');

    // Check vertical columns for win
    if (isP1('field' + i) != null &&
      isP1('field' + i) == isP1('field' + [i + 3]) &&
      isP1('field' + i) == isP1('field' + [i + 6])) {
      endGame(isP1('field' + i));
    }

    // Play sound if consecutive cells are aligned
    if (!playedOnce) {
      if (isP1('field' + i) != null &&
        isP1('field' + i) == isP1('field' + [i + 3])) {
        playedOnce = true;
      }
      if (isP1('field' + i) != null &&
        isP1('field' + [i + 3]) == isP1('field' + [i + 6])) {
        playedOnce = true;
      }
    }
  }

  // Check horizontal rows for win
  for (let i = 1; i <= 7; i += 3) {
    if (isP1('field' + i) != null &&
      isP1('field' + i) == isP1('field' + [i + 1]) &&
      isP1('field' + i) == isP1('field' + [i + 2])) {
      endGame(isP1('field' + i));
    }

    // Play sound if consecutive cells are aligned
    if (!playedOnce) {
      if (isP1('field' + i) != null &&
        isP1('field' + i) == isP1('field' + [i + 1])) {
        playedOnce = true;
      }
      if (isP1('field' + i) != null &&
        isP1('field' + [i + 1]) == isP1('field' + [i + 2])) {
        playedOnce = true;
      }
    }
  }

  // Check primary diagonal for win
  if (isP1('field1') != null &&
    isP1('field1') == isP1('field5') &&
    isP1('field1') == isP1('field9')) {
    endGame(isP1('field1'));
  }

  // Play sound if consecutive cells are aligned
  if (!playedOnce) {
    if (isP1('field1') != null &&
      isP1('field1') == isP1('field5')) {
      playedOnce = true;
    }
    if (isP1('field1') != null &&
      isP1('field5') == isP1('field9')) {
      playedOnce = true;
    }
  }

  // Check counter-diagonal for win
  if (isP1('field3') != null &&
    isP1('field3') == isP1('field5') &&
    isP1('field3') == isP1('field7')) {
    endGame(isP1('field3'));
  }
  if (!playedOnce) {
    if (isP1('field3') != null &&
      isP1('field3') == isP1('field5')) {
      playedOnce = true;
    }
    if (isP1('field3') != null &&
      isP1('field5') == isP1('field7')) {
      playedOnce = true;
    }
  }
}

function endGame(winner) {
  if (winner == color1) winner = color1;
  else winner = color2;

  document.getElementById('winnerText').textContent = "The " + winner + " player wins";

  // Make all fields non-editable after game ends
  for (let i = 1; i <= 9; i++) {
    if (document.querySelector('.field' + i).classList.contains('isDone')) {
    } else {
      document.querySelector('.field' + i).style.backgroundColor = 'purple';
      document.querySelector('.field' + i).classList.add('isNotEditable');
    }
  }
}

function isP1(field) {
  if (document.querySelector('.' + field).style.backgroundColor === color1) return color1;
  else if (document.querySelector('.' + field).style.backgroundColor === color2) return color2;
}

socket.on('getChoice', (choiceOfOtherPlayer, room, numAsString, clickedValid) => {
  console.log('payload arrived');
  if(clickedValid) {
    document.querySelector('.maintable').classList.remove('unclickable');
  }
  const clickedTarget = document.querySelector('.' + choiceOfOtherPlayer.classList[0]);
  console.log(clickedTarget);
  let className = clickedTarget.classList[0];
  let numberAsString = className.charAt(className.length - 1);
  let parentField = clickedTarget.closest('table').closest('td');

  if (chooseCustomField && !parentField.classList.contains('isDone')) {
    for (let i = 1; i <= 9; i++) {
      if (document.querySelector('.field' + i).classList.contains('isDone')) {
        document.querySelector('.field' + i).classList.add('isNotEditable');
      } else {
        document.querySelector('.field' + i).style.backgroundColor = 'purple';
        document.querySelector('.field' + i).classList.add('isNotEditable');
        parentField.style.backgroundColor = 'white';
        parentField.classList.remove('isNotEditable');
      }
    }
    chooseCustomField = false;
  }

  if (clickedTarget.style.backgroundColor != color1 &&
    clickedTarget.style.backgroundColor != color2 &&
    !parentField.classList.contains('isNotEditable')) {
    if (setUpGameOnce) {
      if (!parentField.classList.contains('isDone')) {
        parentField.classList.add('isNotEditable');
        parentField.style.backgroundColor = 'purple';
      }

      if (!parentField.classList.contains('isDone') &&
        !document.querySelector('.field' + numberAsString).classList.contains('isDone')) {
        document.querySelector('.field' + numberAsString).classList.remove('isNotEditable');
        document.querySelector('.field' + numberAsString).style.backgroundColor = 'white';
      }
    }

    if (!parentField.classList.contains('isDone')) {
      const li = document.createElement('li');
      if (isX) {
        clickedTarget.style.backgroundColor = color1;
        clickedTarget.classList.add('color1');
        li.textContent = color1;
        document.getElementById('winnerText').textContent = "It's Player " + color2 + "'s turn";

      } else {
        clickedTarget.style.backgroundColor = color2;
        clickedTarget.classList.add('color2');
        li.textContent = color2;
        document.getElementById('winnerText').textContent = "It's Player " + color1 + "'s turn";
      }
      document.getElementById('livecounter').appendChild(li);
      isX = !isX;
    }

    if (document.querySelector('.field' + numberAsString).classList.contains('isDone')) {
      for (let i = 1; i <= 9; i++) {
        if (!document.querySelector('.field' + i).classList.contains('isDone')) {
          document.querySelector('.field' + i).classList.remove('isNotEditable');
          document.querySelector('.field' + i).style.backgroundColor = 'white';
        }
      }
      chooseCustomField = true;
    }
  }

  if (!setUpGameOnce) {
    if(document.getElementById("roominput")) {
      document.getElementById("roominput").remove();
    }
    if(document.getElementById("joinbutton")) {
      document.getElementById("joinbutton").remove();
    }
    document.querySelector('.field' + numberAsString).classList.add('startfield');
    for (let i = 1; i <= 9; i++) {
      if (document.querySelector('.field' + i).classList.contains('startfield')) {
        document.querySelector('.field' + i).style.backgroundColor = 'white';
        document.querySelector('.field' + i).classList.remove('isNotEditable');
      } else {
        document.querySelector('.field' + i).style.backgroundColor = 'purple';
        document.querySelector('.field' + i).classList.add('isNotEditable');
      }
    }
    setUpGameOnce = true;
  }


  checkRows(clickedTarget, numAsString);
  checkFields();
  });
});
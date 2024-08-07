let room;

let isX = true; // Track which player's turn it is.
let isFieldEditable;
let subCellList = document.querySelectorAll('[class^="subcell"]');
let fieldList = document.querySelectorAll('[class^="field"]');
let color1 = 'black'; // Player 1 color
let color2 = 'red';   // Player 2 color
let currentField;
let chooseCustomField = false; // Flag to allow choosing any field if current one is done.
let latestWonField;
let latestChosenField;
let clickedValidField = false;
let playedOnce = false;
let playSolo = true;
let countdownTime = 10;
let customCountDownTime = 10;
let timerRunning = true;

let setUpGameOnce = false;

function setUpFields() {
  for (let i = 1; i <= 9; i++) {
    const fieldI = document.querySelector('.field' + i);
    if (fieldI.classList.contains('startfield')) {
      fieldI.style.backgroundColor = 'white';
      fieldI.classList.remove('isNotEditable');
    } else {
      fieldI.style.backgroundColor = 'purple';
      fieldI.classList.add('isNotEditable');
    }
  }
  setUpGameOnce = true;
}

function stopCustomFieldEvent(parentField) {
  if (chooseCustomField && !parentField.classList.contains('isDone')) {
    for (let i = 1; i <= 9; i++) {
      const fieldI = document.querySelector('.field' + i);
      if (fieldI.classList.contains('isDone')) {
        fieldI.classList.add('isNotEditable');
      } else {
        fieldI.style.backgroundColor = 'purple';
        fieldI.classList.add('isNotEditable');
        parentField.style.backgroundColor = 'white';
        parentField.classList.remove('isNotEditable');
      }
    }
    chooseCustomField = false;
  }
}

function removeRoomInput(numberAsString, color) {
  document.body.style.backgroundColor = color;
  if(document.getElementById("roominput")) {
    document.getElementById("roominput").remove();
  }
  if(document.getElementById("joinbutton")) {
    document.getElementById("joinbutton").remove();
  }
  document.querySelector('.field' + numberAsString).classList.add('startfield');
}

function stopCountDown() {
  timerRunning = false;
  document.getElementById('timeleft').textContent = 'Waiting for other player...';
}

function checkWhoScored(clickedTarget) {
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

if (localStorage.getItem('user')) {
  const jsonString = localStorage.getItem('user');
  const userObject = JSON.parse(jsonString);
  document.getElementById('ipinput').value = userObject.ip_address;
} else {
  console.log("No ip found. Reverting to localhost");
}

document.getElementById('playsolobutton').addEventListener('click', () => {
  playSolo = true;
});

document.getElementById('submitipbutton').addEventListener('click', () => {
  document.getElementById('mothercontainer').classList.remove('hidden');
  document.getElementById('roominputs').classList.remove('hidden');
  const ipinput = document.getElementById('ipinput');

  const storedIP = {ip_address: ipinput.value};
  storedIPString = JSON.stringify(storedIP);
  localStorage.setItem('user', storedIPString);
  if (localStorage.getItem('room')) {
    const jsonString = localStorage.getItem('room');
    const roomObject = JSON.parse(jsonString);
    document.getElementById('roominput').value = roomObject.roomName;
  } else {
    console.log("No room found. Reverting to empty");
  }

  if(ipinput.value === '') ipinput.value = 'localhost';
  const submitipbutton = document.getElementById('submitipbutton');
  const socket = io(`ws://${ipinput.value}:8080`);
  room = socket.id;
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
    const storedRoom = {roomName: room};
    const storedRoomString = JSON.stringify(storedRoom);
    localStorage.setItem('room', storedRoomString);
    console.log(room);
    socket.emit('joinRoom', room, (cbmessage) => {
      playSolo = false;
      console.log(cbmessage);
      document.getElementById('connectionstatus').textContent = `Status: ${cbmessage}`;
    });
  });
});

socket.on('sendPlayerCount', playerCount => document.getElementById('curplayercount').textContent = `Currently online: ${playerCount}`)

socket.on('logmessage', (msg) => {
  console.log(msg);
});

subCellList.forEach(function(subcell) {
  subcell.style.backgroundColor = '#F2F2F2';

  subcell.addEventListener('click', function(event) {
    let className = event.target.classList[0];
    let subcellColor = event.target.classList[1];
    let numberAsString = className.charAt(className.length - 1);
    let parentField = event.target.closest('table').closest('td');

    if(!parentField.classList.contains('isNotEditable') && !playSolo && typeof subcellColor === 'undefined') {
      document.querySelector('.maintable').classList.add('unclickable');
      clickedValidField = true;
    }

    // Check if the user can choose custom field and the parent field is not already done.
    stopCustomFieldEvent(parentField)

    // Ensure the clicked cell is neither player color and the parent field is not 'NotEditable'
    const cellBG = event.target.style.backgroundColor;
    if (cellBG != color1 && 
        cellBG != color2 &&
        !parentField.classList.contains('isNotEditable')) {
      
      // Set up the game and apply initial rules post first move.
      if (setUpGameOnce) {
        if (!parentField.classList.contains('isDone')) {
          parentField.classList.add('isNotEditable');
          parentField.style.backgroundColor = 'purple';
        }

        const curCell = document.querySelector('.field' + numberAsString);
        if (!parentField.classList.contains('isDone') &&
            !curCell.classList.contains('isDone')) {
          curCell.classList.remove('isNotEditable');
          curCell.style.backgroundColor = 'white';
        }
      }

      // Handle the player's move
      if (!parentField.classList.contains('isDone')) {
        stopCountDown();
        checkWhoScored(event.target);
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
      document.getElementById('winnerText').style.color = 'white'; //
      document.getElementById('connectionstatus').style.color = 'white'; //
      document.getElementById('curplayercount').style.color = 'white'; //
      document.getElementById('timeleft').style.color = 'white'; //
      removeRoomInput(numberAsString, color1);
      setUpFields();
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
  stopCountDown();
  document.getElementById('timeleft').textContent = ' ';
}

function startCountdown() {
  console.log(countdownTime);
  if(timerRunning) {
    if(countdownTime > 0) {
      countdownTime--;
      document.getElementById('timeleft').textContent = 'Time left: 0:0' + countdownTime;
      setTimeout(startCountdown, 1000);
    }
    else {
        endGame(isX ? color2 : color1);
        document.getElementById('winnerText').textContent = 'You have exceeded your timelimit and are a coward.'
        socket.emit('timeExceeded', socket.id, room);
      // add a strike here
    }
  }
}

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

function isP1(field) {
  if (document.querySelector('.' + field).style.backgroundColor === color1) return color1;
  else if (document.querySelector('.' + field).style.backgroundColor === color2) return color2;
}

socket.on('getChoice', (choiceOfOtherPlayer, room, numAsString, clickedValid) => {
  console.log('payload arrived');
  //////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////
  //////////////////////////////////////////////////////////////////////////////////////
  if(clickedValid) {
    timerRunning = true;
    countdownTime = customCountDownTime;
    startCountdown();
    document.querySelector('.maintable').classList.remove('unclickable');
  }
  const clickedTarget = document.querySelector('.' + choiceOfOtherPlayer.classList[0]);
  console.log(clickedTarget);
  let className = clickedTarget.classList[0];
  let numberAsString = className.charAt(className.length - 1);
  let parentField = clickedTarget.closest('table').closest('td');
  stopCustomFieldEvent(parentField);
  
  
  if (clickedTarget.style.backgroundColor != color1 &&
    clickedTarget.style.backgroundColor != color2 &&
    !parentField.classList.contains('isNotEditable')) {
      if (setUpGameOnce) {
        if (!parentField.classList.contains('isDone')) {
          parentField.classList.add('isNotEditable');
          parentField.style.backgroundColor = 'purple';
        }
        
        const curCell = document.querySelector('.field' + numberAsString);
        if (!parentField.classList.contains('isDone') &&
            !curCell.classList.contains('isDone')) {
          curCell.classList.remove('isNotEditable');
          curCell.style.backgroundColor = 'white';
        }
      }
      
      if (!parentField.classList.contains('isDone')) {
        checkWhoScored(clickedTarget);
      }
      
      if (document.querySelector('.field' + numberAsString).classList.contains('isDone')) {
        for (let i = 1; i <= 9; i++) {
          const fieldI = document.querySelector('.field' + i);
          if (!fieldI.classList.contains('isDone')) {
            fieldI.classList.remove('isNotEditable');
            fieldI.style.backgroundColor = 'white';
          }
        }
        chooseCustomField = true;
      }
    }
    /////////////////////////////////////////////////////////////////// refactor
    if (!setUpGameOnce) {
      removeRoomInput(numberAsString, color2);
      setUpFields();
    }
    
    checkRows(clickedTarget, numAsString);
    checkFields();
  });

  socket.on('exceededTheTimeLimit', () => {
    endGame(isX ? color2 : color1);
    const finalMessage = 'The other player returned to civilian life (fucking coward)';
    document.getElementById('winnerText').textContent = finalMessage;
    alert(finalMessage);
  })
});
const socket = io('ws://localhost:8080');
let room;

let isX = true;
let isFieldEditable;
let subCellList = document.querySelectorAll('[class^="subcell"]');
let fieldList = document.querySelectorAll('[class^="field"]');
let color1 = 'black';
let color2 = 'red';
let currentField;
let chooseCustomField = false;
let latestWonField;
let latestChosenField;
let clicked = false;

let setUpGameOnce = false;

socket.on('connect', () => {
  room = socket.id;
  socket.emit('joinRoom', room, cbmessage => {
    console.log(cbmessage);
  });
  console.log('Connected!');
  document.getElementById('connectionstatus').textContent = `Playing to ${room}`;
  socket.emit('message', '<connected> ' + socket.id);
  document.getElementById('joinbutton').addEventListener('click', () => {
    room = document.getElementById('roominput').value;
    console.log(room);
    socket.emit('joinRoom', room, (cbmessage) => {
      console.log(cbmessage);
      document.getElementById('connectionstatus').textContent = `Connected to ${room}`;
    });
  });
});

socket.on('logmessage', (msg) =>{
  console.log(msg);
})

subCellList.forEach(function(subcell) {
  subcell.style.backgroundColor = '#F2F2F2';
  
  subcell.addEventListener('click', function(event) {
    let className = event.target.classList[0];
    let numberAsString = className.charAt(className.length-1);
    let parentField = event.target.closest('table').closest('td');

    //if you want to have the next player play in the same field or not, drag it before or after the switchfield check
    if(
      chooseCustomField &&
      !parentField.classList.contains('isDone')) {
      for(let i=1; i<=9; i++)
        {
          
          if(document.querySelector('.field' + i).classList.contains('isDone'))
          {
            document.querySelector('.field' + i).classList.add('isNotEditable');
          }
          else {
            document.querySelector('.field' + i).style.backgroundColor = 'purple';
            document.querySelector('.field' + i).classList.add('isNotEditable');

            parentField.style.backgroundColor = 'white';
            parentField.classList.remove('isNotEditable');
            }
        }
        chooseCustomField = false;
    }
    
    
    if(event.target.style.backgroundColor != color1 && 
    event.target.style.backgroundColor != color2 &&
    !parentField.classList.contains('isNotEditable')
    )
    {
        if(setUpGameOnce) {

          if(!parentField.classList.contains('isDone')) {

            parentField.classList.add('isNotEditable');
            parentField.style.backgroundColor = 'purple';
          }
          

          if(
            !parentField.classList.contains('isDone') &&
            !document.querySelector('.field' + numberAsString).classList.contains('isDone')) {

            document.querySelector('.field' + numberAsString).classList.remove('isNotEditable');
            document.querySelector('.field' + numberAsString).style.backgroundColor = 'white';
          }
          
        }

        if(!parentField.classList.contains('isDone'))
        {
            const li = document.createElement('li');
            if(isX)
            {
              event.target.style.backgroundColor = color1;
              event.target.classList.add('color1');
              li.textContent = color1;
              document.getElementById('winnerText').textContent = "It's Player " + color2 + "'s turn";
              
            }
            else if (!isX) {
                event.target.style.backgroundColor = color2;
                event.target.classList.add('color2');
                li.textContent = color2;
                document.getElementById('winnerText').textContent = "It's Player " + color1 + "'s turn";
            }
            document.getElementById('livecounter').appendChild(li);
            isX = !isX;
        }




        // FIXED: when the player is on a won field and chooses a cell in this field, the field gets reverted to white
        // HERE 1st
        if(document.querySelector('.field' + numberAsString).classList.contains('isDone'))
      {

        for(let i=1; i<=9; i++)
          {
            
            if(!document.querySelector('.field' + i).classList.contains('isDone'))
            {
              document.querySelector('.field' + i).classList.remove('isNotEditable');
              document.querySelector('.field' + i).style.backgroundColor = 'white';
            }
          }
          chooseCustomField = true;
      }
    }




      // execute this once to start the game
      if(!setUpGameOnce)
      {
        document.querySelector('.field' + numberAsString).classList.add('startfield');

        for(let i=1;i<=9;i++)
        {
          if(document.querySelector('.field' + i).classList.contains('startfield'))
          {
             document.querySelector('.field' + i).style.backgroundColor = 'white';
             document.querySelector('.field' + i).classList.remove('isNotEditable');
          }
          else {
             document.querySelector('.field' + i).style.backgroundColor = 'purple';
             document.querySelector('.field' + i).classList.add('isNotEditable');
          }
        }

        setUpGameOnce = true;
      }
      
      
      checkRows(event.target, numberAsString);
      checkFields();

    const targetElement = event.target;
    const elementIdentifier = {
    id: targetElement.id,
    class: targetElement.className,
    tagName: targetElement.tagName,
    classList: targetElement.classList,
    };

      socket.emit('sendChoice', elementIdentifier, room, numberAsString);
      clicked = true;
  });

});




///////////////////////////////////////////////////////////////////////////////////////





  function checkRows(cellTarget, numAsString) {
  let cell = cellTarget.classList;
  let parentField = cellTarget.closest('table').closest('td');



  function compareRows(table, cell, othercell1, othercell2)
  {
    if(
      !document.querySelector('.subcell' + table + cell).closest('table').closest('td').classList.contains('isDone') &&
       document.querySelector('.subcell' + table + cell).style.backgroundColor === document.querySelector('.subcell' + table + othercell1).style.backgroundColor &&
       document.querySelector('.subcell' + table + cell).style.backgroundColor === document.querySelector('.subcell' + table + othercell2).style.backgroundColor &&
        (
        document.querySelector('.subcell' + table + cell).style.backgroundColor === color1 || 
        document.querySelector('.subcell' + table + cell).style.backgroundColor === color2
        )
      )
       {
        // TODO: Implement live counter message here
        latestWonField = document.querySelector('.subcell' + table + cell).closest('table').closest('td').classList;
        document.querySelector('.subcell' + table + cell).closest('table').closest('td').classList.add('isDone');
        parentField.style.backgroundColor = document.querySelector('.subcell' + table + cell).style.backgroundColor;

        // Enter CustomFieldChoice
        if(document.querySelector('.field' + numAsString).classList.contains('isDone'))
          {
            for(let i=1; i<=9; i++)
              {
                if(!document.querySelector('.field' + i).classList.contains('isDone'))
                {
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

  for(let table=1; table<=9; table++) {
    for(let cell=1; cell<=7; cell+=3)
      if(compareRows(table, cell, [cell + 1], [cell + 2])) {}

    for(let cell=1; cell<=3; cell++)
      if(compareRows(table, cell, [cell + 3], [cell + 6])) {}

    if(compareRows(table, 1, 5, 9)) {}
    if(compareRows(table, 3, 5, 7)) {}
    
    }

}


function styleCellWinner(winnerNum)
  {
    alert(getCellParentCL(event.target.classList));

        document.getElementById('winnerText').textContent = 'GEWINNER GEWINNER HUEHNCHENDINNER';

        parentField.classList.add('notEditable');
        parentField.style.backgroundColor = isP1('subcell' + winnerNum);
        parentField.style.borderRadius = '20px';
  }

function getCellParentCL(subcell)
{
  return document.querySelector('.' + subcell).closest('table').closest('td').classList
}

function checkFields() {

  for(let i=1;i<=3;i++)
  {

    if(isP1('field' + i) != null &&
       isP1('field' + i) == isP1('field' + [i+3]) &&
       isP1('field' + i) == isP1('field' + [i+6]))
       {
        endGame(isP1('field' + i));
       }
  }

  for(let i=1;i<=7;i+=3)
  {

    if(isP1('field' + i) != null &&
       isP1('field' + i) == isP1('field' + [i+1]) &&
       isP1('field' + i) == isP1('field' + [i+2]))
       {
        endGame(isP1('field' + i));
       }
  }

  if(isP1('field1') != null &&
     isP1('field1') == isP1('field5') &&
     isP1('field1') == isP1('field9'))
       {
        endGame(isP1('field1'));
       }

  if(isP1('field3') != null &&
     isP1('field3') == isP1('field5') &&
     isP1('field3') == isP1('field7'))
     {
      endGame(isP1('field3'));
     }
}

function endGame(winner) {
  if(winner == color1) winner = color1;
  else winner = color2;

  document.getElementById('winnerText').textContent = "The " + winner + " player wins";

  for(let i=1;i<=9;i++)
        {
          if(document.querySelector('.field' + i).classList.contains('isDone'))
          {

          }
          else {
             document.querySelector('.field' + i).style.backgroundColor = 'purple';
             document.querySelector('.field' + i).classList.add('isNotEditable');
          }
        }
}

function isP1(field)
{
  if     (document.querySelector('.' + field).style.backgroundColor === color1) return color1;
  else if(document.querySelector('.' + field).style.backgroundColor === color2) return color2;
}





/////////////////////////////////////////////////////////////////////////////////////////

// socket.on('getChoice', choiceOfOtherPlayer => {
//   console.log('Message received');
//   console.log(choiceOfOtherPlayer.classList);
// })


socket.on('getChoice', (choiceOfOtherPlayer, numAsString) => {
    const clickedTarget = document.querySelector('.' + choiceOfOtherPlayer.classList[0]);
    console.log(clickedTarget);
    let className = clickedTarget.classList[0];
    let numberAsString = className.charAt(className.length-1);
    let parentField = clickedTarget.closest('table').closest('td'); // DONE



    //if you want to have the next player play in the same field or not, drag it before or after the switchfield check
    if(
      chooseCustomField &&
      !parentField.classList.contains('isDone')) {
      for(let i=1; i<=9; i++)
        {
          
          if(document.querySelector('.field' + i).classList.contains('isDone'))
          {
            document.querySelector('.field' + i).classList.add('isNotEditable');
          }
          else {
            document.querySelector('.field' + i).style.backgroundColor = 'purple';
            document.querySelector('.field' + i).classList.add('isNotEditable');

            parentField.style.backgroundColor = 'white';
            parentField.classList.remove('isNotEditable');
            }
        }
        chooseCustomField = false;
    }
    
    
    if(clickedTarget.style.backgroundColor != color1 && 
    clickedTarget.style.backgroundColor != color2 &&
    !parentField.classList.contains('isNotEditable')
    )
    {
        if(setUpGameOnce) {

          if(!parentField.classList.contains('isDone')) {

            parentField.classList.add('isNotEditable');
            parentField.style.backgroundColor = 'purple';
          }
          

          if(
            !parentField.classList.contains('isDone') &&
            !document.querySelector('.field' + numberAsString).classList.contains('isDone')) {

            document.querySelector('.field' + numberAsString).classList.remove('isNotEditable');
            document.querySelector('.field' + numberAsString).style.backgroundColor = 'white';
          }
          
        }

        if(!parentField.classList.contains('isDone'))
        {
            const li = document.createElement('li');
            if(isX)
            {
              clickedTarget.style.backgroundColor = color1;
              clickedTarget.classList.add('color1');
              li.textContent = color1;
              document.getElementById('winnerText').textContent = "It's Player " + color2 + "'s turn";
              
            }
            else if (!isX) {
                clickedTarget.style.backgroundColor = color2;
                clickedTarget.classList.add('color2');
                li.textContent = color2;
                document.getElementById('winnerText').textContent = "It's Player " + color1 + "'s turn";
            }
            document.getElementById('livecounter').appendChild(li);
            isX = !isX;
        }




        // FIXED: when the player is on a won field and chooses a cell in this field, the field gets reverted to white
        // Enter CustomFieldChoice
        if(document.querySelector('.field' + numberAsString).classList.contains('isDone'))
      {

        for(let i=1; i<=9; i++)
          {
            
            if(!document.querySelector('.field' + i).classList.contains('isDone'))
            {
              document.querySelector('.field' + i).classList.remove('isNotEditable');
              document.querySelector('.field' + i).style.backgroundColor = 'white';
            }
          }
          chooseCustomField = true;
      }
    }




      // execute this once to start the game
      if(!setUpGameOnce)
      {
        document.querySelector('.field' + numberAsString).classList.add('startfield');

        for(let i=1;i<=9;i++)
        {
          if(document.querySelector('.field' + i).classList.contains('startfield'))
          {
            document.querySelector('.field' + i).style.backgroundColor = 'white';
            document.querySelector('.field' + i).classList.remove('isNotEditable');
          }
          else {
            document.querySelector('.field' + i).style.backgroundColor = 'purple';
            document.querySelector('.field' + i).classList.add('isNotEditable');
          }
        }

        setUpGameOnce = true;
      }
      
      
      checkRows(clickedTarget, numAsString);
      checkFields();
    clicked = false;
});
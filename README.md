<h1> Net-SuperTicTacToe </h1>

![image](https://github.com/IMIHonigmann/Super-TicTacToe/assets/129157644/2ff99e71-af5b-4290-90d4-5cc2c4b08289)

<h2> What is Super-TicTacToe? </h2>
<p></p>Ultimate tic-tac-toe (also known as super tic-tac-toe, meta tic-tac-toe or (tic-tac-toe)²) is a board game composed of nine tic-tac-toe boards arranged in a 3 × 3 grid. Players take turns playing on the smaller tic-tac-toe boards until one of them wins on the larger board. Compared to traditional tic-tac-toe, strategy in this game is conceptually more difficult and has proven more challenging for computers. (Source: Wikipedia)
<h4>The rules explained in detail: https://en.wikipedia.org/wiki/Ultimate_tic-tac-toe</h4> 

<h2> Why? </h2>
<p> This project started when a friend challenged me to recreate it. Eventually this project became amazing for learning how to handle lots of custom states simultaneously but you know what's even better? </p>

<h2> HANDLING THESE STATES OVER A F***ING NETWORK </h2>
<p> Recently I decided to take on the task on making the project fully playable over websockets using socket.io. And yes it was just as insufferable as you would expect </p>
<p> The thought alone raises so many questions </p>
<ul>
  <li> How do you manage state over a network </li>
  <li> How do you ensure that both don't accidently diverge and stay the same </li>
  <li> How do you keep two equal DOM Elements with different references in line </li>
  <li> etc </li>
</ul>

<h2> But... </h2>
<p> I managed to get it working. </p>
<p> If you wanna try it out (especially the multiplayer). Just download the repo and start the server the instances (in the current version) will connect automatically if you're on the same network </p>
<p> If you want to play with someone outside of you're local network then you can try port forwarding if you have experience, host the server in the cloud or if you want an easy way: download <a href="https://www.radmin-vpn.com/"> Radmin VPN </a> and connect to eachother in a network. Just make sure that you connect to the correct IP-Address in both instances to make it work</p>

<h3> That's all I have to say have fun!</h3>
<h4> NOTE: This project is still in development. I'm hard at work to iron it out </h4>

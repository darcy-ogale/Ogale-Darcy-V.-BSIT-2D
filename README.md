CYBER SERPENT

1. Project Overview

Project Title: Cyber Serpent

The Cyber Serpent game includes a leaderboard feature built in PHP using an Object-Oriented Programming (OOP) structure. The code uses the four OOP pillars—encapsulation, abstraction, inheritance, and polymorphism—to keep the leaderboard organized and well-structured.

---

2. Technology Stack

PHP (OOP)

JSON file storage (scores.json)

HTML

CSS

JavaScript

XAMPP (Apache server)

---

3. Team Members and Contributions

Team Member	Contribution

Leader: Ogale, Darcy [Lead Developer]

Members:

• Famanila, Jerry Andrew [Game Designer]

• Magos, Mark john [Game Deisnger]

• Martin, John Erick [Game Logic]

• Milanio, Harrison [Tech Doc Writer]

---

4. How to Play

Objective

Control the snake to eat food and gain the highest possible score without crashing into walls or your own body.

Start Game

Enter your Player Name in the input field in the side panel.

The Start Game button will be enabled.

Click Start Game to begin.


Controls

↑ Up – Change direction to Up

↓ Down – Change direction to Down

← Left – Change direction to Left

→ Right – Change direction to Right


Food and Scoring

There are two types of food:

Food Type	Appearance	Score	Effect

Normal Food	Red Dot	+1 point	Snake grows by one segment (10 seconds)
Boost Food	Gold Dot	+3 points	Snake grows + temporary speed boost (6 seconds)


Game Over

The game ends when:

The snake collides with its own body (self-collision)


After game over:

“GAME OVER” appears

Final score is displayed

Score is saved to leaderboard

Leaderboard updates automatically

---

5. How to Run the Program

Setup Instructions

You need a local server environment such as XAMPP.

Step 1: Place Files in Server Directory

1. Install XAMPP


2. Start Apache


3. Go to your web root folder:

xampp/htdocs/


4. Create a folder:

cyber_serpent


5. Copy the following files into the folder:

leaderboard.php

gamelogic.js

gamedesign.css

scores.json

index.php (the game loads here)




Step 2: Access the Game

Open your browser and type:

http://localhost/cyber_serpent/index.php

If needed:

1. Go to: http://localhost/dashboard/


2. Replace dashboard with 80 → http://localhost:80


3. Then go to your game folder.



Step 3: Start Playing

Enter your name

Click Start Game

Use arrow keys to control the snake

Score is saved when the game ends

---

Video Demonstration Links

https://drive.google.com/drive/folders/1lkLrMYx3uZ5zF22yXUqa5Al68atz_6kW?usp=drive_link

<?php

class Storage {
    private string $file; 

    public function __construct(string $filePath) {
        $this->file = $filePath;
        if (!file_exists($this->file)) {
        
            file_put_contents($this->file, json_encode([])); 
        }
    }

    protected function read(): array { 
        $content = file_get_contents($this->file);
        
        return $content ? json_decode($content, true) ?? [] : []; 
    }

    protected function write(array $data): bool { 
        return file_put_contents($this->file, json_encode($data)) !== false;
    }

    public function addScore(string $name, int $score) {
       
    }

    public function getTopScores(): array {
        return $this->read();
    }
}

class Leaderboard extends Storage {
    public function addScore(string $name,int $score){
        $data = $this->read();
        $data[] = ['name'=>htmlspecialchars($name),'score'=>$score]; 

       
        usort($data, fn($a,$b)=>$b['score']-$a['score']);
        $data=array_slice($data,0,10);
        $this->write($data);
    }
    
    public function resetScores(): bool {
        return $this->write([]);
    }
}

$leaderboard = new Leaderboard('scores.json');

if($_SERVER['REQUEST_METHOD']==='POST' && isset($_POST['action'])){
    header('Content-Type: application/json');
    $action = $_POST['action'];
    if($action==='submit'){
      
        $name = trim($_POST['name'] ?? 'Anonymous');
        $score = (int)($_POST['score'] ?? 0);
        
        if(empty($name) || $score < 0){
            echo json_encode(['status'=>'error', 'message'=>'Invalid data']);
            exit;
        }
        
        $leaderboard->addScore($name,$score);
        echo json_encode(['status'=>'success']);
    } elseif($action==='get'){
        echo json_encode($leaderboard->getTopScores());
    } elseif($action==='reset'){ 
        $leaderboard->resetScores();
        echo json_encode(['status'=>'success']);
    }
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Cyber Serpent</title>
<link rel="stylesheet" href="gamedesign.css">
</head>
<body>

<h1>🐍Cyber Serpent🐍</h1>

<div id="main-content-wrapper">
    
    <div id="game-container">
        <canvas id="game" width="600" height="600"></canvas> 
        <div id="scoreDisplay">Score: 0</div>
        <div class="game-info">
            <h3>Game Rules & Food Types</h3>
            <p>Use arrow keys to move.</p>
            <ul>
                <li>**Red Dot (Regular Food):** +1 point, increases length.</li>
                <li>**Gold Dot (Speed Boost Food):** +3 points, gives a short speed burst.</li>
            </ul>
        </div>
    </div>

    <div id="right-panel">
        <div id="player-controls">
            <h2>Player</h2>
            <input type="text" id="playerName" placeholder="Enter your player name" maxlength="15">
            <button id="startBtn">START GAME</button>
            <div id="errorMessage" style="color: #ff0000; background: rgba(255, 0, 0, 0.1); border: 1px solid #ff0000; padding: 5px; margin-top: 10px; display: none; border-radius: 5px; font-size: 0.9em; text-align: center;"></div>
            <button id="resetLeaderboardBtn" style="margin-top: 10px;">RESET LEADERBOARD</button>
        </div>
        
        <div id="leaderboard-panel">
            <h2>Leaderboard</h2>
            <ul id="leaderboard">
                <li>Loading...</li>
            </ul>
        </div>
    </div>

</div>

<script src="gamelogic.js"></script>
</body>
</html>
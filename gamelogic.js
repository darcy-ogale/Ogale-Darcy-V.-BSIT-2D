class SnakeGame {
    static INITIAL_SPEED = 150;
    static MIN_SPEED = 50; 
    
    static REGULAR_FOOD_COLOR = '#f00';    
    static GOLDEN_FOOD_COLOR = '#ffd700'; 
    
    static MIN_FOOD_DISTANCE = 5; 
    static REGULAR_FOOD_LIFESPAN_TICKS = 100; 
    static GOLDEN_FOOD_LIFESPAN_TICKS = 60;  
    static FOOD_DECAY_INTERVAL = 50; 

    constructor(canvas){
        this.canvas=canvas;
        this.ctx=canvas.getContext('2d');
        this.tileSize=20;
        this.columns=Math.floor(canvas.width/this.tileSize); 
        this.rows=Math.floor(canvas.height/this.tileSize);   
        this.reset();
        this.bindEvents();
        this.isRunning = false; 
        this.draw(); 
        
        this.foodDecayTimer = null; 
    }

    reset(){
        this.snake=[{x:Math.floor(this.columns/2),y:Math.floor(this.rows/2)}];
        this.dx=1; this.dy=0;
        this.food=this.randomAvailableFoodLocation(SnakeGame.REGULAR_FOOD_LIFESPAN_TICKS); 
        this.goldenFood=null; 
        this.score=0;
        this.gameOver=false;
        this.errorMessage=null; 
        this.errorTimer=null;   
        
        this.currentSpeed = SnakeGame.INITIAL_SPEED; 
        this.speedTimer=null;
        
        this.gameSpeedBeforeBoost = SnakeGame.INITIAL_SPEED; 
        this.boostTimerId = null; 
        this.increaseSpeedCounter = 0; 
        
        this.updateScoreDisplay(); 
        
        if (this.speedTimer) clearTimeout(this.speedTimer);
        if (this.foodDecayTimer) clearInterval(this.foodDecayTimer); 
        
        this.isRunning = false;
    }

    randomFood(){ return {x:Math.floor(Math.random()*this.columns),y:Math.floor(Math.random()*this.rows)}; }
    
    randomAvailableFoodLocation(lifespanTicks) {
        let newFood;
        const occupiedFoodLocations = [];
        if (this.food && this.food.lifetime > 0) occupiedFoodLocations.push(this.food);
        if (this.goldenFood && this.goldenFood.lifetime > 0) occupiedFoodLocations.push(this.goldenFood);
        
        const minDistance = SnakeGame.MIN_FOOD_DISTANCE; 

        do {
            newFood = this.randomFood();
            
            const overlapsSnake = this.snake.some(segment => 
                segment.x === newFood.x && segment.y === newFood.y
            );
            
            const tooCloseToFood = occupiedFoodLocations.some(existingFood => 
                this.distance(newFood, existingFood) < minDistance
            );

            if (!overlapsSnake && !tooCloseToFood) {
                // Lifespan is stored as a number of ticks (e.g., 100 for 10 seconds)
                return {...newFood, lifetime: lifespanTicks};
            }

        } while (true); 
    }

    distance(p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    }

    bindEvents(){
        document.addEventListener('keydown',e=>{
            if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }
            if (!this.isRunning) return; 

            switch(e.key){
                case 'ArrowUp': if(this.dy===0){this.dx=0;this.dy=-1;} break;
                case 'ArrowDown': if(this.dy===0){this.dx=0;this.dy=1;} break;
                case 'ArrowLeft': if(this.dx===0){this.dx=-1;this.dy=0;} break;
                case 'ArrowRight': if(this.dx===0){this.dx=1;this.dy=0;} break;
            }
        });
    }
    
    increaseGameSpeed() {
        if (this.increaseSpeedCounter % 5 === 0 && this.increaseSpeedCounter > 0) {
            this.gameSpeedBeforeBoost = Math.max(SnakeGame.MIN_SPEED, this.gameSpeedBeforeBoost - 5);
            
            if (!this.boostTimerId) {
                this.currentSpeed = this.gameSpeedBeforeBoost;
                
                if (this.speedTimer) {
                    clearTimeout(this.speedTimer);
                    this.loop();
                }
            }
        }
    }


    applySpeedBoost(){
        if (this.boostTimerId) {
            clearTimeout(this.boostTimerId);
        }

        this.currentSpeed = SnakeGame.MIN_SPEED; 

        this.boostTimerId = setTimeout(() => {
            this.revertSpeed();
        }, 3000); 

        clearTimeout(this.speedTimer);
        this.loop();
    }

    revertSpeed(){
        if (this.boostTimerId) {
            clearTimeout(this.boostTimerId);
            this.boostTimerId = null;
        }

        this.currentSpeed = this.gameSpeedBeforeBoost;
        
        clearTimeout(this.speedTimer);
        this.loop();
    }

    checkCollision(head){
        for(let i=1; i < this.snake.length; i++){
            if(head.x===this.snake[i].x && head.y===this.snake[i].y){
                return true;
            }
        }
        return false;
    }

    checkFood(head){
        let ateFood = false;

        if(head.x===this.food.x && head.y===this.food.y){
            this.score+=1; 
            this.food=this.randomAvailableFoodLocation(SnakeGame.REGULAR_FOOD_LIFESPAN_TICKS); 
            this.increaseSpeedCounter++; 
            this.increaseGameSpeed();    
            ateFood = true;
        }

        if(this.goldenFood && head.x===this.goldenFood.x && head.y===this.goldenFood.y){
            this.score+=3; 
            this.goldenFood=null; 
            
            this.applySpeedBoost();
            
            ateFood = true;
        }
        
        return ateFood; 
    }

    updateScoreDisplay(){
        document.getElementById('scoreDisplay').textContent=`Score: ${this.score}`;
    }

    roundRect(x, y, w, h, radius) {
        let r = radius;
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x + r, y);
        this.ctx.arcTo(x + w, y, x + w, y + h, r);
        this.ctx.arcTo(x + w, y + h, x, y + h, r);
        this.ctx.arcTo(x, y + h, x, y, r);
        this.ctx.arcTo(x, y, x + w, y, r);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    displayOnCanvas(message) {
        if (this.errorTimer) {
            clearTimeout(this.errorTimer);
        }
        
        this.isRunning = false;
        if (this.speedTimer) {
             clearTimeout(this.speedTimer);
             this.speedTimer = null;
        }
        if (this.foodDecayTimer) {
            clearInterval(this.foodDecayTimer);
            this.foodDecayTimer = null;
        }

        this.errorMessage = message;
        this.draw(); 

        this.errorTimer = setTimeout(() => {
            this.errorMessage = null;
            this.draw(); 
        }, 4000);
        
        document.getElementById('startBtn').disabled = false;
        document.getElementById('playerName').disabled = false; 
    }

    draw(){
        this.ctx.fillStyle='#000';
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height);

        if (this.isRunning || this.gameOver) {
            
            if (this.food.lifetime > 0) {
                const tileX = this.food.x * this.tileSize;
                const tileY = this.food.y * this.tileSize;
                
                this.ctx.fillStyle=SnakeGame.REGULAR_FOOD_COLOR; 
                this.roundRect(tileX + 2, tileY + 2, this.tileSize-4, this.tileSize-4, 5);
                
                this.ctx.fillStyle = '#fff';
                this.ctx.font = '10px Courier New';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(
                    Math.ceil(this.food.lifetime / 10).toFixed(0), 
                    tileX + this.tileSize / 2, 
                    tileY + this.tileSize / 2 + 3
                );
            }

            if (this.goldenFood && this.goldenFood.lifetime > 0) {
                const goldenTileX = this.goldenFood.x * this.tileSize;
                const goldenTileY = this.goldenFood.y * this.tileSize;

                this.ctx.fillStyle=SnakeGame.GOLDEN_FOOD_COLOR; 
                this.roundRect(goldenTileX, goldenTileY, this.tileSize-1, this.tileSize-1, 5);

                this.ctx.fillStyle = '#000';
                this.ctx.font = '10px Courier New';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(
                    Math.ceil(this.goldenFood.lifetime / 10).toFixed(0), 
                    goldenTileX + this.tileSize / 2, 
                    goldenTileY + this.tileSize / 2 + 3
                );
            }

            this.ctx.fillStyle='#0f0'; 
            this.snake.forEach(segment=>{
                const x = segment.x * this.tileSize;
                const y = segment.y * this.tileSize;
                const size = this.tileSize - 1; 
                this.roundRect(x, y, size, size, 3);
            });
        }


        if(this.gameOver){
            this.ctx.fillStyle='white';
            this.ctx.font='30px Courier New';
            this.ctx.textAlign='center';
            this.ctx.fillText('GAME OVER', this.canvas.width/2, this.canvas.height/2);
            this.ctx.font='15px Courier New';
            this.ctx.fillText('Score: '+this.score, this.canvas.width/2, this.canvas.height/2+30);
        } else if (this.errorMessage) {
            
            const boxWidth = 500;
            const boxHeight = 100;
            const boxX = (this.canvas.width - boxWidth) / 2;
            const boxY = (this.canvas.height - boxHeight) / 2;
            
            const warningColor = '#F00'; 

            this.ctx.shadowColor = warningColor;
            this.ctx.shadowBlur = 15;
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.2)'; 
            this.roundRect(boxX - 5, boxY - 5, boxWidth + 10, boxHeight + 10, 10);
            this.ctx.shadowBlur = 0; 

            this.ctx.fillStyle = '#000000'; 
            this.ctx.strokeStyle = warningColor; 
            this.ctx.lineWidth = 3;
            
            this.roundRect(boxX, boxY, boxWidth, boxHeight, 8); 
            this.ctx.stroke(); 
            
            this.ctx.fillStyle = warningColor; 
            this.ctx.font = '14px "Courier New", monospace'; 
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            const lines = this.errorMessage.split('. ');
            const lineHeight = 18; 
            
            let currentY = boxY + boxHeight / 2 - (lines.length - 1) * lineHeight / 2;
            
            lines.forEach((line, index) => {
                this.ctx.fillText(line.trim(), this.canvas.width / 2, currentY + index * lineHeight);
            });
            this.ctx.textBaseline = 'alphabetic'; 
        }
    }
    
    decayFood() {
        if (!this.isRunning) return;

        if (this.food.lifetime > 0) {
            this.food.lifetime--;
        } else {
            this.food = this.randomAvailableFoodLocation(SnakeGame.REGULAR_FOOD_LIFESPAN_TICKS);
        }
        
        if (this.goldenFood) {
            if (this.goldenFood.lifetime > 0) {
                this.goldenFood.lifetime--;
            } else {
                this.goldenFood = null; 
            }
        }
        
        this.draw(); 
    }

    move(){
        let head={x:this.snake[0].x+this.dx,y:this.snake[0].y+this.dy};

        if (head.x < 0) {
            head.x = this.columns - 1; 
        } else if (head.x >= this.columns) {
            head.x = 0; 
        }

        if (head.y < 0) {
            head.y = this.rows - 1; 
        } else if (head.y >= this.rows) {
            head.y = 0; 
        }

        if(this.checkCollision(head)){
            this.gameOver=true;
            this.isRunning = false;
            clearTimeout(this.speedTimer);
            clearInterval(this.foodDecayTimer); 
            this.submitScore();
            return;
        }

        this.snake.unshift(head);

        let ateFood = this.checkFood(head);
        
        if(!ateFood){
            this.snake.pop();
        } else {
            this.updateScoreDisplay();
        }
        
        if (!this.goldenFood) {
            if (Math.random() < 0.20) { 
                this.goldenFood = this.randomAvailableFoodLocation(SnakeGame.GOLDEN_FOOD_LIFESPAN_TICKS);
            }
        }
        
    }

    loop(){
        if(this.gameOver || !this.isRunning) return; 

        this.speedTimer=setTimeout(()=>{
            this.move();
            this.draw();
            this.loop();
        },this.currentSpeed); 
    }
    
    startFoodDecay() {
        if (this.foodDecayTimer) clearInterval(this.foodDecayTimer);
        this.foodDecayTimer = setInterval(() => {
            this.decayFood();
        }, SnakeGame.FOOD_DECAY_INTERVAL);
    }

    async submitScore(){
        let name=document.getElementById('playerName').value.trim();
        if(!name || document.getElementById('playerName').disabled === false){
            return;
        }
        
        const maxRetries = 3;
        let retryCount = 0;

        while (retryCount < maxRetries) {
            try {
                await fetch('leaderboard.php',{
                    method:'POST',
                    headers:{'Content-Type':'application/x-www-form-urlencoded'},
                    body:`action=submit&name=${encodeURIComponent(name)}&score=${this.score}`
                });
                break; 
            } catch (error) {
                retryCount++;
                if (retryCount >= maxRetries) {
                    console.error("Failed to submit score after multiple retries:", error);
                    break;
                }
                const delay = Math.pow(2, retryCount) * 1000; 
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        loadLeaderboard(name); 

        document.getElementById('playerName').disabled=false;
        document.getElementById('startBtn').disabled=false;
        
        document.getElementById('playerName').value = '';
    }
}

async function resetLeaderboard() {
    console.log('Attempting to reset leaderboard...');
    
    const btn = document.getElementById('resetLeaderboardBtn');
    if (btn) btn.disabled = true;

    try {
        const response = await fetch('leaderboard.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=reset'
        });

        const result = await response.json();
        if (result.status === 'success') {
            console.log('Leaderboard successfully reset.');
            loadLeaderboard(); 
        } else {
            console.error('Failed to reset leaderboard:', result.message);
        }
    } catch (error) {
        console.error('Error during leaderboard reset:', error);
    } finally {
        if (btn) btn.disabled = false;
    }
}

let game;
document.getElementById('startBtn').addEventListener('click', async () => {
    let playerName = document.getElementById('playerName').value.trim();
    const startBtn = document.getElementById('startBtn');
    
    if (!game) {
        game = new SnakeGame(document.getElementById('game'));
    }
    
    if (startBtn.disabled) return;
    
    if (game.isRunning) {
        console.warn("Attempted to start while running.");
        return; 
    }
    
    game.isRunning = false; 
    if (game.speedTimer) clearTimeout(game.speedTimer);
    if (game.foodDecayTimer) clearInterval(game.foodDecayTimer); 
    
    game.errorMessage = null; 
    game.draw(); 

    startBtn.disabled = true; 

    if (!playerName) { 
        game.displayOnCanvas('Error: Enter your name before starting.');
        return;
    }
    
    const scores = await getLeaderboardScores();
    const nameExists = scores.some(score => score.name.toLowerCase() === playerName.toLowerCase());
    
    if (nameExists) {
        game.displayOnCanvas(`Error: The name '${playerName}' is already on the leaderboard. Please choose a unique name.`);
        return; 
    }

    document.getElementById('playerName').disabled = true;
    
    game.reset(); 
    game.isRunning = true; 
    game.loop();
    game.startFoodDecay(); 
});

const resetBtn = document.getElementById('resetLeaderboardBtn');
if (resetBtn) {
    resetBtn.addEventListener('click', resetLeaderboard);
}


async function getLeaderboardScores() {
    const maxRetries = 3;
    let retryCount = 0;

    while (retryCount < maxRetries) {
        try {
            let res=await fetch('leaderboard.php',{
                method:'POST',
                headers:{'Content-Type':'application/x-www-form-urlencoded'},
                body:'action=get'
            });
            return await res.json();
        } catch (e) {
            retryCount++;
            if (retryCount >= maxRetries) {
                console.error("Failed to fetch scores after multiple retries:", e);
                return [];
            }
            const delay = Math.pow(2, retryCount) * 1000; 
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    return [];
}


async function loadLeaderboard(lastPlayer=''){
    let scores = await getLeaderboardScores(); 
    
    let lb=document.getElementById('leaderboard');
    lb.innerHTML='';
    
    scores.sort((a,b)=>b.score-a.score);

    if (scores.length === 0) {
        lb.innerHTML = '<li>No scores yet. Be the first!</li>';
        return;
    }

    scores.forEach(s=>{
        let li=document.createElement('li');
        li.innerHTML=`
            <span>${s.name}</span> 
            <span>${s.score}</span>
        `;
        
        if(s.name===lastPlayer && s.score===game?.score){ 
            li.classList.add('highlight');
        } else if (s.name===lastPlayer && !game) {
            li.classList.add('highlight');
        }

        lb.appendChild(li);
    });
}

loadLeaderboard();
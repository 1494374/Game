const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Variables
var levelText;
var player;
var gravity;
var obstacles = [];
var gameSpeed;
var keys = {};
var levelsCompleted = JSON.parse(localStorage.getItem('levelsCompleted'));
var levelCompletedCalled = false;

// Difficulty parameters
var speed;
var timer;
var initialSpawnTimer;
var spawnTimer;
var numberOfObstacles;
var obstacleCounter = 0;
var currentLevel;

// Array with all the possible parameters of a level
var levelParams = JSON.parse(data); //JSON.parse(localStorage.getItem('levels'));
var timeAlive = 0;
timeAlive = setInterval(function() {
    timeAlive++;
}, 1000);
var timeAliveRecord;
if (localStorage.timeAliveRecord) {
    timeAliveRecord = JSON.parse(localStorage.getItem('timeAliveRecord'));
} else {
    timeAliveRecord = [];
}
var averageTimeAlive;

var rightLevelRecord;
if (localStorage.rightLevelRecord) {
    rightLevelRecord = JSON.parse(localStorage.getItem('rightLevelRecord'));
} else {
    rightLevelRecord = [];
}

var levelsPlayedParams = {};
if (localStorage.levelsPlayedParams) {
    levelsPlayedParams = JSON.parse(localStorage.getItem('levelsPlayedParams'));
} else {
    levelsPlayedParams[1] = levelParams[0].params;
}

var rightLevel;
if (localStorage.rightLevel) {
    rightLevel = localStorage.getItem('rightLevel');
} else {
    rightLevel = 0; //Math.floor(Math.random() * levelParams.length);
}
if (rightLevelRecord.length === 0) {
    rightLevelRecord.push(levelParams[rightLevel].level)
}


// Event listeners
document.addEventListener('keydown', function(event) {
    keys[event.code] = true;
});
document.addEventListener('keyup', function(event) {
    keys[event.code] = false;
});

class Text {
    constructor(t, x, y, a, c, s) {
        this.t = t;
        this.x = x;
        this.y = y;
        this.a = a;
        this.c = c;
        this.s = s;
    }

    Draw() {
        ctx.beginPath();
        ctx.fillStyle = this.c;
        ctx.font = this.s + "px sans-serif";
        ctx.textAlign = this.a;
        ctx.fillText(this.t, this.x, this.y);
        ctx.closePath();
    }
}

// Game Functions
function Setup() {    
    speed = levelsPlayedParams[level].speed;
    timer = levelsPlayedParams[level].distance;
    numberOfObstacles = levelsPlayedParams[level].obstacles;

    initialSpawnTimer = timer;
    spawnTimer = initialSpawnTimer;
    currentLevel = level;
}

function SpawnObstacle() {
    var obstacle;
    var w;
    var h;
    var isBird = Math.random() < 0.4;

    if (isBird) {
        w = 100;
        h = 50;
        obstacle = new Bird(canvas.width + w, canvas.height - h, w, h, '#2484E4');
    } else {
        var type = RandomIntInRange(0, 2);        
        obstacle = new Obstacle(canvas.width, canvas.height, type, '#2484E4');
    }
        
    obstacles.push(obstacle);
}
function RandomIntInRange(min, max) {
    return Math.round(Math.random() * (max - min) + min);
}
function Start() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.font = "20px sans-serif"

    gameSpeed = speed;
    gravity = 1;

    player = new Player(150, 0, 50, 100, '#FF5858');

    levelText = new Text("Level: " + level, 25, 25, "left", "#212121", "20");
    requestAnimationFrame(Update);
}

function Update() {
    requestAnimationFrame(Update);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    spawnTimer--; 
    if (spawnTimer <= 0) {
        if (obstacleCounter < numberOfObstacles) {
            SpawnObstacle();
            obstacleCounter++;
            console.log(obstacles);
            spawnTimer = initialSpawnTimer - gameSpeed * 8;
        } else if (obstacles[numberOfObstacles - 1].x + obstacles[numberOfObstacles - 1].w < 0 && player.jumpTimer == 0) {
            if (!levelCompletedCalled) {
                levelCompletedCalled = true;
                timeAliveRecord.push(timeAlive);
                var chances = timeAliveRecord.length;
                // Compute average time alive
                var sum = 0;
                for(var i = 0; i < timeAliveRecord.length; i++) {
                    sum += timeAliveRecord[i];
                }
                averageTimeAlive = sum / timeAliveRecord.length;

                // Find the parameters for a level with the closest avg time alive
                var difference = 0;
                var bestDifference = Infinity;
                var repeatedTimeAlive = [];
                for (var i = 0; i < levelParams.length; i++){
                    if (levelParams[i].level === currentLevel) {
                        // Look for the entry with the closest 'timeAlive' value
                        difference = Math.abs(averageTimeAlive - levelParams[i].timeAlive);
                        if (difference < bestDifference) {
                            bestDifference = difference;
                            repeatedTimeAlive = [i];
                        } else if (difference === bestDifference) {
                            repeatedTimeAlive.push(i);
                        }
                    }
                }

                var indexOfPlayerModel = repeatedTimeAlive[Math.floor(Math.random() * repeatedTimeAlive.length)];
                var playerModel = levelParams[indexOfPlayerModel].generation;

                // Find max time alive of the player model
                var max = 0;
                var repeatedMaxTimeAlive = []
                speed = speed === 5 ? 10 : speed;
                speed = speed === 30 ? 25 : speed;
                levelParams.forEach(function(item, i) {
                    
                    if (chances <= 5) {
                        if (item.generation === playerModel && item.params.speed > speed) {
                            if (item.timeAlive > max) {
                                max = item.timeAlive;
                                repeatedMaxTimeAlive = [i];
                            } else if (max === item.timeAlive) {
                                repeatedMaxTimeAlive.push(i);
                            }
                        }
                    } else { // chances > 5
                        if (item.generation === playerModel && item.params.speed < speed) {
                            if (item.timeAlive > max) {
                                max = item.timeAlive;
                                repeatedMaxTimeAlive = [i];
                            } else if (max === item.timeAlive) {
                                repeatedMaxTimeAlive.push(i);
                            }
                        }
                    }
                });
                rightLevel = repeatedMaxTimeAlive[Math.floor(Math.random() * repeatedMaxTimeAlive.length)];

                if (!rightLevelRecord.includes(levelParams[rightLevel].level)) {
                    rightLevelRecord.push(levelParams[rightLevel].level);
                } else {
                    while (rightLevelRecord.includes(levelParams[rightLevel].level)) {
                        rightLevel++;
                        if (rightLevel === levelParams.length) {
                            rightLevel = 0;
                        }
                        if (rightLevelRecord.length === 9) {
                            rightLevelRecord = [];
                        }
                    }
                    rightLevelRecord.push(levelParams[rightLevel].level);
                }
                localStorage.setItem('rightLevelRecord', JSON.stringify(rightLevelRecord)); 

                timeAliveRecord = [];
                localStorage.setItem('timeAliveRecord', JSON.stringify(timeAliveRecord)); 
                localStorage.setItem('rightLevel', rightLevel);
                if (!levelsPlayedParams.hasOwnProperty(level + 1)) {
                    levelsPlayedParams[level + 1] = levelParams[rightLevel].params;
                }
                localStorage.setItem('levelsPlayedParams', JSON.stringify(levelsPlayedParams));

                Setup();
                successModal.style.display = "block";
                    if (level != 9) {
                        levelsCompleted[level + 1] = true;
                        localStorage.setItem('levelsCompleted', JSON.stringify(levelsCompleted));
                    }
                }
            }

            if (spawnTimer < 60) {
                spawnTimer = 60;
            }
    }

    // Spawn Enemies
    for (var i = 0; i < obstacles.length; i++) {
        var o = obstacles[i];

        // if (o.x + o.w < 0) {
        //     // obstacles.splice(i,1);
        //     if (obstacleCounter == numberOfObstacles) {
        //         modal.style.display = "block";
        //     }
        // }

        if (
            player.x < o.x + o.w && 
            player.x + player.w > o.x && 
            player.y < o.y + o.h && 
            player.y + player.h > o.y
        ) {
            // obstacles = [];
            if (timeAlive > 1) { 
                timeAliveRecord.push(timeAlive);
                localStorage.setItem('timeAliveRecord', JSON.stringify(timeAliveRecord)); 
            }
            timeAlive = 0;
            spawnTimer = initialSpawnTimer;
            gameSpeed = speed;
            failModal.style.display = "block";
        }

        // Stop updating obstacles when the modal is shown
        if (failModal.style.display != "block" && successModal.style.display != "block") {
            o.Update();
        } else {
            o.Draw();
        }
    }
    // Stop animating the player when the modal is shown
    if (failModal.style.display != "block" && successModal.style.display != "block") {
        player.Animate();
    } else {
        player.Draw();
    }
    
    levelText.Draw();

    gameSpeed += 0.003;

    // Background line
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 130);
    ctx.lineTo(canvas.width, canvas.height - 130);
    ctx.stroke();
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

var level = parseInt(getParameterByName('level'));

Setup();
Start();

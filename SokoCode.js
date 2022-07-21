let tick = 0;

let cursorX, cursorY;
let codeText;
let codeWidthLimit = 15;
let codeHeightLimit = 18;
let cursorBlink;

let robotX, robotY, robotDir, robotState, robotTrapped;

let level = [];
let filledHoles = []; // just for looks, shouldn't cause any puzzle interaction
let goals = [];
// max level size is 9 by 5 

const ALL_LEVELS = {
	'Test Level' : {
		description : ' This is a test level',
		versions : [	 // there can be multiple versions of the level that the player would need to account for
			{
				grid : [ // the grid of boxes or walls
					[1,0,0,0,1,6,5,3,4],
					[0,1,0,0,0,3,2,1,4],
					[0,1,0,0,0,0,0,0,2],
					[0,0,0,0,0,0,0,0,7],
					[0,1,1,1,0,0,0,0,0]
				],
				goals : [ // 
					[3,2], 
					[5,2]
				],
				startPos : [3,3],
				startDir : 1
			},
		],
		startCode : [
			'/SOME TEST CODE',
			'START:',
			'ROT LEFT',
			'PUL FORWARD',
			'MOV LEFT',
			'MID: ROT LEFT',
			'CHK FORWARD',
			'JMT START',
			'MOV RIGHT',
			'JMP MID',
			'',
			'/NOT MEANT TO',
			'/DO ANYTHING',
			'/IMPORTANT.',
			'',
			'/...YET'
		]
	},
	'Second Test' : {
		description : ' Just a second level to look at, this is also a test of a really long description just to show what it would potentially look like.',
		versions : [	 
			{
				grid : [
					[0,0,0],
					[0,1,0],
					[0,0,0],
				],
				goals : [
					[0,1]
				],
				startPos : [0,0],
				startDir : 3,
			},
			{
				grid : [
					[0,0,0],
					[0,1,0],
					[0,0,0],
				],
				goals : [
					[0,1]
				],
				startPos : [2,2],
				startDir : 3,
			},
		],
		startCode : [
			'MOV UP',
			'MOV UP',
			'MOV RIGHT',
			'MOV RIGHT',
			'MOV DOWN',
			'MOV LEFT'
		]
	}
};

/*
	puzzle ideas
	
	single row, teach push and pull (tutorial)
	using rotation to count (counting)
	two rows of boxes (repetition)
	row of boxes that have to either be on the top or middle row
		(this could include randomized solutions)

*/

const solids = [
	false,
	false,

	true, // .
	true, // -
	true, // |
	true, // +
	true, // []

	false
]

const emptyish = [
	true,
	false,

	false,
	false,
	false,
	false,
	false,

	true
];
/*
	tiles
	0 = empty
	1 = block
	2 = wall
	3 = wall extend right
	4 = wall extend down
	5 = wall extend right and down
	6 = wall extend right, down, and corner

*/

let compiledCode; // compiled version of the text [[inst ID, data, line number], ..]
let isCompiled;
let errorMessage;
let executingLine; // line that's next to be executed
let lastExecutedLine;
let isRunning;
let autoRun;
let autoRunDelay;
let levelTime;

let levelScore;
let prevBestChar;

let currentScene;
let currentLevel;
let currentVersion;
let testingVersion;
let currentSolution;

let levelCursor;
let levelSolutionCursor;
let levelSelectStage;
let levelDeleteKey;

let extraMenuCursor;
let extraMenuPage;
const extraMenuOptions = ['View Manual', 'Return to Level Select']
let gameManual = [
// done like this since I want it formatted in a very specific way
//                                             | \(text limit, inclusive)
'  The Goal of each level is to place a box on    \
each target. Write instructions in the editor    \
and watch your robot go!                         '
,
' < Scoring >                                     \
                                                 \
Each level is scored in two ways.                \
                                                 \
First, by how many characters you used in your   \
code. Whitespace and comments do not count       \
towards this amount. (Make comments using "/")   \
                                                 \
Second, by how many steps it takes to complete   \
the level.'
,
' < [dir] Words >                                 \
                                                 \
LEFT  - Represents that direction.               \
RIGHT -                                          \
UP    -                                          \
DOWN  -                                          \
                                                 \
FORWARD - The direction the robot is facing.     '
,
' < Movement Instructions >                       \
                                                 \
MOV [dir] - Moves in the direction,              \
            pushing any blocks in the way.       \
                                                 \
PUL [dir] - Similar to MOV, but pulls a block    \
            if there\'s one in the opposite       \
            direction.                           \
                                                 \
FCE [dir] - Makes the robot face that direction. \
                                                 \
ROT [LEFT/RIGHT] - Rotates the robot 90 degrees. '
,
' < Logic Instructions >                          \
                                                 \
CHK [dir] - Sets state to TRUE if there is a     \
            block in that direction,             \
            otherwise FALSE.                     \
                                                 \
CHF [dir] - Sets state to TRUE if the robot is   \
            facing the given direction.          \
            (The robot always faces forward.)    \
                                                 \
SET [TRUE/FALSE] - Sets the state of the robot.  '
,
' < Jump Instructions >                           \
                                                 \
[any]:      - Creates a label.                   \
                                                 \
JMP [label] - Jumps to label.                    \
                                                 \
JMT [label] - Jumps to label if state is TRUE.   \
                                                 \
JMF [label] - Jumps to label if state is FALSE.  '
];

const titleLetters = [
	[
	'▛▀▀▜',
	'▌▗▄▟',
	'▌▝▀▜',
	'▙▄▖▐',
	'▛▀▘▐',
	'▙▄▄▟'
	],
	[
	'▛▀▀▜',
	'▌▗▖▐',
	'▌▐▌▐',
	'▌▐▌▐',
	'▌▝▘▐',
	'▙▄▄▟'
	],
	[
	'▛▜▛▜',
	'▌▐▌▐',
	'▌▝ ▟',
	'▌▗ ▜',
	'▌▐▌▐',
	'▙▟▙▟'
	],
	[
	'▛▀▀▜',
	'▌▗▄▟',
	'▌▐██',
	'▌▐██',
	'▌▝▀▜',
	'▙▄▄▟'
	],
	[
	'▛▀▜█',
	'▌▗▝▜',
	'▌▐▌▐',
	'▌▐▌▐',
	'▌▝▗▟',
	'▙▄▟█'
	],
	[
	'▛▀▀▜',
	'▌▗▄▟',
	'▌▝▀▜',
	'▌▗▄▟',
	'▌▝▀▜',
	'▙▄▄▟'
	],
	
];

const titleCubes = [
	{
		text:[
			'▖▗ ',
			'▘▝ '
		],
		colors:[5, 2 ],
		offsets:[0, 0],
		spacing: 3,
		yStart: 6,
		speed: -160
	},
	{
		text:[
			'▟▛',
			'█▌ '
		],
		colors:[7, 3],
		offsets:[0, 0],
		spacing: 3,
		yStart: 7,
		speed: 80
	},
	{
		text:[
			'▟█▛',
			'██▌ ',
			'██▌ '
		],
		colors:[8, 4, 4],
		offsets:[0, 0, 0],
		spacing: 5,
		yStart: 8,
		speed: 48
	},
	{
		text:[
			'▟████▛',
			'█████▌ ',
			'█████▌ ',
			'█████▌ '
		],
		colors:[9, 5, 5, 5],
		offsets:[0, 0, 0, 0],
		spacing: 8,
		yStart: 10,
		speed: 30
	},
	{
		text:[
			'▟██████▛',
			'▟██████▛ ',
			'███████▌  ',
			'███████▌  ',
			'███████▌  ',
			'███████▌  '
		],
		colors:[10, 10, 6, 6, 6, 6],
		offsets:[1, 0, 0, 0, 0, 0],
		spacing: 12,
		yStart: 12,
		speed: 20
	}

];

let userSave;
/*
	loaded state

	[
		{
			bestTime: 25, 
			bestCharCount: 50,
			solutions: [
				{
					time: 999, (not solved)
					charCount: 50
					code: [
						'START:',
						'JMP START'
					]
				},
				... (one per solution)
			]
		},
		... (one per level)
	]

	string state

	bestTime~bestCharCount~time_charCount_code_code_code~time_charCount_code_...=...| ...
	| seperates level data
	~ seperates bests and each solution
	_ seperates level time, charcount, and each line of code


/*
	instructions

	CHK [dir] - sets state to true if there is a block in that direction, otherwise false
	CHF [dir] - sets state to true if facing given direction(though robot is always facing forward)
	SET [TRUE/FALSE]
	
	JMP [label] - jumps to label
	JMT [label] - jumps to label if state is true
	JMF [label] - jumps to label if state is false

	MOV [dir] - moves in the direction, pushing any blocks in the way.
	PUL [dir] - moves in the direction, pulling a block if there's one in the opposite direction

	FCE [dir] - faces the robot in a specific direction
	ROT [LEFT/RIGHT] - rotates the robot 90 degrees in a direction

	[label]: [any]

	[dirs]
		UP
		DOWN
		LEFT
		RIGHT
		FORWARD
*/


function getName()
{
	return 'Soko Code';
}

function createEmptyData(){
	userSave = {}
	
	keys = Object.keys(ALL_LEVELS)
	for(let i = 0; i < keys.length; i++){
		userSave[keys[i]] = {
			bestTime : 999,
			bestCharCount : 999,
			solutions : []
		}
	}

	saveUserData();
}

function loadUserData(){
	d = loadData()
	if(d.length == 0)
		createEmptyData()
	else
		userSave = JSON.parse(d)	
}

function saveUserData(){
	saveData(JSON.stringify(userSave))
}

function onConnect()
{
	// Reset the server variables when a new user connects:

	loadUserData();

	cursorX = cursorY = 0;
	cursorBlink = 0;
	
	robotX = robotY = 3;
	robotDir = 0;
	robotState = false;
	robotTrapped = false;
	
	compiledCode = [];
	executingLine = -1;
	errorMessage = []
	lastExecutedLine = 0;
	isCompiled = false;
	isRunning = false;
	autoRun = false;
	autoRunDelay = 0;
	levelTime = 0;

	currentScene = 0;
	currentLevel = 0;
	currentVersion = 0;
	testingVersion = 0;
	currentSolution = 0;

	levelCursor = 0;
	levelSolutionCursor = 0;
	levelSelectStage = 0;
	levelDeleteKey = 0;

	extraMenuCursor = 0;
	extraMenuPage = 0;
}

// - - - - Drawing Functions - - - -

function drawBoxTop(color, x, y, width, height){
	fillArea('█', color, x, y, width, height);
}

function drawBoxTopHole(color, x, y, width, height){
	fillArea('▀', color, x + 1, y, 			width - 2, 1);
	fillArea('▄', color, x + 1, y + height - 1, width - 2, 1);
	fillArea('▌', color, x, y + 1, 			1, height - 2);
	fillArea('▐', color, x + width - 1, y + 1, 	1, height - 2);

	drawText('▛', color, x, y);
	drawText('▜', color, x + width - 1, y);
	drawText('▟', color, x + width - 1, y + height - 1);
	drawText('▙', color, x, y + height - 1);
}

function drawBoxBottom(color, x, y, width, height){
	fillArea('█', color, x+1, y+height, width-1, 1);
	fillArea('█', color, x+width, y+1, 1, height);
	drawText('▙', color, x + width, y);
	drawText('▜', color, x, y+height);

	// fillArea('█', color, x+1, y+height, width-1, 1);
	// fillArea('█', color-3, x+width, y+1, 1, height - 2);
	// drawText('▙', color-3, x + width, y);
	// drawText('▙', color, x + width-1, y + height);
	// drawText('▜', color-3, x + width, y+height - 1);
	// drawText('▜', color, x, y+height);
}
// drawBoxBottom(8, 1,1,2,2)
// drawBoxTopHole(16, 1,1,2,2)
// or
// drawBoxTop(16, 1,1,2,2)

function drawRobotTop(color, x, y, dir){
	// for 2x2
	// drawText(dir == 1 || dir == 2 ? '▛' : '█', color, x, y);
	// drawText(dir == 0 || dir == 1 ? '▜' : '█', color-1, x+1, y);
	// drawText(dir == 3 || dir == 0 ? '▟' : '█', color-2, x+1, y+1);
	// drawText(dir == 2 || dir == 3 ? '▙' : '█', color-1, x, y+1);
	switch(dir){
		case 0:
			drawText('█▀▜', color, x, y);
			drawText('█▄▟', color, x, y+1);
			break;
		case 1:
			drawText('▛▀▜', color, x, y);
			drawText('███', color, x, y+1);
			break;
		case 2:
			drawText('▛▀█', color, x, y);
			drawText('▙▄█', color, x, y+1);
			break;
		case 3:
			drawText('███', color, x, y);
			drawText('▙▄▟', color, x, y+1);
			break;
	}
}

function drawHole(x, y, width, height){
	fillArea('█', 5, x+1, y+1, width, height);
	fillArea('█', 2, x+2, y+2, width-1, height-1);
}

function drawLevel(){

	let sx = 19, sy = 2;
	sx +=(9-level[0].length) * 2
	sy += Math.floor((5-level.length) * 1.5)

	drawBox(3, sx-1, sy-1, level[0].length * 4 + 2, level.length * 3 + 2);

	for(let i = 0; i < goals.length; i++){
		drawBox(8, goals[i][0] * 4 + sx + 1, goals[i][1] * 3 + sy + 1, 3, 2);
	}

	for(let i = 0; i < filledHoles.length; i++){
		p = filledHoles[i]
		drawBoxTop(6, p[0]*4 + sx + 1, p[1]*3 + sy + 1, 3, 2); break;
	}

	//draws the bottom components of the level
	for(let y = level.length - 1; y >= 0; y--){
		dy = y*3 + sy;
		for(let x = level[y].length - 1; x >= 0; x--){
			dx = x*4 + sx;
			
			switch(level[y][x]){
				case 1: drawBoxBottom(6, dx, dy, 3, 2, 0); break;
				case 2: drawBoxBottom(3, dx, dy, 3, 2, 0); break;
				case 3: drawBoxBottom(3, dx, dy, 4, 2, 0); break;
				case 4: drawBoxBottom(3, dx, dy, 3, 3, 0); break;
				case 5: // a little inefficient, but it works
					drawBoxBottom(3, dx, dy, 4, 2, 0); 
					drawBoxBottom(3, dx, dy, 3, 3, 0); 
					break;
				case 6: drawBoxBottom(3, dx, dy, 4, 3, 0); break;
				case 7: drawHole(dx, dy, 3, 2); break;
			}
			
		}
	}

	if(robotTrapped)
		drawRobotTop(12, robotX * 4 + sx + 1, robotY * 3 + sy + 1, robotDir);
	else
		drawBoxBottom(8, robotX * 4 + sx, robotY * 3 + sy, 3, 2);
	
	//draws the top components of the level
	for(let y = 0; y < level.length; y++){
		dy = y*3 + sy;
		for(let x = 0; x < level[y].length; x++){
			dx = x*4 + sx;
			
			switch(level[y][x]){
				case 1: drawBoxTop(10, dx, dy, 3, 2); break;
				case 2: drawBoxTop(8, dx, dy, 3, 2); break;
				case 3: drawBoxTop(8, dx, dy, 4, 2); break;
				case 4: drawBoxTop(8, dx, dy, 3, 3); break;
				case 5: 
					drawBoxTop(8, dx, dy, 4, 2); 
					drawBoxTop(8, dx, dy, 3, 3); 
					break;
				case 6: drawBoxTop(8, dx, dy, 4, 3); break;
			}
		}
	}

	if(!robotTrapped)
		drawRobotTop(14, robotX * 4 + sx, robotY * 3 + sy, robotDir);

	let count = ALL_LEVELS[currentLevel].versions.length
	if(count > 1){
		let t = ' ' + (currentVersion + 1) + '/' + count + ' ';
		let x = sx + level[0].length * 4 - t.length;
		let y = sy + level.length * 3;
		drawText(t, 3, x, y)
	}
}

function drawMainBoxes(){
	// Text Editing Box
	drawBox(10, 0, 0, 17, 20);
	// fillArea('═', 10, 0, 18, 56, 1)
	// drawText('╩', 10, 0, 18)
	// drawText('╩', 10, 16, 18)
	fillArea('═', 10, 17, 18, 56, 1);
	drawText('╣', 10, 0, 18);
	drawText('╠', 10, 16, 18);
}

function drawTitleScreen(){
	tick += 1.5

	for(let r = 0; r < titleCubes.length; r++){
		cRow = titleCubes[r];
		for(let x = (Math.floor(tick / cRow.speed + 28) % cRow.spacing) - cRow.spacing; x < 56; x += cRow.spacing){
			for(let i = 0; i < cRow.text.length; i++){
				drawText(cRow.text[i], cRow.colors[i], x + cRow.offsets[i], i + cRow.yStart)
			}
		}
	}
	title = [0,1,2,1,3,1,4,5]

	for(let i = 0; i < title.length; i++){
		l = title[i]
		for(let j = 0; j < titleLetters[l].length; j++){
			drawText(titleLetters[l][j], Math.min(5 + j + i * 0.7, 12), i * 4, j);
		}
	}
	for(let y = 0; y < 6; y++){
		let c = y == 6 ? '▀' : '█'
		let yy = y - 5.5
		yy *= yy * 2
		for(let x = 32; x < 56; x++){
			let xx = x - 45
			let color = Math.min(22 - Math.sqrt(xx * xx + yy) * 0.75, 17)
			drawText(c, color, x, y);
		}
	}
	drawTextWrapped('█ █', 4, 50, 4, 1)
	drawTextWrapped('██ ██', 0, 51, 4, 2)

	drawText('█', 4, 54, 5)
	drawText('██', 0, 55, 5)

	drawText('█', 4, 35, 5)
	drawText('██', 0, 33, 5)

	drawText('By Werxzy', 8, 46,19)
	drawText('Press Any Key To Continue', 17, 1,19)
}

function drawLevelInfo(){
	levelName = Object.keys(ALL_LEVELS)[levelCursor]
	nameX = Math.floor(36.5 - levelName.length / 2)
	drawText(levelName, 13, nameX, 1)
	drawBox(6, nameX-1, 0, levelName.length+2, 3)
	
	drawTextWrapped(ALL_LEVELS[levelName].description,11,20,3, 33)

	drawBox(6, 19, 2, 35, 8)
	// drawBox(6, 19, 7, 35, 3)
	drawBox(6, 19, 9, 35, 3)
	drawBox(6, 19, 11, 35, 7)

	// NOTE, I'm using a weird method of drawing text vertically that may break in a future bbs version.

	drawTextWrapped('║ ║ ╠ ║ ╠', 6, 19, 7, 1);
	drawTextWrapped('╣ ║ ╣ ║ ╣', 6, 53, 7, 1);
	drawText('╩', 6, nameX-1, 2)
	drawText('╩', 6, nameX+levelName.length, 2)
	
	drawTextWrapped('╔ ║ ╬ ║ ╬ ║ ║ ║ ║ ║ ╩', 6, 43, 7, 1);
	drawTextWrapped('╦ ║ ╬ ║ ╬ ║ ║ ║ ║ ║ ╩', 6, 48, 7, 1);
	drawText('════╦════', 6, 44, 7)


	drawText('Best Scores', 13, 20, 10)
	drawText('Time', 13, 44, 8)
	drawText('Char', 13, 49, 8)

	color = userSave[levelName].bestTime == 999 ? 6 : 13
	t = String(userSave[levelName].bestTime)
	drawText(t, color, 48 - t.length, 10)
	t = String(userSave[levelName].bestCharCount)
	drawText(t, color, 53 - t.length, 10)

	sol = userSave[levelName].solutions
	for(let i = 0; i < sol.length; i++){
		// TODO? add solution naming?
		drawText('Solution ' + (i+1), (levelSelectStage == 1 && levelSolutionCursor == i) ? 17 : 13, 20, 12 + i)
		color = sol[i].time == 999 ? 6 : 13
		t = String(sol[i].time)
		drawText(t, color, 48 - t.length, 12 + i)
		t = String(sol[i].charCount)
		drawText(t, color, 53 - t.length, 12 + i)
	}

	if(sol.length < 5)
		drawText('+ New Solution + ', (levelSelectStage == 1 && levelSolutionCursor == sol.length) ? 17 : 13, 20, 12 + sol.length)
	
	if(levelSelectStage == 1){
		drawText('>', 17, 19, 12 + levelSolutionCursor)
		if(levelDeleteKey > 0){
			userSave[currentLevel].solutions
			for(let i = 0; i < 23; i += (3 - levelDeleteKey)){
				drawText('⚉', 4, 20 + i, 12 + levelSolutionCursor)
			}
		}
	}
}

function drawLevelSelection(){
	drawMainBoxes()
	names = Object.keys(ALL_LEVELS);
	for(let i = 0; i < names.length; i++){
		drawText(names[i], levelCursor == i ? 17 : 8, 1,i+1)
	}
	if(levelSelectStage == 0)
		drawText('>', 17, 0, levelCursor + 1)
		
	drawLevelInfo();
		
	drawText("(Enter) Select              (ESC) Back", 10, 17, 19)
	if(levelSelectStage == 1 && levelSolutionCursor < userSave[currentLevel].solutions.length)
		drawText('(DDD) Delete', 10, 32, 19)
}


function drawLevelScreen(){
	if(isRunning && autoRun && currentScene == 2){
		if(autoRunDelay++ >= 15){
			codeStep()
			autoRunDelay = 0
		}
	}

	drawLevel();

	drawMainBoxes();

	for(let i = 0; i < codeText.length; i++){
		drawText(codeText[i], 10, 1, i + 1);
	} 

	if(errorMessage.length > 0){
		y = Math.min(16, errorMessage[0])
		drawBox(10, 16, y, errorMessage[1].length + 3, 3)
		drawText(errorMessage[1], 17, 18, y + 1)
		if(errorMessage[0] == 0){
			drawTextWrapped('═ < ╔', 10, 16, 0, 1)
		}
		else if(errorMessage[0] < 17){
			drawTextWrapped('╚ < ╔', 10, 16, y, 1)
		}
		else{
			drawTextWrapped('╚ = <', 10, 16, 16, 1)
		}
		if(y == 16){
			drawText('╩', 10, 18 + errorMessage[1].length, 18)
			
		}
	}

	if(isRunning){
		drawText('>', 17, 0, lastExecutedLine + 1);
	}
	else{
		cursorBlink += 1;
		cursorBlink %= 30;
		if(cursorBlink < 15 && currentScene == 2){
			drawText('█', 10, cursorX + 1, cursorY + 1);
		}
	}
	
	if(currentScene == 2){
		if(isRunning){
			drawText('(1) Run (2) Step (3) Stop  ', 10, 17, 19);

			statusText = 'Time:     State:' + (robotTrapped ? 'STUCK' : robotState ? ' TRUE' : 'FALSE');
			
			f = ['RIGHT','   UP',' LEFT',' DOWN'][robotDir];
			statusText += '  Facing:' + f;
			
			drawText(statusText, 10, 18, 0);

			drawText('000', 3, 23, 0);
			t = levelTime.toString();
			drawText(t, 10, 26 - t.length, 0);
		}
		else{
			if(ALL_LEVELS[currentLevel].versions.length > 1)
				drawText('(1) Run (2) Step (3) Cycle  (ESC) Menu', 10, 17, 19);
			else
				drawText('(1) Run (2) Step            (ESC) Menu', 10, 17, 19);
		}		
	}
	
}

function drawLevelExtraMenu(){
	fillArea(' ', 0, 3, 3, 50, 14)
	drawBox(10, 2, 2, 52, 16)

	if(extraMenuPage == 0){
		for(let i = 0; i < extraMenuOptions.length; i++){
			drawText(extraMenuOptions[i], extraMenuCursor == i ? 17 : 10, 4, 4 + i * 2)
		}
		drawText('>', 17, 3, 4 + extraMenuCursor * 2)
	}
	else if(extraMenuPage == 1){
		drawTextWrapped(gameManual[extraMenuCursor], 10, 4, 4, 48)
		drawText('(Arrow Keys) Turn Page', 10, 17,19)
		p = ' ' + (extraMenuCursor + 1) + '/' + (gameManual.length) + ' '
		drawText(p, 10, 52-p.length, 17)
	}
	
	drawText('(ESC) Back', 10, 45, 19)
}

function drawWinScreen(){
	sx = 25
	sy = 5

	fillArea(' ', 0, sx+10, sy+3, 9, 5)
	drawBox(10, sx+9, sy, 11, 3)
	drawBox(10, sx, sy+2, 20, 7)
	drawBox(10, sx, sy+4, 20, 3)

	drawTextWrapped('╠ ║ ╠', 10, sx, sy+4, 1)
	drawTextWrapped('╬ ║ ╬ ║ ╬ ║ ╩', 10, sx+9, sy+2, 1)
	drawTextWrapped('╦ ║ ╬ ║ ╬ ║ ╬ ║ ╩', 10, sx+14, sy, 1)
	drawTextWrapped('╣ ║ ╣ ║ ╣ ║ ╝', 10, sx+19, sy+2, 1)

	drawText('Time║Char', 10, 10+sx, 1+sy)
	drawText('Old Best', 10, 1+sx, 3+sy)
	drawText('New Best', 10, 1+sx, 5+sy)
	drawText('Score   ', 10, 1+sx, 7+sy)

	for(let i = 0; i < 6; i++){
		color = levelScore[i] == '999' ? 6 : 10
		drawText(levelScore[i], color, 14+sx - levelScore[i].length + (5 * (i%2)), 3+sy + Math.floor(i/2) * 2)
	}

	drawText('(ESC) Exit', 10, 45, 19)
}

// - - - - Puzzle Functions - - - -

function getDir(dir){
	if(dir == 4)
		return getDir(robotDir)
	return [[1,0],[0,-1],[-1,0],[0,1]][dir]
}

function rotateRobot(right){
	robotDir += (right ? 3 : 1)
	robotDir %= 4
}

function opposite(dir){
	return(dir + 2) % 4
}

function insideLevel(x, y){
	return x >= 0 && y >= 0 && x < level[0].length && y < level.length;
}

function move(dir){
	d = getDir(dir);

	sx = robotX + d[0];
	sy = robotY + d[1];
	let moveCount = 1;
	let valid = true;

	
	while((valid = (insideLevel(sx, sy) && !solids[level[sy][sx]])) && !emptyish[level[sy][sx]]){
		sx += d[0];
		sy += d[1];
		moveCount += 1;
	}

	//successful movement
	if(valid){
		robotX += d[0];
		robotY += d[1];
		robotTrapped = level[robotY][robotX] == 7 // if robot got trapped in a hole

		sx = robotX;
		sy = robotY;
		prev = 0
		for(let i = 1; i < moveCount; i++){
			c = level[sy][sx]
			level[sy][sx] = prev
			prev = c

			sx += d[0];
			sy += d[1];
		}

		c = level[sy][sx]
		if(c == 7 && prev == 1){ // if there was a box and now a hole, fill it
			filledHoles.push([sx, sy])
			level[sy][sx] = 0
		}
		else
			level[sy][sx] = prev
	}

	

	return valid
}

function pull(dir){
	if(move(dir)){
		d = getDir(dir);
		sx = robotX - d[0] * 2;
		sy = robotY - d[1] * 2;

		if(insideLevel(sx, sy) && level[sy][sx] == 1){
			level[sy][sx] = 0
			level[sy + d[1]][sx + d[0]] = 1
		}
	}
}

function testRobotMove(key){
	switch(String.fromCharCode(key)){
		case 'q': rotateRobot(false); break;
		case 'w': pull(1); break;
		case 'e': rotateRobot(true); break;
		case 'a': pull(2); break;
		case 's': pull(3); break;
		case 'd': pull(0); break;
	}
}

function loadLevel(levelName, version, solutionNumber){
	level = []
	goals = []
	filledHoles = []

	let loading = ALL_LEVELS[levelName].versions[version]

	for(let i = 0; i < loading.grid.length; i++)
		level[i] = loading.grid[i].slice()

	for(let i = 0; i < loading.goals.length; i++)
		goals[i] = loading.goals[i].slice()

	robotX = loading.startPos[0]
	robotY = loading.startPos[1]
	robotDir = loading.startDir
	robotState = false
	robotTrapped = false
	executingLine = 0

	if(solutionNumber == -1){
		currentSolution = userSave[levelName].solutions.length
		codeText = []
		for(let i = 0; i < ALL_LEVELS[levelName].startCode.length; i++)
			codeText[i] = ALL_LEVELS[levelName].startCode[i].slice()
		
		userSave[levelName].solutions.push({
			time : 999,
			charCount : 999,
			code : codeText
		})
	}
	else if(solutionNumber >= 0){
		codeText = userSave[levelName].solutions[solutionNumber].code
	}
}

// - - - - ~Programming~ functions - - - -




const keywords ={
	'CHK': [0, 'dir'],
	'CHF': [1, 'dir'],
	'SET': [2, 'bool'],
	'JMP': [3, 'label'],
	'JMT': [4, 'label'],
	'JMF': [5, 'dir'],
	'MOV': [6, 'dir'],
	'PUL': [7, 'dir'],
	'FCE': [8, 'dir'],
	'ROT': [9, 'r/l']
}
// WARNING these may change in order

const dirwords = {
	'RIGHT': 0,
	'UP': 1,
	'LEFT': 2,
	'DOWN': 3,
	'FORWARD': 4
}

function compile(){
	// get labels
	var labels = {}
	for(let i = 0; i < codeText.length; i++){
		possible = codeText[i].trim().split('/');
		if(possible[0].length == 0){
			continue;
		}
		possible = possible[0].toUpperCase().split(':');

		for(let j = 0; j < possible.length - 1; j++){
			L = possible[j].trim()
			
			if(L.indexOf(' ') > -1){
				// ERROR, no extra spaces allowed
				errorMessage = [i, 'Spaces in labesls not allowed.'];
				return false
			}
			if(L in keywords || L in dirwords){
				// probably excessive, but it helps with writing clearer code
				errorMessage = [i, 'Can\'t use reserved word as label.'];
				return false
			}
			if(L in labels){
				// ERROR, duplicate label
				errorMessage = [i, 'Duplicate label.'];
				return false
			}
			labels[L] = i
		}
	}

	compiledCode = []

	for(let i = 0; i < codeText.length; i++){
		possible = codeText[i].trim().split('/');
		if(possible[0].length == 0){
			compiledCode.push([])
			continue;
		}
		possible = codeText[i].toUpperCase().split(':');
		code = possible[possible.length - 1].trim();

		if(code.length == 0){
			compiledCode.push([])
			continue; // nothing on this line
		}

		words = code.split(' ').filter(Boolean)
		
		if(words.length > 2){
			// ERROR, too many words
			// also probably a bit excessive
			errorMessage = [i, 'Too many words, limit 2 per line.']
			return false
		}

		if(words[0] in keywords){
			if(keywords[words[0]][1] == 'dir'){
				if(words[1] in dirwords){
					compiledCode.push([ keywords[words[0]][0], dirwords[words[1]], i])
				}
				else{
					// ERROR, invalid direction
					errorMessage = [i, 'Invalid direction.']
					return false
				}
			}
			else if(keywords[words[0]][1] == 'label'){
				if(words[1] in labels){
					compiledCode.push([ keywords[words[0]][0], labels[words[1]], i])
				}
				else{
					// ERROR, invalid label
					errorMessage = [i, 'Missing label.']
					return false
				}
			}

			else if(keywords[words[0]][1] == 'bool'){
				if(words[1] == 'TRUE' || words[1] == 'FALSE'){
					compiledCode.push([ keywords[words[0]][0], words[1] == 'TRUE', i])
				}
				else{
					// ERROR, invalid direction
					errorMessage = [i, 'Invalid state, use TRUE/FALSE.']
					return false
				}
			}

			else if(keywords[words[0]][1] == 'r/l'){
				if(words[1] == 'RIGHT' || words[1] == 'LEFT'){
					compiledCode.push([ keywords[words[0]][0], words[1] == 'RIGHT', i])
				}
				else{
					// ERROR, invalid direction
					errorMessage = [i, 'Invalid direction, use LEFT/RIGHT.']
					return false
				}
			}
		}
		else{
			// ERROR, nonexistant command
			errorMessage = [i, 'Invalid instruction.']
			return false
		}
	}
	
	// successfully compiled
	return true
}


function codeStep(){
	if(!isCompiled) return;
	if(checkIfSolved()) return;
	if(robotTrapped) return
	while(executingLine < compiledCode.length && compiledCode[executingLine].length == 0)
		executingLine++;
	
	if(executingLine >= compiledCode.length) return; // Reached end of code
	
	levelTime++;
	lastExecutedLine = executingLine;

	switch(compiledCode[executingLine][0]){
		case 0: // CHK
			d = getDir(compiledCode[executingLine++][1]);
			sx = d[0] + robotX;
			sy = d[1] + robotY;

			robotState = insideLevel(sx, sy) && level[sy][sx] == 1;
			break;

		case 1: // CHF
			d = compiledCode[executingLine++][1];
			robotState = robotFacing == d || d == 5;
			break;

		case 2: // SET
			robotState = compiledCode[executingLine++][1];
			break;

		case 3: // JMP
			executingLine = compiledCode[executingLine][1];
			break;

		case 4: // JMT
			if (robotState)
				executingLine = compiledCode[executingLine][1];
			else
				executingLine++;
			break;

		case 5: // JMF
			if (!robotState)
				executingLine = compiledCode[executingLine][1];
			else
				executingLine++;
			break;

		case 6: // MOV
			move(compiledCode[executingLine++][1]);
			break;

		case 7: // PUL
			pull(compiledCode[executingLine++][1]);
			break;

		case 8: // FCE
			d = compiledCode[executingLine++][1]
			if (d >= 0 && d < 4)
				robotDir = d;
			break;

		case 9: // ROT
			rotateRobot(compiledCode[executingLine++][1]);
			break;
	}

	
}

function checkIfSolved(){
	for(let i = 0; i < goals.length; i++){
		if(level[goals[i][1]][goals[i][0]] != 1)
			return false; // NOT solved
	}

	let v = (currentVersion + 1) % ALL_LEVELS[currentLevel].versions.length;

	if(v == testingVersion){
		//solved all variations of the puzzle

		let c = getCodeCharCount();
		let prevTime = userSave[currentLevel].bestTime;
		let prevChar = userSave[currentLevel].bestCharCount;
		userSave[currentLevel].bestTime = Math.min(prevTime, levelTime);
		userSave[currentLevel].bestCharCount = Math.min(prevChar, c);
		userSave[currentLevel].solutions[currentSolution].time = levelTime;
		userSave[currentLevel].solutions[currentSolution].charCount = c;

		levelScore = [
			String(prevTime),
			String(prevChar),
			String(userSave[currentLevel].bestTime),
			String(userSave[currentLevel].bestCharCount),
			String(levelTime),
			String(c),
			prevTime > userSave[currentLevel].bestTime,
			prevChar > userSave[currentLevel].bestCharCount
		];
	
		saveUserData();

		isRunning = false;
		executingLine = -1;
		autoRun = false;
		currentScene = 4;
	}
	else{
		currentVersion = v;
		loadLevel(currentLevel, currentVersion, -2);
	}

	return true;
}

function getCodeCharCount(){
	count = 0
	for(let i = 0; i < codeText.length; i++){
		count += codeText[i].split('/')[0].replace(' ', '').length;
	}
	return count;
}


// - - - - - - - - - - - - - - - -

function onUpdate(){
	// It is safe to completely redraw the screen during every update:
	clearScreen();

	switch(currentScene){
		case 0: drawTitleScreen(); break;
		case 1: drawLevelSelection(); break;
		case 2: drawLevelScreen(); break;
		case 3: 
			drawLevelScreen(); 
			drawLevelExtraMenu();
			break;
		case 4: 
			drawLevelScreen(); 
			drawWinScreen();
			break;
	}
}

function clamp(a, b, c){ // Math.clamp doesn't exist for some reason?
	return Math.min(Math.max(a,b),c);
}

function moveCursor(x, y){
	if(y < 0 && cursorY == 0){
		cursorX = 0;
	}
	else if(y > 0 && cursorY + 1 == codeText.length){
		cursorX = codeText[cursorY].length;
	}
	else{
		cursorY = clamp(cursorY + y, 0, codeText.length - 1);
		cursorX = clamp(cursorX + x, 0, codeText[cursorY].length);
	}
	cursorBlink = 0
}

function editCode(key){
	let change = false;
	errorMessage = []; // clear error message

	// Backspace
	if(key == 8){
		if(cursorX == 0){ // if on first character
			if(cursorY > 0){ // if not on last row
				if(codeText[cursorY].length + codeText[cursorY - 1].length < codeWidthLimit){ // if joining the rows would not exceed the limit
					//join the two lines
					cursorX = codeText[cursorY - 1].length;
					codeText[cursorY - 1] = codeText[cursorY - 1] + codeText[cursorY];
					codeText.splice(cursorY, 1);
					cursorY -= 1;
					cursorBlink = 0
				}
				else{
					// if would be too wide, instead 
					codeText[cursorY - 1] = codeText[cursorY - 1].slice(0, codeText[cursorY - 1].length - 1);
				}
				change = true;
			}
		}
		else{
			codeText[cursorY] 
					= codeText[cursorY].slice(0, cursorX - 1)
					+ codeText[cursorY].slice(cursorX);
			cursorX -= 1
			cursorBlink = 0
			change = true;
		}
	}
	// Enter key
	else if(key == 10 && codeText.length < codeHeightLimit){
		codeText.splice(cursorY, 0, codeText[cursorY].slice(0,cursorX));
		codeText[cursorY + 1] = codeText[cursorY + 1].slice(cursorX);
		cursorY += 1;
		cursorX = 0;
		cursorBlink = 0
		change = true;
	}
	// Most normal keys
	else if(key >= 32 && key < 127 && codeText[cursorY].length < codeWidthLimit){
		c = String.fromCharCode(key)

		// shouldn't allow characters used for parsing save data
		if('|~_'.indexOf(c) > -1) 
			return

		codeText[cursorY] = codeText[cursorY].slice(0, cursorX) + c.toUpperCase() + codeText[cursorY].slice(cursorX);
		cursorX += 1;
		change = true;
		cursorBlink = 0
	}

	switch(key){
	case 17: // up arrow
		moveCursor(0, -1);
		break;
	case 18: // down arrow
		moveCursor(0, 1);
		break;
	case 19: // left arrow
		moveCursor(-1, 0);
		break;
	case 20: // right arrow
		moveCursor(1, 0);
		break;
	case 27: // escape
		currentScene = 3;
		break;
	}


	if(change){ // just in case we don't want it to get too overloaded?
		saveUserData()
	}
}

function startRun(){
	if(!isRunning){
		isRunning = isCompiled = compile();
		executingLine = 0
		levelTime = 0
		testingVersion = currentVersion
	}
}

function levelInput(key){
	if(key >= 48 && key < 58){ // keys 0 to 9
		switch(key - 48){
			case 1: // run
				startRun()
				if(isCompiled){
					autoRun = true
					autoRunDelay = 0
				}
				break;

			case 2: // step
				startRun()
				if(isCompiled){
					autoRun = false
					autoRunDelay = 0
					codeStep()
				}
				break;
				
			case 3: // stop
				if(isRunning){
					isRunning = false
					executingLine = -1
					autoRun = false
					currentVersion = 0
					loadLevel(currentLevel, currentVersion, -2) 
				}
				else{
					currentVersion += 1
					currentVersion %= ALL_LEVELS[currentLevel].versions.length
					loadLevel(currentLevel, currentVersion, -2) 
				}
				break;
		}
	}
	else if(!isRunning){
		editCode(key);
	}
}

function levelSelectInput(key){
	if(levelSelectStage == 0){ // selecting a level
		switch(key){
			case 17: // up arrow
				levelCursor = Math.max(0, levelCursor - 1);
				break;
			case 18: // down arrow
				levelCursor = Math.min(Object.keys(ALL_LEVELS).length - 1, levelCursor + 1);
				break;
			case 10: // enter key
				currentLevel = Object.keys(ALL_LEVELS)[levelCursor];
				levelSelectStage = 1;
				levelSolutionCursor = 0;
				break;
			case 27: // escape
				currentScene = 0;
				break;
		}
		levelDeleteKey = 0
	}
	else if(levelSelectStage == 1){ // selecting a solution
		if(key == 100 || key == 68){
			if(levelSolutionCursor < userSave[currentLevel].solutions.length 
					&& ++levelDeleteKey >= 3){
				levelDeleteKey = 0
				userSave[currentLevel].solutions.splice(levelSolutionCursor, 1)
				saveUserData()
			}
		}
		else{
			levelDeleteKey = 0
		}
		switch(key){
			case 17: // up arrow
				levelSolutionCursor = Math.max(0, levelSolutionCursor - 1);
				break;
			case 18: // down arrow
				levelSolutionCursor = Math.min(userSave[currentLevel].solutions.length, levelSolutionCursor + 1);
				levelSolutionCursor = Math.min(levelSolutionCursor, 4);
				// this limits to 5 solutions, and accounts for the +new solution+ option.
				break;
			case 10: // enter key
				testingVersion = currentVersion = 0;
				if(levelSolutionCursor == userSave[currentLevel].solutions.length)
					currentSolution = -1;
				else
					currentSolution = levelSolutionCursor;
				loadLevel(currentLevel, 0, currentSolution);
				currentScene = 2;
				cursorX = cursorY = 0;
				break;
			case 27: // escape
				levelSelectStage = 0;
				break;
		}
	}
}

function extraMenuInput(key){
	if(extraMenuPage == 0){
		switch(key){
			case 17: // up arrow
				extraMenuCursor = Math.max(0, extraMenuCursor - 1);
				break;
			case 18: // down arrow
				extraMenuCursor = Math.min(extraMenuOptions.length - 1, extraMenuCursor + 1);
				break;
			case 10: // enter key
				if (extraMenuCursor == 0){
					extraMenuPage = 1;
					extraMenuCursor = 0;
				}
				else if (extraMenuCursor == 1){
					saveUserData()
					currentScene = 1
				}
				break;
			case 27: // escape
				currentScene = 2;
				break;
		}
	}
	else if(extraMenuPage == 1){
		switch(key){
			case 19: // left arrow
				extraMenuCursor = Math.max(0, extraMenuCursor - 1);
				break;
			case 20: // right arrow
				extraMenuCursor = Math.min(gameManual.length - 1, extraMenuCursor + 1);
				break;
			case 27: // escape
				extraMenuPage = 0;
				extraMenuCursor = 0;
				break;
		}
	}
}

function winScreenInput(key){
	if(extraMenuPage == 0){
		switch(key){
			case 27: // escape
				currentScene = 1;
				break;
		}
	}
}

function onInput(key){
	switch(currentScene){
		case 0: currentScene = 1; break;
		case 1: levelSelectInput(key); break;
		case 2: levelInput(key); break;
		case 3: extraMenuInput(key); break;
		case 4: winScreenInput(key); break;
	}
	
}

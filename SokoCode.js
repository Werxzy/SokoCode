let tick = 0;

let gameVersion = '1.0'

let cursorX, cursorY;
let codeText;
let codeWidthLimit = 15;
let codeHeightLimit = 18;
let cursorBlink;

let robotX, robotY, robotDir, robotState, robotTrapped, robotHalted;

let level = [];
let filledHoles = []; // just for looks, shouldn't cause any puzzle interaction
let goals = [];
// max level size is 9 by 5 

//[key, isLevel, win requirements]
const LEVEL_ORDER = [
	['Greetings!', false, 0],

	// somewhat sorted by guessed difficulty

	['Intro To Boxes', true, 0],	// 0
	['That One Box', true, 1],		// 1
	['Out Of Place', true, 1],		// 1
	['North?', true, 2],			// 2
	['James\'s Fault', true, 3],	// 2
	['Perilous Push', true, 4],		// 3
	['Cornered', true, 5],			// 3?
	
	['[TITLE]', false, 6],
	
	['Perfect Packing', true, 6],	// 3
	['Mind The Gap', true, 7],		// 3
	['Double Click', true, 8],		// 3
	['#403 and #405', true, 9],	    // 3/4 ? will need to test
	['One Sided', true, 10],		// 3
	['Walled Off', true, 11],		// 4
	['Second Row', true, 12],		// 5
	['Clear Paperwork', true, 13],	// 5

	['Goodbye...', false, 14],
]

// oops all spaces
const MESSAGES = {
	//originally was going to go with BOXTOPIA, but it already exists
	'Greetings!' : ' Welcome to the team! We\'re glad you too saw potential for the box to be the end-all be-all product of the future, and begin your internship with us here at BOXTOPIC.™ Where the future is "Thinking inside the box"! And just as a reminder, the role you have signed up for is an UNPAID internship.                                                          If you have any questions, please contact the lead box technician, James.',
	'[TITLE]' : ' We at [COMPANY-NAME] believe that [PRODUCT1] are the biggest game-changer since [PRODUCT2]! The future of [TARGET-AUDIENCE] is in your hands. We can\'t let Big [PRODUCT1] get one on us. Keep working hard to ensure [MOTIVE]. And remember, [TAGLINE].                                                                                                                                                                Automated message usingERROR CODE 0x301D8A PLEASE NOTIFY SERVER ADMINISTRATOR' ,
	'Goodbye...' : ' Sorry, but we\'re having to let go all staff due to low profits. It turns out boxes were not the next big trend we predicted them to be. You may finish any work you have left.                                                       We wish you well in your next line of work.                                                        sincerely,                        [SENDER-NAME] '
}

const ALL_LEVELS = {
/* Template for easy copy/pasting
	'Intro To Boxes' : {
		description : ' This is a test level',
		versions : [
			{
				grid : [
					[0,1,0,1,0,1,0],
				],
				goals : [
					[0,0], 
				],
				startPos : [2,0],
				startDir : 0
			},
		],
		startCode : [
			''
		]
	},
*/
	// probably first level, introducing mov and pul
	'Intro To Boxes' : {
		description : ' We\'ve set up some boxes in the hallway so that you can learn how to program the robot. Have it move the boxes on the targets.',
		versions : [ // there can be multiple versions of the level that the player would need to account for
			{
				grid : [ // the grid of boxes or walls
					[0,1,0,1,0,1,0],
				],
				goals : [ // position of the goals in the level
					[0,0], 
					[3,0],
					[6,0]
				],
				startPos : [2,0], // starting position of the robot
				startDir : 0 // starting rotation of the robot
			},
		],
		startCode : [
			'MOV LEFT',
			'MOV RIGHT',
			'',
			'/LOOK AT MANUAL',
			'/IN MENU FOR',
			'/MORE INFO.',
		]
	},

	//the player learns that their solution needs to fit multiple versions.
	'That One Box' : {
		description : ' Please nudge the box over by one space. Just keep in mind that the robot can start in different locations. Cycle between versions using (3).',
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
				startDir : 0,
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
				startPos : [0,2],
				startDir : 0,
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
				startDir : 0,
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
				startPos : [2,0],
				startDir : 0,
			},
		],
		startCode : [
			''
		]
	},
	'In A Row' : {
		description : ' The first box is already in its place. The other boxes need to be the same distance away.',
		versions : [
			{
				grid : [
					[0,4,0,4,0,4,0],
					[0,4,0,4,0,4,0],
					[1,4,0,4,0,4,0],
					[0,2,1,2,1,2,1],
					[0,0,0,0,0,0,0],
				],
				goals : [
					[0,2], 
					[2,2], 
					[4,2], 
					[6,2]
				],
				startPos : [0,4],
				startDir : 0
			},
			{
				grid : [
					[0,4,0,4,0,4,0],
					[1,4,0,4,0,4,0],
					[0,4,0,4,0,4,0],
					[0,2,1,2,1,2,1],
					[0,0,0,0,0,0,0],
				],
				goals : [
					[0,1], 
					[2,1], 
					[4,1], 
					[6,1]
				],
				startPos : [0,4],
				startDir : 0
			},
			{
				grid : [
					[1,4,0,4,0,4,0],
					[0,4,0,4,0,4,0],
					[0,4,0,4,0,4,0],
					[0,2,1,2,1,2,1],
					[0,0,0,0,0,0,0],
				],
				goals : [
					[0,0], 
					[2,0], 
					[4,0], 
					[6,0]
				],
				startPos : [0,4],
				startDir : 0
			},
		],
		startCode : [
			''
		]
	},
	'James\'s Fault' : {
		description : ' None of the boxes were place in the right spot.                                                      If James asks where his keys went, tell him they\'re          in warehouse 404.',
		versions : [
			{
				grid : [
					[1,0,0,1,0],
					[1,0,0,0,1],
					[1,0,0,1,0],
					[0,1,0,1,0],
				],
				goals : [
					[1,0], 
					[1,1], 
					[1,2], 
					[0,3], 
					[4,0],
					[3,1],
					[4,2],
					[4,3]
				],
				startPos : [2,0],
				startDir : 2
			},
			{
				grid : [
					[0,1,0,1,0],
					[0,1,0,1,0],
					[0,1,0,1,0],
					[0,1,0,1,0],
				],
				goals : [
					[0,0], 
					[0,1], 
					[0,2], 
					[0,3], 
					[4,0],
					[4,1],
					[4,2],
					[4,3]
				],
				startPos : [2,0],
				startDir : 2
			},
			{
				grid : [
					[0,1,0,0,1],
					[1,0,0,1,0],
					[0,1,0,1,0],
					[1,0,0,0,1],
				],
				goals : [
					[0,0], 
					[1,1], 
					[0,2], 
					[1,3], 
					[3,0],
					[4,1],
					[4,2],
					[3,3]
				],
				startPos : [2,0],
				startDir : 2
			},
		],
		startCode : [
			''
		]
	},
	'Clear Paperwork' : {
		description : ' Unfortunately, we don\'t know where the boxes need to be placed this time, but we\'re sure you\'ll figure it out and get it done in no time!',
		versions : [
			{
				grid : [
					[0,0,0,0,0],
					[1,1,1,1,1],
					[0,0,0,0,0],
				],
				goals : [
					[0,1], 
					[1,0], 
					[2,0], 
					[3,0], 
					[4,1], 
				],
				startPos : [0,2],
				startDir : 1
			},
			{
				grid : [
					[0,0,0,0,0],
					[1,1,1,1,1],
					[0,0,0,0,0],
				],
				goals : [
					[0,0], 
					[1,1], 
					[2,1], 
					[3,0], 
					[4,1], 
				],
				startPos : [0,2],
				startDir : 1
			},
			{
				grid : [
					[0,0,0,0,0],
					[1,1,1,1,1],
					[0,0,0,0,0],
				],
				goals : [
					[0,0], 
					[1,1], 
					[2,0], 
					[3,1], 
					[4,0], 
				],
				startPos : [0,2],
				startDir : 1
			},
			{
				grid : [
					[0,0,0,0,0],
					[1,1,1,1,1],
					[0,0,0,0,0],
				],
				goals : [
					[0,0], 
					[1,0], 
					[2,1], 
					[3,1], 
					[4,1], 
				],
				startPos : [0,2],
				startDir : 1
			},
		],
		startCode : [
			''
		]
	},
	'Perilous Push' : {
		description : ' Corners were cut when we ordered this warehouse to be built.  Please don\'t break our robot or get it stuck, we\'re already behind schedule.',
		versions : [
			{
				grid : [
					[6,4,0,7,0,6,4],
					[3,2,1,7,1,3,2],
					[7,7,0,0,0,1,0],
					[0,1,0,7,0,1,0],
					[7,7,0,0,0,7,7],
				],
				goals : [
					[0,3], 
					[2,0], 
					[4,0], 
					[6,2], 
					[6,3], 
				],
				startPos : [2,4],
				startDir : 1
			},
			{
				grid : [
					[6,4,0,0,7,6,4],
					[3,2,1,1,7,3,2],
					[7,7,0,0,0,1,0],
					[7,7,0,7,0,7,7],
					[0,1,0,0,0,1,0],
				],
				goals : [
					[0,4], 
					[2,0], 
					[3,0], 
					[6,2], 
					[6,4],
				],
				startPos : [2,4],
				startDir : 1
			},
			{
				grid : [
					[6,4,0,0,0,6,4],
					[3,2,1,1,1,3,2],
					[0,1,0,0,0,1,0],
					[0,1,0,7,0,1,0],
					[0,1,0,0,0,1,0],
				],
				goals : [
					[0,2], 
					[0,3], 
					[0,4], 
					[2,0], 
					[3,0], 
					[4,0], 
					[6,2], 
					[6,3], 
					[6,4], 
				],
				startPos : [2,4],
				startDir : 1
			},
		],
		startCode : [
			''
		]
	},
	'Mind The Gap' : {
		description : ' We currently have an excess of boxes, so it\'s fine to use them however you want to get the job done.',
		versions : [
			{
				grid : [
					[0,1,0,3,2],
					[0,0,7,1,0],
					[0,0,0,3,2],
				],
				goals : [
					[4,1], 
				],
				startPos : [0,1],
				startDir : 0
			},
			{
				grid : [
					[0,0,0,1,0,3,2],
					[0,0,7,0,7,0,0],
					[0,1,1,0,0,3,2],
				],
				goals : [
					[6,1], 
				],
				startPos : [0,1],
				startDir : 0
			},
			{
				grid : [
					[0,1,0,1,1,0,1,3,2],
					[0,0,0,7,7,7,7,7,0],
					[0,0,1,0,0,1,0,3,2],
				],
				goals : [
					[8,1], 
				],
				startPos : [0,1],
				startDir : 0
			},
		],
		startCode : [
			''
		]
	},
	'Perfect Packing' : {
		description : ' The new shipment of boxes and the warehouse is already pretty full.  Make sure not to waste any space.',
		versions : [
			{
				grid : [
					[1,1,1,1,1],
					[1,1,0,0,1],
					[1,1,0,0,0],
					[0,0,0,0,0],
					[1,1,1,1,1],
				],
				goals : [
					[0,0], [0,1], [0,4],
					[1,0], [1,1], [1,4],
					[2,0], [2,1], [2,4],
					[3,0], [3,1], [3,4],
					[4,0], [4,1], [4,4],

				],
				startPos : [2,2],
				startDir : 0
			},
			{
				grid : [
					[1,1,1,1,1,1],
					[1,0,1,0,0,1],
					[1,1,1,0,0,0],
					[0,0,0,0,0,0],
					[1,1,1,1,1,1],
				],
				goals : [
					[0,0], [0,1], [0,4],
					[1,0], [1,1], [1,4],
					[2,0], [2,1], [2,4],
					[3,0], [3,1], [3,4],
					[4,0], [4,1], [4,4],
					[5,0], [5,1], [5,4],

				],
				startPos : [3,2],
				startDir : 0
			},
			{
				grid : [
					[1,1,1,1,1,1,1,1,1],
					[1,0,0,1,1,0,0,0,1],
					[1,1,1,1,1,0,0,0,0],
					[0,0,0,0,0,0,0,0,0],
					[1,1,1,1,1,1,1,1,1],
				],
				goals : [
					[0,0], [0,1], [0,4],
					[1,0], [1,1], [1,4],
					[2,0], [2,1], [2,4],
					[3,0], [3,1], [3,4],
					[4,0], [4,1], [4,4],
					[5,0], [5,1], [5,4],
					[6,0], [6,1], [6,4],
					[7,0], [7,1], [7,4],
					[8,0], [8,1], [8,4],
				],
				startPos : [5,2],
				startDir : 0
			},
		],
		startCode : [
			''
		]
	},
	'Double Click' : {
		description : ' All of the boxes need to be moved over twice.  Be careful not to push them too far or else you may damage the goods.',
		versions : [
			{
				grid : [
					[7,7,7,7,0,0,1,0,1],
					[7,7,0,0,1,0,0,0,1],
					[7,7,7,0,0,1,0,0,1],
					[0,0,1,0,0,0,0,0,1],
					[7,7,7,0,0,1,0,0,1],
				],
				goals : [
					[4,0], 
					[2,1], 
					[3,2], 
					[0,3], 
					[3,4], 
				],
				startPos : [7,0],
				startDir : 3
			},
			{
				grid : [
					[0,0,1,0,0,0,0,0,1],
					[7,7,0,0,1,0,0,0,1],
					[7,7,7,7,0,0,1,0,1],
					[7,0,0,1,0,0,0,0,1],
					[7,0,0,1,0,0,0,0,1],
				],
				goals : [
					[0,0], 
					[2,1], 
					[4,2], 
					[1,3], 
					[1,4], 
				],
				startPos : [7,0],
				startDir : 3
			},
		],
		startCode : [
			''
		]
	},

	// this one can be VERY difficult with the current line limitations
	'Second Row' : {
		description : ' The boxes were not aligned correctly during their original shipment. It is vital that this warehouse has as much symmetry as possible.',
		versions : [
			{
				grid : [
					[0,0,0,0],
					[0,0,0,0],
					[1,1,1,1],
					[0,0,0,0],
					[1,1,1,1],
				],
				goals : [
					[0,1], [1,1], [2,1], [3,1], 
					[0,3], [1,3], [2,3], [3,3], 
				],
				startPos : [0,1],
				startDir : 3
			},
		],
		startCode : [
			''
		]
	},

	//pulling a block out and putting it back into place
	'Walled Off' : {
		description : ' James asked me the other day what products we\'re selling. Isn\'t it obvious? BOXES! What kind of company, that has "box" in its name, would sell         anything else?',
		versions : [
			{
				grid : [
					[0,0,0,4,0],
					[0,0,0,2,0],
					[0,0,0,1,0],
					[0,0,0,4,1],
					[0,0,0,2,0],
				],
				goals : [
					[3,2],
					[4,4],
				],
				startPos : [0,4],
				startDir : 0
			},
			{
				grid : [
					[0,0,0,4,0,0,0,2,0],
					[0,0,0,4,0,0,0,1,0],
					[0,0,0,2,0,0,0,4,0],
					[0,0,0,1,0,0,0,4,1],
					[0,0,0,2,0,0,0,2,0],
				],
				goals : [
					[3,3],
					[7,1],
					[8,4],
				],
				startPos : [0,4],
				startDir : 0
			},
			{
				grid : [
					[0,0,0,2,0,0,0,4,0],
					[0,0,0,1,0,0,0,2,0],
					[0,0,0,4,0,0,0,1,0],
					[0,0,0,4,0,0,0,4,1],
					[0,0,0,2,0,0,0,2,0],
				],
				goals : [
					[3,1],
					[7,2],
					[8,4],
				],
				startPos : [0,4],
				startDir : 0
			},
			{
				grid : [
					[0,0,0,1,0,0,0,1,0],
					[0,0,0,4,0,0,0,4,0],
					[0,0,0,4,0,0,0,4,0],
					[0,0,0,4,0,0,0,4,1],
					[0,0,0,2,0,0,0,2,0],
				],
				goals : [
					[3,0],
					[7,0],
					[8,4],
				],
				startPos : [0,4],
				startDir : 0
			},
		],
		startCode : [
			''
		]
	},

	// just using movements to solve a single puzzle, probably too simple
	'Out Of Place' : {
		description : ' Someone seems to have moved one of the boxes without permission. Please put it back before an investor notices.',
		versions : [
			{
				grid : [
					// goal
					// [1,0,0,1],
					// [0,0,0,0],
					// [0,0,0,0],
					// [1,0,0,1],

					[0,1,0,1],
					[0,0,0,0],
					[0,0,0,0],
					[1,0,0,1],
				],
				goals : [
					[0,0], 
					[0,3], 
					[3,0], 
					[3,3], 
				],
				startPos : [1,2],
				startDir : 1
			},
			{
				grid : [
					[1,0,1,0],
					[0,0,0,0],
					[0,0,0,0],
					[1,0,0,1],
				],
				goals : [
					[0,0], 
					[0,3], 
					[3,0], 
					[3,3], 
				],
				startPos : [1,2],
				startDir : 1
			},
			{
				grid : [
					[1,0,0,1],
					[0,0,0,0],
					[0,0,1,0],
					[1,0,0,0],
				],
				goals : [
					[0,0], 
					[0,3], 
					[3,0], 
					[3,3], 
				],
				startPos : [1,2],
				startDir : 1
			},
			{
				grid : [
					[1,0,0,1],
					[0,0,0,0],
					[0,0,0,0],
					[0,1,0,1],
				],
				goals : [
					[0,0], 
					[0,3], 
					[3,0], 
					[3,3], 
				],
				startPos : [1,2],
				startDir : 1
			},
		],
		startCode : [
			''
		]
	},

	// logic using forward or checking direction.
	'North?' : {
		description : ' The robot is already set up in the direction that the box needs to be moved.',
		versions : [
			{
				grid : [
					[0,0,0],
					[0,1,0],
					[0,0,0],
				],
				goals : [
					[2,1], 
				],
				startPos : [0,0],
				startDir : 0
			},
			{
				grid : [
					[0,0,0],
					[0,1,0],
					[0,0,0],
				],
				goals : [
					[1,0], 
				],
				startPos : [0,0],
				startDir : 1
			},
			{
				grid : [
					[0,0,0],
					[0,1,0],
					[0,0,0],
				],
				goals : [
					[0,1], 
				],
				startPos : [0,0],
				startDir : 2
			},
			{
				grid : [
					[0,0,0],
					[0,1,0],
					[0,0,0],
				],
				goals : [
					[1,2], 
				],
				startPos : [0,0],
				startDir : 3
			},
		],
		startCode : [
			''
		]
	},

	'One Sided' : {
		description : ' I keep forgetting which side the boxes are suppose to be stored in. Please move the boxes this while I figure this out.',
		versions : [
			/*  Sadly, I don't think this version is possible with the current limitations
			{
				grid : [
					[1,1,0,0,0],
					[1,1,0,0,0],
				],
				goals : [
					[3,0], [4,0], 
					[3,1], [4,1], 
				],
				startPos : [2,0],
				startDir : 3
			},
			*/
			// slightly different version from the one below, but I'm not sure if it's possible
			/*
			{
				grid : [
					[1,0,0,0],
					[1,0,0,0],
					[1,0,0,0],
					[1,0,0,0],
					[3,3,3,2],
				],
				goals : [
					[3,0], 
					[3,1], 
					[3,2], 
					[3,3],
				],
				startPos : [1,0],
				startDir : 3
			},
			*/
			
			
			{
				grid : [
					[1,0,0,0],
					[1,0,0,0],
					[1,0,0,0],
					[1,0,0,0],
					[0,0,0,0],
				],
				goals : [
					[3,0], 
					[3,1], 
					[3,2], 
					[3,3],
				],
				startPos : [1,0],
				startDir : 3
			},
			
		],
		startCode : [
			''
		]
	},

	/* this one just required too many instructions to even put one block in place
	'Next Aisle' : {
		description : ' This is a test level',
		versions : [
			{
				grid : [
					[0,0,0,0,0,0,1],
					[3,3,3,2,0,0,1],
					[1,1,1,0,0,0,1],
				],
				goals : [
					[0,0], 
					[1,0], 
					[2,0], 
				],
				startPos : [3,2],
				startDir : 0
			},
		],
		startCode : [
			''
		]
	},
	 */

	'Cornered' : {
		description : ' We\'re going to recieve a large order of new boxes soon.  We\'ll need to make some space for them.',
		versions : [
			{
				grid : [
					[0,0,0,0,0],
					[0,1,0,1,0],
					[0,0,0,0,0],
					[0,1,0,1,0],
					[0,0,0,0,0],
				],
				goals : [
					[0,0], 
					[0,4], 
					[4,0], 
					[4,4], 
				],
				startPos : [2,1],
				startDir : 0
			},
			{
				grid : [
					[0,0,0,0,0],
					[0,1,0,1,0],
					[0,0,0,0,0],
					[0,1,0,1,0],
					[0,0,0,0,0],
				],
				goals : [
					[0,0], 
					[0,4], 
					[4,0], 
					[4,4], 
				],
				startPos : [3,2],
				startDir : 3
			},
		],
		startCode : [
			''
		]
	},

	'#403 and #405' : {
		description : ' For this assignment, you will be working on one robot that will take care of two completely different warehouses.',
		versions : [
			{
				grid : [
					[0,0,1,0],
					[0,0,0,1],
					[0,0,0,0],
					[1,0,0,0],
				],
				goals : [
					[2,1], 
					[1,3], 
					[3,2], 
				],
				startPos : [3,3],
				startDir : 1
			},
			{
				grid : [
					[7,7,7,7,7,7,1,7],
					[1,0,0,1,7,0,0,7],
					[7,0,7,7,7,7,0,7],
					[7,0,0,0,0,0,0,1],
					[7,1,7,7,7,7,7,7],
				],
				goals : [
					[2,1], 
				],
				startPos : [5,1],
				startDir : 0
			},
		],
		startCode : [
			''
		]
	},
};

/*
	puzzle ideas
	
	(done) single row, teach push and pull (tutorial)
	(done) using rotation to count (counting)
	(kinda done) two rows of boxes (repetition)
	(done) row of boxes that have to either be on the top or middle row
		(this could include randomized solutions)

	(done) push blocks down a hallway to fill a gap
	(done) pull block from the left to fill unoccupied rows

	counting boxes
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
	7 = hole

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
let testingSpeed;
const baseTestingSpeed = 15;
const fastestTestingSpeed = 4;

let levelScore;
let prevBestChar;

let currentScene;
let currentLevel;
let currentVersion;
let testingVersion;
let currentSolution;

let levelsDone;

let levelCursor;
let levelSolutionCursor;
let levelSelectStage;
let levelDeleteKey;

let extraMenuCursor;
let extraMenuPage;
const extraMenuOptions = ['Close Menu', 'View Manual', 'Credits', 'Exit Level']
let gameManual = [
// done like this since I want it formatted in a very specific way
//                                             | \(text limit, inclusive)
' In each assignment, you will need to use the    \
robot to move all of the boxes in their          \
requested position.                              \
                                                 \
 It doesn\'t matter if the robot is in the       \
middle of instructions, once all of the boxes    \
are in place, the robot will automatically.      \
shut off'
,
' < Scoring >                                     \
                                                 \
 Your performance in each assignment is scored   \
in two different ways.                           \
                                                 \
 First, by how many characters you used in your  \
code. Whitespace and comments do not count       \
towards this amount. (Make comments using "/")   \
                                                 \
 Second, by how many steps it takes to complete  \
the assignment.'
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
CHK [dir] - Sets state to TRUE if there is an    \
            adjacent block in that direction,    \
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

const creditsPage = 
'Soko Code by Werxzy                              \
                                                 \
Source and updates can be found at:              \
 github.com/Werxzy/SokoCode                      \
                                                 \
Version ' + gameVersion;

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
		speed: -160,
		shift: 0
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
		speed: 80,
		shift: 1.5
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
		speed: 48,
		shift: 2.5
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
		speed: 30,
		shift: 4
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
		speed: 20,
		shift: 6
	}

];

let userSave;
/*
	save data format
	[
		levelname : {
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
	robotHalted = false;
	
	compiledCode = [];
	executingLine = -1;
	errorMessage = []
	lastExecutedLine = 0;
	isCompiled = false;
	isRunning = false;
	autoRun = false;
	autoRunDelay = 0;
	levelTime = 0;
	testingSpeed = baseTestingSpeed;

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

	levelsDone = calculateLevelsDone()
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
		// cool, but might be confused for something other than a target.
		// drawTextWrapped('▛▲▜ ▙▼▟', 8, goals[i][0] * 4 + sx + 1, goals[i][1] * 3 + sy + 1, 3);
		drawBox(8, goals[i][0] * 4 + sx + 1, goals[i][1] * 3 + sy + 1, 3, 2);
	}

	for(let i = 0; i < filledHoles.length; i++){
		drawBoxTop(6, filledHoles[i][0]*4 + sx + 1, filledHoles[i][1]*3 + sy + 1, 3, 2);
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

	for(let i = 0; i < goals.length; i++){
		if (level[goals[i][1]][goals[i][0]] == 1){
			drawBoxBottom(16, goals[i][0]*4 + sx, goals[i][1]*3 + sy, 3, 2, 0);
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
		for(let i = 0; i < cRow.text.length; i++){
			let col = cRow.colors[i] + Math.min(1 - i, 0)
			let y = i + cRow.yStart
			for(let x = (Math.floor(tick / cRow.speed + 28 + cRow.shift) % cRow.spacing) - cRow.spacing; x < 56; x += cRow.spacing){
				drawText(cRow.text[i], col, x + cRow.offsets[i], y)
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

	drawText('Ver. ' + gameVersion, 8, 32, 19)
	drawText('By Werxzy', 8, 46, 19)
	drawText('Press Any Key To Continue', 17, 1, 19)
}

function drawLevelInfo(){
	option = LEVEL_ORDER[levelCursor]
	levelName = option[0]
	nameX = Math.floor(36.5 - levelName.length / 2)

	drawText(levelName, 13, nameX, 1)
	drawBox(6, nameX-1, 0, levelName.length+2, 3)
	drawBox(6, 19, 2, 35, 16)
	drawText('╩', 6, nameX-1, 2)
	drawText('╩', 6, nameX+levelName.length, 2)

	if(option[1]){
		
		drawTextWrapped(ALL_LEVELS[levelName].description,11,20,3, 33)

		drawBox(6, 19, 9, 35, 3)
		drawBox(6, 19, 0, 6, 3)
		if(userSave[levelName].bestTime == 999)
			drawText('TODO', 6, 20, 1)
		else
			drawText('DONE', 13, 20, 1)
		drawText('╠════╩', 6, 19, 2)

		// NOTE, I'm using a weird method of drawing text vertically that may break in a future bbs version.

		drawTextWrapped('║ ║ ╠ ║ ╠', 6, 19, 7, 1);
		drawTextWrapped('╣ ║ ╣ ║ ╣', 6, 53, 7, 1);
		
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
	else{
		drawTextWrapped(MESSAGES[levelName],11,20,3, 33)
	}
}

function drawLevelSelection(){
	drawMainBoxes()
	for(let i = 0; i < LEVEL_ORDER.length; i++){
		if(LEVEL_ORDER[i][2] > levelsDone) break;
		drawText(LEVEL_ORDER[i][0], levelCursor == i ? 17 : 8, 1,i+1)
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
		if(autoRunDelay++ >= testingSpeed){
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
			drawText('(1) Faster (2) Step (3) Stop  ', 10, 17, 19);
			let state = robotState ? ' TRUE' : 'FALSE';
			state = robotTrapped ? 'STUCK' : state;
			state = robotHalted ? 'HALT' : state;

			statusText = 'Time:     State:' + state;
			
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
		drawText('(Enter) Select', 10, 17, 19)
	}
	else if(extraMenuPage == 1){
		drawTextWrapped(gameManual[extraMenuCursor], 10, 4, 4, 48)
		drawText('(Arrow Keys) Turn Page', 10, 17,19)
		p = ' ' + (extraMenuCursor + 1) + '/' + (gameManual.length) + ' '
		drawText(p, 10, 52-p.length, 17)
	}
	else if(extraMenuPage == 2){
		drawTextWrapped(creditsPage, 10, 4, 4, 48)
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
	robotHalted = false
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

function calculateLevelsDone(){
	count = 0;
	for(let i = 0; i < LEVEL_ORDER.length; i++){
		if(LEVEL_ORDER[i][1] && userSave[LEVEL_ORDER[i][0]].bestTime != 999){
			count += 1;
		}
	}
	return count;
}

// - - - - ~Programming~ functions - - - -




const keywords ={
	'CHK': [0, 'dir'],
	'CHF': [1, 'dir'],
	'SET': [2, 'bool'],
	'JMP': [3, 'label'],
	'JMT': [4, 'label'],
	'JMF': [5, 'label'],
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
	
	if(executingLine >= compiledCode.length) {
		robotHalted = true
		return; // Reached end of code
	}

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
			robotState = robotDir == d || d == 5;
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
		lastExecutedLine = -10
		levelTime = 0
		testingVersion = currentVersion
		testingSpeed = baseTestingSpeed
		robotHalted = false
	}
}

function levelInput(key){
	if(key >= 48 && key < 58){ // keys 0 to 9
		switch(key - 48){
			case 1: // run
				if(isRunning){
					testingSpeed = Math.max(testingSpeed - 2, fastestTestingSpeed);
				}
				startRun()
				if(isCompiled){
					if(!autoRun)
						autoRunDelay = 0;
					autoRun = true;
				}
				break;

			case 2: // step
				startRun()
				if(isCompiled){
					testingSpeed = baseTestingSpeed
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
					currentVersion = testingVersion
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
				if(levelCursor + 1 < LEVEL_ORDER.length && LEVEL_ORDER[levelCursor + 1][2] <= levelsDone){
					levelCursor += 1
				}
				break;
			case 10: // enter key
				currentLevel = Object.keys(ALL_LEVELS)[levelCursor];
				if(LEVEL_ORDER[levelCursor][1]){ // don't open messages as levels
					currentLevel = LEVEL_ORDER[levelCursor][0];
					levelSelectStage = 1;
					levelSolutionCursor = 0;
				}
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
	if(extraMenuPage == 0){ // menu options
		switch(key){
			case 17: // up arrow
				extraMenuCursor = Math.max(0, extraMenuCursor - 1);
				break;
			case 18: // down arrow
				extraMenuCursor = Math.min(extraMenuOptions.length - 1, extraMenuCursor + 1);
				break;
			case 10: // enter key
				if (extraMenuCursor == 0){ // close menu
					currentScene = 2;
				}
				if (extraMenuCursor == 1){ // view manual
					extraMenuPage = 1;
					extraMenuCursor = 0;
				}
				else if (extraMenuCursor == 2){ // credits
					extraMenuPage = 2;
				}
				else if (extraMenuCursor == 3){ // exit level
					saveUserData()
					currentScene = 1
					extraMenuCursor = 0
					levelsDone = calculateLevelsDone()
				}
				break;
			case 27: // escape
				currentScene = 2;
				break;
		}
	}
	else if(extraMenuPage == 1){ // manual
		switch(key){
			case 19: // left arrow
				extraMenuCursor = Math.max(0, extraMenuCursor - 1);
				break;
			case 20: // right arrow
				extraMenuCursor = Math.min(gameManual.length - 1, extraMenuCursor + 1);
				break;
			case 27: // escape
				extraMenuPage = 0;
				extraMenuCursor = 1;
				break;
		}
	}
	else if(extraMenuPage == 2){ // credits
		switch(key){
			case 27: // escape
				extraMenuPage = 0;
				extraMenuCursor = 2;
				break;
		}
	}
}

function winScreenInput(key){
	if(extraMenuPage == 0){
		switch(key){
			case 27: // escape
				currentScene = 1;
				levelsDone = calculateLevelsDone();
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

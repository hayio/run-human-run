// ThirdPersonStatus: Handles the player's state machine.

// Keeps track of inventory, health, lives, etc.


private static var points : float = 0.0;

function Awake()
{
}

// Utility function used by HUD script:
static function GetPoints() : int
{
	return points;
}

function AddPoints (no : float)
{
	points += no;
}

function AddBonusPoints (no : float)
{
	if (no > 0.0f) {
		points += 1;
	}
}

function SetUp ()
{
	points = 0;
}
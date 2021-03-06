#pragma strict


var player: Transform;

var height: float;
private var offset: Vector3;

// sredni kat pochlenia glowy
var inclineAngle = 30;

// skok glowy podczas biegu i czestosc tego ruchu
var maxHeadJump = 0.1; 
var maxJumpFrequency = 10.0;

private var headJump: float;
private var jumpFrequency: float;

private var angle = 0.0;

private var hasJustLanded = false;

private var gameManager: GameManager;


function Start () {
	offset = Vector3(0.0, height + 3.0, -3.0);//0.5);
	transform.position = player.position + offset;
	transform.rotation = player.rotation;
}

function ShouldMoveHead() {
	var playerMoveScript : PlayerMoveSingle = player.GetComponent(PlayerMoveSingle);
	return !playerMoveScript.IsJumping();
}

function Update () {
	transform.position = player.position;
	transform.rotation = player.rotation;
	
	var playerMove : PlayerMoveSingle = player.GetComponent(PlayerMoveSingle);
	var moveFactor = playerMove.GetSpeed() / playerMove.GetMaxSpeed();
	headJump = moveFactor * maxHeadJump;
	jumpFrequency = moveFactor * maxJumpFrequency;
	
	
	if (ShouldMoveHead()) {
		angle += jumpFrequency * Time.deltaTime;
	} else {
		angle = Mathf.Lerp(angle, Mathf.PI, 0.1);
	}
	
	if (angle > 2 * Mathf.PI) {
		angle -= 2 * Mathf.PI;
	}
	
	transform.Translate(offset + Vector3(0, headJump * Mathf.Sin(angle), 0));
	transform.Rotate(inclineAngle, 0, 0);
}

// Generator punktow tworzacych sciezke, po ktorej bedzie biegl gracz.

#pragma strict

// Enumerator sluzacy do opisu, czy generowane sa teraz punkty na wprost,
// na zakrecie w lewo czy zakrecie w prawo
enum TurnState {
	Straight,
	Left,
	Right
}

// ostatnio wygenerowany punkt
var currentPosition: Vector3;
// obrot ostatnio wygenerowanego punktu
var currentRotation: Quaternion;

// dlugosc sciezki, ktora ma zostac wygenerowana na poczatku
var initialPathLength: float;
// odleglosc miedzy dwoma kolejnymi punktami na sciezce
var deltaDot: float;

// maksymalny kat w stosunku do poczatkowego konta, pod ktorym
// punkty moga byc wygenerowane (zapobiega powrotowi w strone
// wygenerowanych wczesniej punktow)
var maxAngle = 60.0;


// zmienna opisujaca, czy teraz sciezka skreca czy nie
private var turning: TurnState = TurnState.Straight;

// prawdopodobienstwo rozpoczecia skrecania pod warunkiem, ze
// ostatnio generowano punkty na wprost 
var turnProb: float;

// liczba punktow, ktore beda jeszcze na aktualnym zakrecie
// (czyli pozostala dlugosc aktualnego zakretu)
private var turnsLeft = 0;

// minimalna dlugosc zakretu w punktach
var minTurnLength: int;
// maksymalna dlugosc zakretu w punktach
var maxTurnLength: int;

// ostrosc aktualnego zakretu wyrazona w stopniach
private var turnSharpness = 0.0;

// minimalna ostrosc zakretu wyrazona w stopniach
var minTurnSharpness: float;
// maksymalna ostrosc zakretu wyrazona w stopniach
var maxTurnSharpness: float;

// zmiana poziomu wysokosci
var heightStep = 0.5;

// prawdopodobienstwo wygenerowania kladki wyzej
var higherPadProb = 0.02;

// prawdopodobienstwo wygenerowania kladki nizej
var lowerPadProb = 0.01;

// minimalna liczba punktow bez zmiany wysokosci
var minimalPointsToChangeHeight = 30;

// liczba punktow od ostatniej zmiany wysokosci
private var pointsCountSinceHeightChange = 0;


/*****************************************************************************/
/*****************************************************************************/

function Awake () {
}

function Start () {
}

function Update () {
}

// Wygenerowanie sciezki o zadanej dlugosci
function GeneratePath(count: int, turnsAvailable: boolean): Vector3[] {
	var positions = new Vector3[count];
	
	for (var i = 0; i < count; i++) {
		if (turning == TurnState.Straight && Random.value < turnProb && turnsAvailable) {
			turnsLeft = Random.Range(minTurnLength, maxTurnLength + 1);
			turnSharpness = Random.Range(minTurnSharpness, maxTurnSharpness);
			turning = (Random.value < 0.5) ? TurnState.Left : TurnState.Right;
		}
		/*turnsLeft = 10000;
		turnSharpness = 1.0;
		turning = TurnState.Right;*/
		if (turning != TurnState.Straight) {
			var eulerAngles = currentRotation.eulerAngles;
			eulerAngles.y += (turning == TurnState.Left) ? -turnSharpness : turnSharpness;
			if (isAngleValid(eulerAngles.y)) {
				currentRotation = Quaternion.Euler(eulerAngles);
				turnsLeft -= 1;
				turning = (turnsLeft > 0) ? turning : TurnState.Straight;
			} else {
				turnsLeft = 0;
				turning = TurnState.Straight;
			}
		}
		
		if (pointsCountSinceHeightChange >= minimalPointsToChangeHeight) {
			var rand = Random.value;
			if (rand <= higherPadProb + lowerPadProb) {
				pointsCountSinceHeightChange = 0;
				if (rand < higherPadProb) {
					currentPosition.y += heightStep;
				} else {
					currentPosition.y -= heightStep;
				}
			}
		} else {
			pointsCountSinceHeightChange += 1;
		}
		
		positions[i] = currentPosition;
		
		currentPosition +=  currentRotation * (deltaDot * Vector3.forward);
	}
	
	return positions;
}

// Wygenerowanie poczatkowej sciezki
function GenerateInitialPath(): Vector3[] {
	if (initialPathLength < deltaDot) {
		Debug.LogError("Initial path too short");
	}
	if (deltaDot <= 0.0) {
		Debug.LogError("DeltaDot <= 0.0");
	}
	
	var gameManagerObj = GameObject.Find("GameManager");
	var gameManager = gameManagerObj.GetComponent("GameManager") as GameManager;
	var zombie = gameManager.GetZombie();
	currentPosition = zombie.transform.position;
	currentRotation = zombie.transform.rotation;
	var playersDist = (currentPosition - transform.position).magnitude;
	
	var neededSegments: int = (playersDist + initialPathLength) / deltaDot;
	
	return GeneratePath(neededSegments, false);
}

// Sprawdzenie, czy kat pomiedzy dwoma punktami sciezki spelnia ograniczenia
function isAngleValid(angle : float) {
	return (angle < maxAngle || 360.0 - maxAngle < angle);
}

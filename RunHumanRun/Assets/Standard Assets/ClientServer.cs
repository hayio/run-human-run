using UnityEngine;
using AllJoynUnity;
using System.Collections;

namespace rhr_multi
{
	public class ClientServer : MonoBehaviour
	{
		private bool isWorking = false;
		private string playerNick = "";
		private string enemyNick = "";
		// domyslnie nr gracza to 1, jak dolacza do sesji, staje sie graczem nr 2
		private int playerNr = 1;
		
		ArrayList envBuffer = new ArrayList();
		double[] playerInput = new double[0];
		double[] playerPos = new double[0];
		
		void Start()
		{
			DontDestroyOnLoad(this);
		}
	
	    void LateUpdate()
		{
			if (!isWorking)
				return;
	        if (Input.GetKeyDown(KeyCode.Escape)) {
				multiplayerHandler.CloseDown();
				Application.Quit();
			}
			if (HasAnythingToSend())
			{
				SendData();
			}
		}
		
		// Inicjacja klienta - serwera, uruchamiana przed rozpoczeciem
		// szukania graczy do gry przez siec
		public void Init(string nick)
		{
			isWorking = true;
			playerNick = nick;
			playerNr = 1;
			
			enemyNick = "";
			envBuffer = new ArrayList();
			playerInput = new double[0];
			playerPos = new double[0];
			
			multiplayerHandler = (RHRMultiplayerHandler)ScriptableObject.CreateInstance("RHRMultiplayerHandler");
			multiplayerHandler.SetPlayerNick(playerNick);
			multiplayerHandler.StartUp();
		}
		
		public void Destroy() {
			multiplayerHandler.CloseDown();	
		}
		
		// Wysyla dane i czysci bufory
		public void SendData()
		{
			double[] buffer = (envBuffer.Count > 0) ? (double[])envBuffer[0] : new double[0];
			multiplayerHandler.SendData(playerInput, playerPos, buffer);
			
			if (envBuffer.Count > 0)
			{
				envBuffer.RemoveAt(0);
			}
			playerInput = new double[0];
			playerPos = new double[0];
		}
		
		public bool HasAnythingToSend()
		{
			return envBuffer.Count > 0 || playerInput.Length > 0 || playerPos.Length > 0;
		}
		
		public bool HasAnyData()
		{
			return HasEnvData() || HasEnemyInput() || HasEnemyPos();	
		}
		
		// Zapisuje wejscie gracza i wysle je przy najblizszym obiegu petli
		public void SendPlayerInput(double[] pState)
		{
			playerInput = pState;
		}
		// Zapisuje pozycje gracza i wysle ja przy najblizszym obiegu petli
		public void SendPlayerPos(double[] pPos)
		{
			playerPos = pPos;
		}
		
		// Getter, setter ("adder"), sprawdzacz obecnosci danych otoczenia
		public double[] GetEnvData()
		{
			return multiplayerHandler.GetEnvData();	
		}
		
		public void SendUpdateState(double[] state)
		{
			envBuffer.Add(state);
		}
		
		public bool HasEnvData()
		{
			return multiplayerHandler.HasEnvData();
		}
		
		// Getter, sprawdzacz obecnosci wejscia przeciwnika
		public double[] GetEnemyInput()
		{
			return multiplayerHandler.GetEnemyInput();
		}
		
		public bool HasEnemyInput()
		{
			return multiplayerHandler.HasEnemyInput();
		}
		
		// Getter, sprawdzacz obecnosci pozycji przeciwnika
		public double[] GetEnemyPos()
		{
			return multiplayerHandler.GetEnemyPos();
		}
		
		public bool HasEnemyPos()
		{
			return multiplayerHandler.HasEnemyPos();
		}
		
		// FUNKCJE POMOCNICZE
		public int GetPlayerNr()
		{
			return playerNr;
		}
		
		public string GetPlayerNick()
		{
			return playerNick;	
		}
		
		public string GetEnemyNick()
		{
			return enemyNick;	
		}
		
		public bool IsDuringGame()
		{
			return multiplayerHandler.IsDuringGame();
		}
		
		public void SetTestStart()
		{
			multiplayerHandler.GameStarted();	
		}
		
		public string GetDebugText()
		{
			return RHRMultiplayerHandler.debugText;	
		}
		
		// FUNKCJE ZWIAZANE Z NAWIAZYWANIEM POLACZENIA itp.
		
		public bool isAllJoynStarted()
		{
			return RHRMultiplayerHandler.AllJoynStarted;
		}
		
		public void StartUp()
		{
			multiplayerHandler.StartUp();
		}
		
		public void JoinSession(string session)
		{
			multiplayerHandler.JoinSession(session);
			playerNr = 2;
		}
		
		public void LeaveSession()
		{
			multiplayerHandler.LeaveSession();
			playerNr = 1;
		}
		
		public void CloseDown()
		{
			multiplayerHandler.CloseDown();	
		}
		
		public bool HasJoinedSession()
		{
			return RHRMultiplayerHandler.currentJoinedSession != null;
		}
		
		public string GetConnectedPlayerName()
		{
			return multiplayerHandler.GetConnectedPlayerNick();
		}
		
		public ArrayList GetPlayersNicks()
		{
			ArrayList nicks = new ArrayList();
			foreach (string name in RHRMultiplayerHandler.sFoundName)
			{
				nicks.Add(multiplayerHandler.RetrievePlayerNick(name));
			}
			
			return nicks;
		}
		
		public ArrayList GetSessions()
		{
			return RHRMultiplayerHandler.sFoundName;
		}
		
		public string FoundNameToNick(string foundName)
		{
			return multiplayerHandler.RetrievePlayerNick(foundName);	
		}
	
		RHRMultiplayerHandler multiplayerHandler;
	}
}
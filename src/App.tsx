import { useEffect, useRef } from "react";
import "./App.css";
import { IPlayerApp, Player, Timer } from "textalive-app-api";

function App() {
  const mediaRef = useRef<HTMLDivElement>(null);
  const charDisplayRef = useRef<HTMLDivElement>(null);
  const wordDisplayRef = useRef<HTMLDivElement>(null);
  const phraseDisplayRef = useRef<HTMLDivElement>(null);
  const chordDisplayRef = useRef<HTMLDivElement>(null);
  const beatDisplayRef = useRef<HTMLDivElement>(null);
  const playBtnRef = useRef<HTMLButtonElement>(null);
  const pauseBtnRef = useRef<HTMLButtonElement>(null);
  const rewindBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const playButton = playBtnRef.current;
    const pauseButton = pauseBtnRef.current;
    const rewindButton = rewindBtnRef.current;
    const isRefReady =
      mediaRef.current &&
      charDisplayRef.current &&
      wordDisplayRef.current &&
      phraseDisplayRef.current &&
      chordDisplayRef.current &&
      beatDisplayRef.current &&
      playButton &&
      pauseButton &&
      rewindButton;
    if (!isRefReady) return;

    // ===== Playerを作成してリスナを登録することで順次処理を開始 ===== //
    const player = new Player({
      app: { token: import.meta.env.VITE_TEXTALIVE_APP_TOKEN as string },
      mediaElement: document.querySelector("#media") as HTMLDivElement,
    });
    //ボタンに再生・停止・巻き戻しをセットします。
    const play = () => player.requestPlay();
    const pause = () => player.requestPause();
    const rewind = () => player.requestMediaSeek(0);

    const addButtonEventListeners = () => {
      playButton!.addEventListener("click", play);
      pauseButton!.addEventListener("click", pause);
      rewindButton!.addEventListener("click", rewind);
    };

    // ===== 楽曲情報を取得、表示するためのメソッドを用意 ===== //
    //Playerに設定するイベントリスナです。(onAppReady, onTimerReady)
    const onAppReady = (app: IPlayerApp) => {
      player.createFromSongUrl("https://piapro.jp/t/fnhJ/20230131212038");
    };
    const onTimerReady = (t: Timer) => {
      //再生の準備が整った時に呼ばれます。
      addButtonEventListeners();
      playButton!.disabled = false;
      pauseButton!.disabled = false;
      rewindButton!.disabled = false;
    };

    let prevBeatPosition = -1;
    const onTimeUpdate = (position: number) => {
      //歌詞の取得。文字・単語・フレーズ単位で取得できます。
      const char = player.video.findChar(position)?.text;
      const word = player.video.findWord(position)?.text;
      const phrase = player.video.findPhrase(position)?.text;
      //歌詞があれば表示します。
      char && (charDisplayRef.current!.textContent = char);
      word && (wordDisplayRef.current!.textContent = word);
      phrase && (phraseDisplayRef.current!.textContent = phrase);

      //コードの取得
      chordDisplayRef.current!.textContent = player.findChord(position).name;
      //ビートの取得
      const beat = player.findBeat(position);
      if (beat.position === prevBeatPosition) return;
      let beatText = "";
      for (let i = 0; i < beat.position; i++) {
        beatText += "* ";
      }
      beatDisplayRef.current!.textContent = beatText;
      prevBeatPosition = beat.position;
    };

    player.addListener({
      onAppReady,
      onTimerReady,
      onTimeUpdate,
    });
    return () => {
      if (player) player.dispose();
      if (playButton && pauseButton && rewindButton) {
        playButton.removeEventListener("click", play);
        pauseButton.removeEventListener("click", pause);
        rewindButton.removeEventListener("click", rewind);
      }
    };
  }, []);

  return (
    <div id="app">
      <h1>TextAlive App Basic</h1>
      <div className="controls">
        <div id="media" ref={mediaRef}></div>
        <div className="buttons">
          <button ref={playBtnRef} disabled>
            Play
          </button>
          <button ref={pauseBtnRef} disabled>
            Pause
          </button>
          <button ref={rewindBtnRef} disabled>
            Rewind
          </button>
        </div>
      </div>

      <div>
        <h3>Lyric</h3>
        <div className="div"></div>
        <div>
          <p>
            Char:
            <span className="display" ref={charDisplayRef}></span>
          </p>
          <p>
            Word:
            <span className="display" ref={wordDisplayRef}></span>
          </p>
          <p>
            phrase:
            <span className="display" ref={phraseDisplayRef}></span>
          </p>
          <h3>Chord</h3>
          <div className="div"></div>
          <p>
            <span className="display" ref={chordDisplayRef}></span>
          </p>
          <h3>Beats</h3>
          <div className="div"></div>
          <p>
            <span className="display" ref={beatDisplayRef}></span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;

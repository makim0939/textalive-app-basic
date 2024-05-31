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
    const isRefReady =
      mediaRef.current &&
      charDisplayRef.current &&
      wordDisplayRef.current &&
      phraseDisplayRef.current &&
      chordDisplayRef.current &&
      beatDisplayRef.current &&
      playBtnRef.current &&
      pauseBtnRef.current &&
      rewindBtnRef.current;
    if (!isRefReady) return;

    //ボタンに再生・停止・巻き戻しをセットします。
    const addButtonEventListeners = () => {
      playBtnRef.current!.addEventListener("click", () => player.requestPlay());
      pauseBtnRef.current!.addEventListener("click", () => player.requestPause());
      rewindBtnRef.current!.addEventListener("click", () => player.requestMediaSeek(0));
    };

    // ===== 楽曲情報を取得、表示するためのメソッドを用意 ===== //
    //Playerに設定するイベントリスナです。(onAppReady, onTimerReady)
    const onAppReady = (app: IPlayerApp) => {
      player.createFromSongUrl("https://piapro.jp/t/fnhJ/20230131212038");
      addButtonEventListeners();
    };
    const onTimerReady = (t: Timer) => {
      //再生の準備が整った時に呼ばれます。
      playBtnRef.current!.disabled = false;
      pauseBtnRef.current!.disabled = false;
      rewindBtnRef.current!.disabled = false;
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

    // ===== Playerを作成してリスナを登録することで順次処理を開始 ===== //
    const player = new Player({
      app: { token: "pLPdxQ1b4e3Rfn0O" },
      mediaElement: document.querySelector("#media") as HTMLDivElement,
    });
    player.addListener({
      onAppReady,
      onTimerReady,
      onTimeUpdate,
    });
    return () => {
      player.dispose();
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

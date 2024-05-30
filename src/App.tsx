import { useEffect, useRef } from "react";
import "./App.css";
import { IPlayerApp, IRenderingUnit, IVideo, Player, Timer } from "textalive-app-api";

function App() {
  const mediaRef = useRef<HTMLDivElement>(null);
  const charDisplayRef = useRef<HTMLDivElement>(null);
  const wordDisplayRef = useRef<HTMLDivElement>(null);
  const phraseDisplayRef = useRef<HTMLDivElement>(null);
  const chordDisplayRef = useRef<HTMLDivElement>(null);
  const beatsDisplayRef = useRef<HTMLDivElement>(null);
  const playBtnRef = useRef<HTMLButtonElement>(null);
  const pauseBtnRef = useRef<HTMLButtonElement>(null);
  const rewindBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mediaRef.current) return;
    if (!(playBtnRef.current && pauseBtnRef.current && rewindBtnRef.current)) return;
    if (
      !(
        charDisplayRef &&
        wordDisplayRef.current &&
        phraseDisplayRef &&
        chordDisplayRef.current &&
        beatsDisplayRef.current
      )
    )
      return;
    console.log(playBtnRef.current);

    const player = new Player({
      app: { token: import.meta.env.APP_TOKEN },
      mediaElement: mediaRef.current,
    });

    const addButtonEventListeners = () => {
      playBtnRef.current!.addEventListener("click", () => player.requestPlay());
      pauseBtnRef.current!.addEventListener("click", () => player.requestPause());
      rewindBtnRef.current!.addEventListener("click", () => player.requestMediaSeek(0));
    };
    const onAppReady = (app: IPlayerApp) => {
      player.createFromSongUrl("https://piapro.jp/t/fnhJ/20230131212038");
      addButtonEventListeners();
    };
    const onVideoReady = (v: IVideo) => {
      // const animateWord = function (now: number, unit: IRenderingUnit) {
      //   if (unit.contains(now)) {
      //     wordDisplayRef.current!.textContent = unit.toString();
      //   }
      // };
      // let w = player.video.firstWord;
      // while (w) {
      //   console.log(w.text);
      //   w.animate = animateWord;
      //   w = w.next;
      // }
    };
    const onTimerReady = (t: Timer) => {
      console.log("timer Ready");
      playBtnRef.current!.disabled = false;
      pauseBtnRef.current!.disabled = false;
      rewindBtnRef.current!.disabled = false;
    };
    let prevBeatStartTime = -1;
    const onTimeUpdate = (position: number) => {
      const char = player.video.findChar(position)?.text;
      const word = player.video.findWord(position)?.text;
      const phrase = player.video.findPhrase(position)?.text;

      char && (charDisplayRef.current!.textContent = char);
      word && (wordDisplayRef.current!.textContent = word);
      phrase && (phraseDisplayRef.current!.textContent = phrase);
      chordDisplayRef.current!.textContent = player.findChord(position).name;
      const beat = player.findBeat(position);
      if (beat && beat.startTime !== prevBeatStartTime) {
        //取得したビートが小節中の何拍目かに応じて「*」を表示します。
        prevBeatStartTime = beat.startTime;
        let beatText = "";
        for (let i = 0; i < beat.position; i++) {
          beatText += "* ";
        }
        beatsDisplayRef.current!.textContent = beatText;
      }
    };

    player.addListener({
      onAppReady,
      onVideoReady,
      onTimerReady,
      onTimeUpdate,
    });

    // // loopId = requestAnimationFrame(loop);

    return () => {
      player.dispose();
    };
  }, []);
  return (
    <>
      <h1>TextAlive App Basic</h1>
      <div>
        <div id="media" ref={mediaRef}></div>
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

      <div>
        <h3>Lyric</h3>
        <div className="div"></div>
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
          <span className="display" ref={beatsDisplayRef}></span>
        </p>
      </div>
    </>
  );
}

export default App;

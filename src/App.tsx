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
      app: { token: "pLPdxQ1b4e3Rfn0O" },
      mediaElement: mediaRef.current,
    });

    let loopId: number;
    let prevBeatStartTime = 0;
    const loop = () => {
      const char = player.video.findChar(player.timer.position)?.text;
      const word = player.video.findWord(player.timer.position)?.text;
      const phrase = player.video.findPhrase(player.timer.position)?.text;

      char && (charDisplayRef.current!.textContent = char);
      word && (wordDisplayRef.current!.textContent = word);
      phrase && (phraseDisplayRef.current!.textContent = phrase);
      chordDisplayRef.current!.textContent = player.findChord(player.timer.position).name;
      const beat = player.findBeat(player.timer.position);
      if (beat && beat.startTime !== prevBeatStartTime) {
        console.log(beat.startTime);
        prevBeatStartTime = beat.startTime;
        let beatText = "";
        for (let i = 0; i < beat.position; i++) {
          beatText += "*";
        }
        beatsDisplayRef.current!.textContent = beatText;
      }
      // beatsDisplayRef.current!.textContent = player.findBeat(player.timer.position).length.toString();
      loopId = requestAnimationFrame(loop);
    };

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
      loopId = requestAnimationFrame(loop);
    };

    player.addListener({
      onAppReady,
      onVideoReady,
      onTimerReady,
    });

    // // loopId = requestAnimationFrame(loop);

    return () => {
      player.dispose();
      console.log("cancel", loopId);
      cancelAnimationFrame(loopId);
    };
  }, []);
  return (
    <>
      <h1>textAlive App Basic</h1>

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
        <h3>Lyric→</h3>
        <p>
          <span className="display" ref={charDisplayRef}>
            Character
          </span>
        </p>
        <p>
          <span className="display" ref={wordDisplayRef}>
            Word
          </span>
        </p>
        <p>
          <span className="display" ref={phraseDisplayRef}>
            Phrase
          </span>
        </p>
        <h3>Chord→</h3>
        <p>
          <span className="display" ref={chordDisplayRef}>
            Chord
          </span>
        </p>
        <h3>Beats→</h3>
        <p>
          <span className="display" ref={beatsDisplayRef}>
            Beats
          </span>
        </p>
      </div>
    </>
  );
}

export default App;

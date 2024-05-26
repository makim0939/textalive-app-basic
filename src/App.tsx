import { useEffect, useRef } from "react";
import "./App.css";
import { IPlayerApp, IRenderingUnit, IVideo, Player, Timer } from "textalive-app-api";

function App() {
  const mediaRef = useRef<HTMLDivElement>(null);
  const wordDisplayRef = useRef<HTMLDivElement>(null);
  const playBtnRef = useRef<HTMLButtonElement>(null);
  const pauseBtnRef = useRef<HTMLButtonElement>(null);
  const rewindBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mediaRef.current) return;
    if (!(playBtnRef.current && pauseBtnRef.current && rewindBtnRef.current)) return;
    if (!wordDisplayRef.current) return;
    const player = new Player({
      app: { token: "pLPdxQ1b4e3Rfn0O" },
      mediaElement: mediaRef.current,
    });
    const addButtonEventListeners = () => {
      playBtnRef.current!.addEventListener("click", () => player.requestPlay());
      pauseBtnRef.current!.addEventListener("click", () => player.requestPause());
      rewindBtnRef.current!.addEventListener("click", () => player.requestMediaSeek(0));
    };
    const onAppReady = (app: IPlayerApp) => {
      console.log("app status: ", player.app.status);
      player.createFromSongUrl("https://piapro.jp/t/fnhJ/20230131212038");
      addButtonEventListeners();
    };
    const onVideoReady = (v: IVideo) => {
      const animateWord = function (now: number, unit: IRenderingUnit) {
        if (unit.contains(now)) {
          wordDisplayRef.current.textContent = unit.toString();
        }
      };
      let w = player.video.firstWord;
      while (w) {
        console.log(w.text);
        w.animate = animateWord;
        w = w.next;
      }
    };
    const onTimerReady = (t: Timer) => {
      console.log("timer Ready");
      playBtnRef.current!.disabled = false;
      pauseBtnRef.current!.disabled = false;
      rewindBtnRef.current!.disabled = false;
    };

    player.addListener({
      onAppReady,
      onVideoReady,
      onTimerReady,
    });

    return () => player.dispose();
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
        <h3>Lyric</h3>
        <p>
          <span ref={wordDisplayRef}>Lyric</span>
        </p>
      </div>
    </>
  );
}

export default App;

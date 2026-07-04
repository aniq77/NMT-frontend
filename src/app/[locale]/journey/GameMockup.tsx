"use client";

import { useEffect, useRef } from "react";
import { BODY_HTML, SCRIPT_JS } from "./mockup-content";
import "./game-mockup.css";

/**
 * Faithful, verbatim mount of the NMT Journey mockup (all screens: auth/registration,
 * home, profile, subjects, path, quiz, boss battle, leaderboard, tasks, shop, friends,
 * duels + bottom dock). The markup is rendered as-is and the original vanilla script is
 * injected so every inline `onclick="nav(...)"` handler resolves against the globals it
 * defines. All CSS is scoped under `.game-app` (see game-mockup.css) so nothing leaks
 * into the rest of the app.
 */
// Optional deep-linking: /journey#home, #boss, #shop … opens that screen directly.
// With no hash the default behaviour (registration overlay first) is unchanged.
const DEEP_LINK = `
;(function(){try{
  var h=(location.hash||'').replace('#','');
  if(!h) return;
  var a=document.getElementById('authOverlay'); if(a) a.classList.add('hidden');
  if(h==='boss'){ if(typeof openBoss==='function') openBoss(); return; }
  var views=['home','profile','subjects','algebra','geometry','path','quiz','rating','tasks','shop','friends','duels'];
  if(views.indexOf(h)>=0 && typeof nav==='function') nav(h);
}catch(e){}})();`;

export default function GameMockup() {
  const injected = useRef(false);

  useEffect(() => {
    if (injected.current) return; // guard React StrictMode double-invoke
    injected.current = true;
    const s = document.createElement("script");
    s.setAttribute("data-game-mockup", "");
    s.textContent = SCRIPT_JS + DEEP_LINK;
    document.body.appendChild(s);
    return () => {
      document.querySelectorAll("script[data-game-mockup]").forEach((el) => el.remove());
    };
  }, []);

  return (
    <div
      className="game-app"
      style={{ minHeight: "100dvh" }}
      dangerouslySetInnerHTML={{ __html: BODY_HTML }}
    />
  );
}

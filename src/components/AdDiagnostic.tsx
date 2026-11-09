'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { adsAllowed, CONSENT_CHANGED_EVENT } from '@/lib/consent';

const NATIVE_CONTAINER_ID = 'container-2219d728bd140f492c47b5e49fe870ad';
const NATIVE_SRC = 'https://bauval.org/21/2219d728bd140f492c47b5e49fe870ad';
const NATIVE_TAG_ID = 'ad-native-banner';
const SOCIAL_SRC = 'https://bauval.org/14/e82678238737ef67a400827536c7a4db';
const SOCIAL_TAG_ID = 'adsterra-social-bar';
const FLAG_KEY = 'plp_addiag';

interface Facts {
  allowed: boolean;
  containerFound: boolean;
  scriptTag: boolean;
  bauvalRequests: number;
  children: number;
  iframes: number;
  lines: string[];
}

function short(s: string, n = 70): string {
  return s.length > n ? s.slice(0, n) + '...' : s;
}

function hostOf(url: string): string {
  try {
    return new URL(url).host;
  } catch {
    return '';
  }
}

function readStore(kind: 'local' | 'session', key: string): string {
  try {
    const st = kind === 'local' ? window.localStorage : window.sessionStorage;
    return st.getItem(key) || '';
  } catch {
    return '(storage blocked)';
  }
}

function collectFacts(): Facts {
  const allowed = adsAllowed();
  const gpc = (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl;
  const container = document.getElementById(NATIVE_CONTAINER_ID);
  const allContainers = Array.from(document.querySelectorAll('[id^="container-"]')).map((e) => e.id);
  const bauval = performance
    .getEntriesByType('resource')
    .filter((e) => e.name.includes('bauval.org'));
  const thirdParty = Array.from(
    new Set(
      performance
        .getEntriesByType('resource')
        .map((e) => hostOf(e.name))
        .filter((h) => h && h !== window.location.host),
    ),
  );

  const lines: string[] = [];
  lines.push(`host: ${window.location.host}`);
  lines.push(`adsAllowed (real time): ${String(allowed)}`);
  lines.push(`region mode: ${readStore('session', 'plp_region_mode_v1') || 'unknown'}`);
  lines.push(`consent: ${readStore('local', 'plp_consent_v1') || 'none'}`);
  lines.push(`GPC: ${String(gpc)}`);
  lines.push(`container ids on page: ${allContainers.length ? allContainers.join(', ') : 'NONE'}`);
  lines.push(
    container
      ? `our container: FOUND, height ${container.offsetHeight}px, children ${container.childElementCount}, iframes ${container.getElementsByTagName('iframe').length}`
      : 'our container: NOT FOUND',
  );
  lines.push(`native script tag in DOM: ${document.getElementById(NATIVE_TAG_ID) ? 'yes' : 'no'}`);
  lines.push(`social bar script tag in DOM: ${document.getElementById(SOCIAL_TAG_ID) ? 'yes' : 'no'}`);
  lines.push(`social bar loads this session: ${readStore('session', 'plp_sb_loads') || '0'}`);
  lines.push(`bauval.org requests seen: ${bauval.length}`);
  for (const b of bauval.slice(0, 3)) lines.push(`  ${short(b.name.replace('https://', ''), 60)}`);
  lines.push(`third-party hosts so far: ${thirdParty.length ? thirdParty.join(', ') : 'none'}`);

  return {
    allowed,
    containerFound: !!container,
    scriptTag: !!document.getElementById(NATIVE_TAG_ID),
    bauvalRequests: bauval.length,
    children: container ? container.childElementCount : 0,
    iframes: container ? container.getElementsByTagName('iframe').length : 0,
    lines,
  };
}

function verdictFor(f: Facts, failed: boolean): string {
  if (!f.allowed) return 'LIKELY CAUSE: consent / region / GPC is blocking ads (adsAllowed is false).';
  if (!f.containerFound) return 'LIKELY CAUSE: our container is not on this page. AdSlot is not mounted (or an old container ID is used).';
  if (failed) return 'LIKELY CAUSE: a script or CSP error was caught. See errors below.';
  if (!f.scriptTag && f.bauvalRequests === 0) return 'Script not injected yet. Scroll so the ad area is on screen and wait a few seconds.';
  if (f.scriptTag && f.bauvalRequests === 0) return 'Script tag exists but no request to bauval.org: ad blocker, Private DNS or network blocking it.';
  if (f.bauvalRequests > 0 && f.children === 0 && f.iframes === 0) return 'Script reached bauval.org but the container is still empty: the network served no ad (no-fill, domain not approved) or has not answered yet.';
  return 'Container has content. If nothing is visible, check size or colours.';
}

export default function AdDiagnostic() {
  const [mounted, setMounted] = useState(false);
  const [on, setOn] = useState(false);
  const [open, setOpen] = useState(true);
  const [facts, setFacts] = useState<Facts | null>(null);
  const [events, setEvents] = useState<string[]>([]);
  const [csp, setCsp] = useState<string[]>(['reading headers...']);
  const failedRef = useRef(false);
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  const log = useCallback((m: string, isFailure = false) => {
    const t = new Date().toLocaleTimeString();
    setEvents((prev) => [...prev.slice(-24), `${t} ${m}`]);
    if (isFailure) {
      failedRef.current = true;
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    try {
      const p = new URLSearchParams(window.location.search).get('addiag');
      if (p === '1') window.localStorage.setItem(FLAG_KEY, '1');
      if (p === '0') window.localStorage.removeItem(FLAG_KEY);
      if (window.localStorage.getItem(FLAG_KEY) === '1') setOn(true);
    } catch {
      /* storage blocked: stay off */
    }
  }, []);

  useEffect(() => {
    if (!on) return;

    const onViolation = (e: SecurityPolicyViolationEvent) => {
      log(`CSP VIOLATION ${e.violatedDirective} blocked ${e.blockedURI || '(inline/eval)'}`, true);
    };
    const onResourceError = (e: Event) => {
      const t = e.target as unknown as { tagName?: string; src?: string; href?: string } | null;
      if (!t || !t.tagName) return;
      const tag = t.tagName.toUpperCase();
      if (tag === 'SCRIPT' || tag === 'IFRAME' || tag === 'IMG' || tag === 'LINK') {
        const url = t.src || t.href || '';
        if (url && !url.startsWith(window.location.origin)) {
          log(`LOAD ERROR <${tag}> ${short(url)}`, true);
        }
      }
    };
    const onConsent = () => log(`consent changed, adsAllowed now ${String(adsAllowed())}`);

    document.addEventListener('securitypolicyviolation', onViolation);
    window.addEventListener('error', onResourceError, true);
    window.addEventListener(CONSENT_CHANGED_EVENT, onConsent);

    const mo = new MutationObserver((muts) => {
      for (const m of muts) {
        m.addedNodes.forEach((n) => {
          if (n instanceof HTMLScriptElement && n.src.includes('bauval.org')) {
            log(`script ADDED id=${n.id || '-'} ${short(n.src, 50)}`);
          } else if (n instanceof HTMLIFrameElement && n.src) {
            log(`iframe ADDED host=${hostOf(n.src) || '(blank)'}`);
          }
        });
        m.removedNodes.forEach((n) => {
          if (n instanceof HTMLScriptElement && n.src.includes('bauval.org')) {
            log(`script REMOVED id=${n.id || '-'} ${short(n.src, 50)}`);
          }
        });
      }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });

    fetch(window.location.href, { cache: 'no-store' })
      .then((r) => {
        const header = r.headers.get('content-security-policy');
        if (!header) {
          setCsp(['no CSP header on this response (or it is set via meta tag)']);
          return;
        }
        const dirs = header.split(';').map((d) => d.trim());
        const want = ['default-src', 'script-src', 'frame-src', 'img-src', 'connect-src'];
        const out: string[] = [];
        for (const w of want) {
          const d = dirs.find((x) => x.startsWith(w + ' '));
          out.push(d ? short(d, 220) : `${w}: (not set, falls back to default-src)`);
        }
        const scriptDir = dirs.find((x) => x.startsWith('script-src ')) || dirs.find((x) => x.startsWith('default-src ')) || '';
        out.push(
          `bauval.org allowed for scripts: ${/bauval\.org/.test(scriptDir) || /\shttps:(\s|$)/.test(scriptDir) ? 'YES' : 'NO'}`,
        );
        setCsp(out);
      })
      .catch((e) => setCsp([`could not read headers: ${String(e)}`]));

    const tick = () => {
      const f = collectFacts();
      setFacts(f);
    };
    tick();
    const timer = window.setInterval(tick, 1000);

    return () => {
      document.removeEventListener('securitypolicyviolation', onViolation);
      window.removeEventListener('error', onResourceError, true);
      window.removeEventListener(CONSENT_CHANGED_EVENT, onConsent);
      mo.disconnect();
      window.clearInterval(timer);
    };
  }, [on, log]);

  const forceScript = useCallback(
    (id: string, src: string, needContainer: boolean) => {
      if (document.getElementById(id)) {
        log(`force test: tag ${id} already exists, not adding another`);
        return;
      }
      let parent: Element = document.body;
      if (needContainer) {
        let c = document.getElementById(NATIVE_CONTAINER_ID);
        if (!c) {
          c = document.createElement('div');
          c.id = NATIVE_CONTAINER_ID;
          c.style.minHeight = '280px';
          c.style.margin = '16px';
          c.style.border = '1px dashed #999';
          document.body.appendChild(c);
          log('force test: container was missing, created a temporary one at page end');
        }
        parent = c.parentElement || document.body;
        const s = document.createElement('script');
        s.id = id;
        s.src = src;
        s.async = true;
        s.setAttribute('data-cfasync', 'false');
        s.onload = () => log(`force test: script LOADED ${id}`);
        s.onerror = () => log(`force test: script FAILED ${id} (CSP, ad blocker or network)`, true);
        parent.insertBefore(s, c);
        log(`force test: injected ${id}`);
        return;
      }
      const s = document.createElement('script');
      s.id = id;
      s.src = src;
      s.async = true;
      s.setAttribute('data-cfasync', 'false');
      s.onload = () => log(`force test: script LOADED ${id}`);
      s.onerror = () => log(`force test: script FAILED ${id} (CSP, ad blocker or network)`, true);
      parent.appendChild(s);
      log(`force test: injected ${id}`);
    },
    [log],
  );

  const probe = useCallback(() => {
    log('probe: contacting bauval.org ...');
    fetch(NATIVE_SRC, { mode: 'no-cors', cache: 'no-store' })
      .then(() => log('probe: bauval.org reachable (response received)'))
      .catch((e) => log(`probe: FAILED ${String(e)} (CSP connect-src, ad blocker or no network)`, true));
  }, [log]);

  const copyReport = useCallback(() => {
    const text = [
      facts ? verdictFor(facts, failedRef.current) : '',
      ...(facts ? facts.lines : []),
      '--- CSP ---',
      ...csp,
      '--- events ---',
      ...events,
    ].join('\n');
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => log('copy failed: take a screenshot instead'));
  }, [facts, csp, events, log]);

  if (!mounted || !on) return null;

  const btn: React.CSSProperties = {
    background: '#334155',
    color: '#fff',
    border: 0,
    borderRadius: 6,
    padding: '6px 8px',
    fontSize: 11,
    marginRight: 6,
    marginTop: 6,
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 6,
        left: 6,
        right: 6,
        zIndex: 2147483000,
        maxHeight: open ? '60vh' : undefined,
        overflow: 'auto',
        background: 'rgba(0,0,0,0.93)',
        color: '#fff',
        font: '11px/1.4 monospace',
        padding: 8,
        borderRadius: 8,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
      }}
    >
      <button type="button" style={btn} onClick={() => setOpen((v) => !v)}>
        {open ? 'Collapse' : 'Expand'}
      </button>
      <strong>AD DIAGNOSTIC (open ?addiag=0 to turn off)</strong>
      {open && facts && (
        <>
          {'\n'}
          <span style={{ color: '#fde047' }}>{verdictFor(facts, failed)}</span>
          {'\n\n'}
          {facts.lines.join('\n')}
          {'\n\n'}
          <strong>Your CSP</strong>
          {'\n'}
          {csp.join('\n')}
          {'\n\n'}
          <strong>Events and errors ({events.length})</strong>
          {'\n'}
          {events.length ? events.join('\n') : '(none yet)'}
          {'\n'}
          <button type="button" style={btn} onClick={() => forceScript('diag-native-test', NATIVE_SRC, true)}>
            Force native test
          </button>
          <button type="button" style={btn} onClick={() => forceScript('diag-social-test', SOCIAL_SRC, false)}>
            Force social test
          </button>
          <button type="button" style={btn} onClick={probe}>
            Probe bauval.org
          </button>
          <button type="button" style={btn} onClick={copyReport}>
            {copied ? 'Copied' : 'Copy report'}
          </button>
        </>
      )}
    </div>
  );
}

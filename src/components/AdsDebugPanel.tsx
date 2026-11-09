'use client';

import { useEffect, useState } from 'react';
import { adsAllowed } from '@/lib/consent';
import { GATED_SCRIPTS, NATIVE_BANNER, isAdsDebug } from '@/lib/ads';

type LogWindow = Window & { __plpAdsLog?: string[] };

function snapshot(): string[] {
  const out: string[] = [];
  let consent = 'none';
  let mode = 'unknown';
  let sbLoads = '0';
  try {
    consent = window.localStorage.getItem('plp_consent_v1') || 'none';
    mode = window.sessionStorage.getItem('plp_region_mode_v1') || 'unknown';
    sbLoads = window.sessionStorage.getItem('plp_sb_loads') || '0';
  } catch {
    /* storage blocked */
  }
  const gpc = (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl;

  out.push(`host: ${window.location.host}`);
  out.push(`mode: ${mode}`);
  out.push(`consent: ${consent}`);
  out.push(`GPC: ${String(gpc)}`);
  out.push(`adsAllowed: ${String(adsAllowed())}`);

  const container = document.getElementById(NATIVE_BANNER.containerId);
  if (container) {
    out.push(
      `native container: yes, height ${container.offsetHeight}px, children ${container.childElementCount}, iframes ${container.getElementsByTagName('iframe').length}`,
    );
  } else {
    out.push('native container: NO (not rendered: consent not allowed, or AdSlot missing)');
  }
  out.push(`native script tag: ${document.getElementById(NATIVE_BANNER.scriptId) ? 'yes' : 'no'}`);
  for (const s of GATED_SCRIPTS) {
    out.push(`${s.id} tag: ${document.getElementById(s.id) ? 'yes' : 'no'} (loads this session: ${sbLoads})`);
  }

  const seen = performance
    .getEntriesByType('resource')
    .filter((e) => e.name.includes('bauval.org'))
    .map((e) => e.name.replace('https://', '').slice(0, 50));
  out.push(`bauval requests seen: ${seen.length}`);
  for (const n of seen.slice(0, 4)) out.push(`  ${n}`);
  return out;
}

export default function AdsDebugPanel() {
  const [on, setOn] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [violations, setViolations] = useState<string[]>([]);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    try {
      const p = new URLSearchParams(window.location.search).get('adsdebug');
      if (p === '1') window.localStorage.setItem('plp_ads_debug', '1');
      if (p === '0') window.localStorage.removeItem('plp_ads_debug');
    } catch {
      /* ignore */
    }
    if (!isAdsDebug()) return;
    setOn(true);

    const onViolation = (e: SecurityPolicyViolationEvent) => {
      const line = `${e.violatedDirective} blocked: ${e.blockedURI || '(inline/eval)'}`.slice(0, 140);
      setViolations((prev) => (prev.includes(line) ? prev : [...prev, line].slice(-8)));
    };
    document.addEventListener('securitypolicyviolation', onViolation);

    const tick = () => {
      setLines(snapshot());
      const w = window as LogWindow;
      setLog((w.__plpAdsLog || []).slice(-8));
    };
    tick();
    const t = window.setInterval(tick, 1000);

    return () => {
      document.removeEventListener('securitypolicyviolation', onViolation);
      window.clearInterval(t);
    };
  }, []);

  if (!on) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 8,
        left: 8,
        right: 8,
        zIndex: 99999,
        maxHeight: '55vh',
        overflow: 'auto',
        background: 'rgba(0,0,0,0.92)',
        color: '#fff',
        font: '11px/1.4 monospace',
        padding: 8,
        borderRadius: 8,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-all',
      }}
    >
      <strong>ADS DEBUG (add ?adsdebug=0 to turn off)</strong>
      {'\n'}
      {lines.join('\n')}
      {'\n\n'}
      <strong>CSP violations ({violations.length})</strong>
      {'\n'}
      {violations.length ? violations.join('\n') : 'none'}
      {'\n\n'}
      <strong>log</strong>
      {'\n'}
      {log.length ? log.join('\n') : '(empty)'}
    </div>
  );
}

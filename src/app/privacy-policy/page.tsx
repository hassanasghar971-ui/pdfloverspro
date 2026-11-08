import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/tools-registry';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How PDF Lovers Pro handles your files, cookies, advertising and consent choices, and how to contact us about your data.',
  alternates: { canonical: '/privacy-policy' },
};

const H2 = 'mt-10 text-xl font-bold text-slate-900';
const P = 'mt-3 text-base leading-relaxed text-slate-700';
const UL = 'mt-3 list-disc space-y-2 pl-6 text-base leading-relaxed text-slate-700';

export default function PrivacyPolicyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Privacy Policy</h1>
      <p className={P}>
        This policy explains what {SITE.name} ({SITE.url}) does with information when you use the
        site. We have tried to keep it short and specific. It describes how the site works today,
        and we will update it if that changes.
      </p>

      <h2 className={H2}>1. Who we are</h2>
      <p className={P}>
        {SITE.name} is run by {SITE.founder}. For any privacy question or request, write to{' '}
        <a className="underline" href={`mailto:${SITE.email}`}>
          {SITE.email}
        </a>
        .
      </p>

      <h2 className={H2}>2. Your files</h2>
      <p className={P}>
        The PDF tools run in your browser. The files you choose are processed on your own device and
        are not uploaded to our servers, so we cannot see them or keep a copy.
      </p>
      <p className={P}>
        Some features need supporting files that your browser downloads from public services, for
        example PDF rendering assets from a content delivery network such as jsDelivr or cdnjs, and
        OCR language data from tessdata.projectnaptha.com. These requests tell the provider your IP
        address and browser details, as any web request does, but they never contain your documents.
      </p>
      <p className={P}>
        Advertising scripts (see section 5) run inside the page. We do not send your files to them,
        but you should still avoid any online tool for documents that must never leave systems you
        control.
      </p>

      <h2 className={H2}>3. Information processed when you visit</h2>
      <ul className={UL}>
        <li>
          <strong>Hosting logs.</strong> Our hosting provider, Vercel, processes technical data such
          as your IP address, browser type, requested page and time in order to deliver the site and
          keep it secure. We do not use these logs to build profiles of visitors.
        </li>
        <li>
          <strong>Country check.</strong> A small endpoint on our site (/api/region) reads the
          country that our host derives from your IP address. We use it only to decide whether to
          ask for your consent before any ad loads. We do not store the result on our servers.
        </li>
        <li>
          <strong>No accounts, no analytics.</strong> You do not need an account. At the time of
          writing the site does not use an analytics tool. If we add one, we will list it here.
        </li>
      </ul>

      <h2 className={H2}>4. What is stored in your browser</h2>
      <ul className={UL}>
        <li>
          <strong>plp_consent_v1</strong> (local storage): your Accept or Reject choice and the
          time you made it. It is kept for up to 12 months or until you clear your browser data.
        </li>
        <li>
          <strong>plp_region_mode_v1</strong> and <strong>plp_sb_loads</strong> (session storage):
          whether your region is asked first, and how many times an ad script has loaded in this
          visit. They are removed when you close the tab. A third ad counter (plp_x1_loads) is used
          the same way.
        </li>
        <li>
          <strong>Advertising partners</strong> may set their own cookies or similar identifiers
          once ads are allowed. We do not control them.
        </li>
      </ul>

      <h2 className={H2}>5. Advertising</h2>
      <p className={P}>
        The site is free because it shows third-party advertising, delivered by our advertising
        partner Adsterra and the domains it uses to serve ads. Ad providers may use cookies, device
        information and identifiers to show and measure ads, and may receive your IP address.
      </p>
      <ul className={UL}>
        <li>
          In the European Economic Area, the United Kingdom, Switzerland, and wherever we cannot
          determine your country, no ad loads until you choose Accept.
        </li>
        <li>
          In other regions ads load by default, and you can switch them off at any time with the
          Cookie settings link in the footer.
        </li>
        <li>
          If your browser sends a Global Privacy Control signal, we treat it as an opt-out of ads
          unless you choose Accept.
        </li>
        <li>
          If you choose Reject, no ad scripts are loaded. An ad that was already showing may stay
          until you reload the page.
        </li>
      </ul>

      <h2 className={H2}>6. Your choices</h2>
      <p className={P}>
        Use the <strong>Cookie settings / Do not sell or share my info</strong> link in the footer
        at any time to change your choice. You can also block or delete cookies in your browser
        settings, or use a browser that sends the Global Privacy Control signal.
      </p>

      <h2 className={H2}>7. Legal bases (EEA and UK)</h2>
      <p className={P}>
        We rely on your consent for advertising that uses cookies or similar identifiers, and on our
        legitimate interest in running and securing the site for basic hosting logs.
      </p>

      <h2 className={H2}>8. Your rights</h2>
      <p className={P}>
        Depending on where you live, you may have the right to access, correct or delete personal
        data, to object to or restrict its use, to withdraw consent, and to complain to your data
        protection authority. Because we keep almost no personal data ourselves, most of this
        concerns our providers, but you can write to us and we will help or point you to the right
        provider.
      </p>
      <p className={P}>
        <strong>California and similar laws.</strong> Showing ads through an ad network may count as
        sharing or selling personal information under some laws. Use the Cookie settings link to opt
        out. We will not treat you differently for doing so.
      </p>

      <h2 className={H2}>9. Retention and transfers</h2>
      <p className={P}>
        We keep no copies of your files. Hosting logs are kept by Vercel under its own retention
        rules. Your consent choice stays in your browser. Our hosting and advertising providers may
        process data in countries outside your own, including the United States.
      </p>

      <h2 className={H2}>10. Children</h2>
      <p className={P}>
        The site is not directed at children under 13, and we do not knowingly collect their
        personal information.
      </p>

      <h2 className={H2}>11. Changes and contact</h2>
      <p className={P}>
        We may update this policy when the site or the law changes, and the current version is
        always on this page. Questions: {SITE.email}. See also our{' '}
        <Link className="underline" href="/terms-and-conditions">
          Terms and Conditions
        </Link>
        .
      </p>
    </article>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import { Crown, Shield, ArrowLeft, FileText, CheckCircle2, AlertTriangle, Scale, Lock, Globe, Mail } from 'lucide-react';

export default function TermsPage() {
  const tableOfContents = [
    { num: '1', title: 'Introduction and Acceptance of Terms', id: 'section-1' },
    { num: '2', title: 'Eligibility and Age Requirement', id: 'section-2' },
    { num: '3', title: 'Equal Treatment of Creators Worldwide', id: 'section-3' },
    { num: '4', title: 'Account Registration, Security and Termination of Access', id: 'section-4' },
    { num: '5', title: 'Creator and Fan Roles and Responsibilities', id: 'section-5' },
    { num: '6', title: 'Content Standards and Strictly Prohibited Material', id: 'section-6' },
    { num: '7', title: 'Licence Grant by Creators', id: 'section-7' },
    { num: '8', title: 'Payments, Fees, Subscriptions and International Payouts', id: 'section-8' },
    { num: '9', title: 'Refunds, Chargebacks and Payment Disputes', id: 'section-9' },
    { num: '10', title: 'Acceptable Use Policy', id: 'section-10' },
    { num: '11', title: 'Intellectual Property Rights', id: 'section-11' },
    { num: '12', title: 'Copyright Policy and Notice-and-Takedown Procedure', id: 'section-12' },
    { num: '13', title: 'Age Verification and Record-Keeping Requirements', id: 'section-13' },
    { num: '14', title: 'Anti-Slavery and Anti-Trafficking Policy', id: 'section-14' },
    { num: '15', title: 'Safety, Reporting and Complaints Procedure', id: 'section-15' },
    { num: '16', title: 'Privacy and Data Protection', id: 'section-16' },
    { num: '17', title: 'Disclaimers of Warranties', id: 'section-17' },
    { num: '18', title: 'Limitation of Liability', id: 'section-18' },
    { num: '19', title: 'Indemnification', id: 'section-19' },
    { num: '20', title: 'Account Suspension and Termination', id: 'section-20' },
    { num: '21', title: 'Governing Law, Informal Resolution and Binding Arbitration', id: 'section-21' },
    { num: '22', title: 'General Provisions', id: 'section-22' },
    { num: '23', title: 'Contact Information', id: 'section-23' },
  ];

  return (
    <div className="min-h-screen bg-[#08080a] text-white py-12 selection:bg-[#d4af37]/30 selection:text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Top Navigation Back */}
        <div className="flex items-center justify-between border-b border-[#1c1c28] pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#d4af37] hover:text-[#f5d77f] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to The Mirage
          </Link>
          <div className="flex items-center gap-2 text-xs text-[#8e8e9e]">
            <Globe className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>International Creator Platform</span>
          </div>
        </div>

        {/* Header Title Section */}
        <div className="space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#14141e] border border-[#d4af37]/30 text-[#f5d77f] text-xs font-semibold">
            <Scale className="w-3.5 h-3.5" />
            Legal Agreement
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-black text-white tracking-wide">
            Terms of Service
          </h1>
          <p className="text-sm font-medium text-[#d4af37]">
            Last Updated: 30 October 2026 • © 2026 The Mirage. All rights reserved.
          </p>
          <p className="text-sm text-[#94a3b8] max-w-3xl leading-relaxed">
            An international adult content platform built for creators and fans worldwide. These Terms of Service govern your access to and use of The Mirage platform. Please read them carefully. By creating an account or using any part of the Platform you agree to be bound by these Terms.
          </p>
          <p className="text-xs text-[#717182] leading-relaxed max-w-3xl">
            The Mirage is designed as a global home for adult content creators. We are committed to providing a fair, transparent and secure environment so that creators from every country where adult content is legal can build sustainable income with confidence.
          </p>
        </div>

        {/* Table of Contents Quick Nav */}
        <div className="p-6 rounded-2xl bg-[#101016] border border-[#22222e] space-y-4">
          <div className="flex items-center gap-2 text-[#f5d77f] text-sm font-bold uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            Table of Contents
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-[#cbd5e1]">
            {tableOfContents.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="hover:text-[#f5d77f] hover:underline flex items-start gap-2 py-1 transition-colors"
              >
                <span className="text-[#d4af37] font-bold min-w-[24px]">{item.num}.</span>
                <span>{item.title}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Main Terms Content Sections */}
        <div className="space-y-12 text-sm text-[#cbd5e1] leading-relaxed">
          {/* Section 1 */}
          <section id="section-1" className="p-6 rounded-2xl bg-[#0d0d12] border border-[#1e1e28] space-y-3">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <span className="text-[#f5d77f]">1.</span> Introduction and Acceptance of Terms
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-[#a3a3b5]">
              <p>
                <strong>1.1</strong> These Terms of Service (“Terms”) constitute a legally binding agreement between you (“User”, “you” or “your”) and The Mirage (“The Mirage”, “we”, “us” or “our”). They apply to your access to and use of the website, mobile applications, software and all related services (collectively, the “Platform”).
              </p>
              <p>
                <strong>1.2</strong> By creating an account, accessing, browsing or otherwise using any part of the Platform, you acknowledge that you have read, understood and agree to be bound by these Terms, our Privacy Policy, Acceptable Use Policy and any other policies or guidelines that we may publish from time to time.
              </p>
              <p>
                <strong>1.3</strong> If you do not agree to these Terms, you must not access or use the Platform. Continued use of the Platform after any update to these Terms constitutes acceptance of the revised Terms.
              </p>
              <p>
                <strong>1.4</strong> We may modify these Terms at any time. The most current version will always be available on the Platform with an updated “Last Updated” date. Material changes will be communicated through the Platform or by email where appropriate.
              </p>
              <p>
                <strong>1.5</strong> These Terms apply to all users of the Platform worldwide. Where local law requires additional or different terms, those mandatory local requirements will apply only to the extent necessary and will not affect the validity of the remaining provisions.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section id="section-2" className="p-6 rounded-2xl bg-[#0d0d12] border border-[#1e1e28] space-y-3">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <span className="text-[#f5d77f]">2.</span> Eligibility and Age Requirement (Strictly 18+)
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-[#a3a3b5]">
              <p>
                <strong>2.1</strong> The Mirage is an adult-oriented platform that contains sexually explicit material, including photographs, videos, live streams, audio recordings, text and other adult content.
              </p>
              <p>
                <strong>2.2</strong> You must be at least eighteen (18) years of age, or the age of legal majority in your country of residence (whichever is higher), to create an account or use the Platform. By using the Platform you represent and warrant that you meet this age requirement.
              </p>
              <p>
                <strong>2.3</strong> You further represent and warrant that: (a) you have the legal capacity to enter into these Terms; (b) accessing, viewing or creating adult content is not prohibited by the laws applicable to you; (c) you will not permit any person under the age of 18 to access the Platform through your account, device or credentials; and (d) all information you provide to us is true, accurate and complete.
              </p>
              <p>
                <strong>2.4</strong> We reserve the right, at any time and for any reason, to request government-issued photographic identification or other documentation to verify your age and identity. Failure to provide satisfactory verification within the requested timeframe may result in immediate suspension or permanent termination of your account without notice or refund.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section id="section-3" className="p-6 rounded-2xl bg-[#0d0d12] border border-[#1e1e28] space-y-3">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <span className="text-[#f5d77f]">3.</span> Equal Treatment of Creators Worldwide
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-[#a3a3b5]">
              <p>
                <strong>3.1</strong> The Mirage is an international platform. We welcome Creators and Fans from every country in which the production, distribution and consumption of adult content is legal.
              </p>
              <p>
                <strong>3.2</strong> We are committed to treating every Creator fairly and equally, regardless of country of residence, nationality, race, ethnicity, gender, sexual orientation, religion or background.
              </p>
              <p>
                <strong>3.3</strong> The same standard fee structure, content rules, payout processes, support standards and enforcement practices apply to all Creators. We do not apply different commercial terms solely on the basis of a Creator’s geographic location.
              </p>
              <p>
                <strong>3.4</strong> We endeavour to support multiple payout methods and currencies so that Creators in different regions can receive their earnings in a practical and reliable manner. Available options are displayed in the Creator dashboard and may change from time to time.
              </p>
              <p>
                <strong>3.5</strong> Notwithstanding our global approach, each Creator remains solely responsible for understanding and complying with the laws of their own country (and any other relevant jurisdiction) concerning adult content, taxation, income reporting, and any licensing or registration requirements.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section id="section-4" className="p-6 rounded-2xl bg-[#0d0d12] border border-[#1e1e28] space-y-3">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <span className="text-[#f5d77f]">4.</span> Account Registration, Security and Termination of Access
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-[#a3a3b5]">
              <p>
                <strong>4.1</strong> To access most features of the Platform you must register an account. During registration you agree to provide accurate, current and complete information and to update that information promptly whenever it changes.
              </p>
              <p>
                <strong>4.2</strong> You are solely responsible for maintaining the confidentiality of your username, password and any other credentials. You are also solely responsible for all activities that occur under your account, whether or not authorised by you.
              </p>
              <p>
                <strong>4.3</strong> You agree to notify us immediately if you become aware of any unauthorised access to or use of your account. We will not be liable for any loss arising from unauthorised use of your credentials.
              </p>
              <p>
                <strong>4.4</strong> You may not sell, transfer, share or otherwise permit any third party to use your account. One individual may maintain only one Fan account and one Creator account unless we have given prior written permission for additional accounts.
              </p>
              <p>
                <strong>4.5</strong> We reserve the right to refuse registration, to suspend, restrict or permanently terminate any account at our sole discretion, with or without notice, for any reason including violation of these Terms, suspected illegal activity, extended inactivity, or to protect the Platform, other users or our legitimate interests.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section id="section-5" className="p-6 rounded-2xl bg-[#0d0d12] border border-[#1e1e28] space-y-3">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <span className="text-[#f5d77f]">5.</span> Creator and Fan Roles and Responsibilities
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-[#a3a3b5]">
              <p>
                <strong>5.1</strong> Users of the Platform may register as Creators, Fans, or both.
              </p>
              <p>
                <strong>5.2</strong> Creators are users who upload, publish, schedule and monetise adult content. Creators operate as independent contractors. Nothing in these Terms creates an employment, agency, partnership or joint-venture relationship between any Creator and The Mirage.
              </p>
              <p>
                <strong>5.3</strong> Fans are users who browse, view, purchase, subscribe to, tip or otherwise interact with Creator content.
              </p>
              <p>
                <strong>5.4</strong> Creators are fully and solely responsible for: (a) the content they upload; (b) obtaining and retaining all necessary consents, model releases and licences; (c) ensuring that every person depicted is an adult and has consented to the content; and (d) complying with all applicable laws in the places where the content is created, uploaded and viewed.
              </p>
              <p>
                <strong>5.5</strong> Creators acknowledge that they are responsible for their own tax obligations, including any value-added tax, income tax or other levies that may apply to their earnings in their country of residence or elsewhere.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section id="section-6" className="p-6 rounded-2xl bg-[#141014] border border-red-500/30 space-y-3">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <span className="text-red-400">6.</span> Content Standards and Strictly Prohibited Material
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-[#cbd5e1]">
              <p>
                <strong>6.1</strong> All content uploaded to or distributed through the Platform must feature only consenting adults aged 18 years or older and must comply with all applicable laws.
              </p>
              <p>
                <strong>6.2</strong> The following categories of content are strictly prohibited. Uploading or attempting to upload any such content will result in immediate removal and may lead to permanent account termination and referral to law-enforcement authorities:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-red-200">
                <li>Any material that depicts, involves, or suggests the participation of a minor (any person under 18), including fictional, animated, illustrated or AI-generated depictions;</li>
                <li>Non-consensual content, revenge pornography, or intimate images or recordings shared without the clear, informed and ongoing consent of every person depicted;</li>
                <li>Deepfake, synthetic or artificially generated sexual content of real identifiable individuals created or distributed without their explicit consent;</li>
                <li>Content depicting bestiality, extreme violence, torture, non-consensual acts presented as real, or other illegal activities;</li>
                <li>Content that promotes, facilitates or exploits human trafficking, sexual exploitation, modern slavery or the coercion of any person;</li>
                <li>Content that promotes terrorism, violent extremism, or hate speech directed at individuals or groups based on protected characteristics;</li>
                <li>Copyrighted material used without proper authorisation or licence from the rights holder;</li>
                <li>Any other content that is illegal under the laws of South Africa or under the laws of the jurisdiction in which it is uploaded or viewed.</li>
              </ul>
              <p>
                <strong>6.3</strong> Creators must be able to demonstrate, upon request, that every person appearing in their content was at least 18 years old at the time of creation and gave informed consent. We may require production of government-issued identification and signed model releases.
              </p>
              <p>
                <strong>6.4</strong> The Mirage reserves the absolute right to remove any content, suspend or terminate accounts, and report suspected illegal activity to competent authorities without prior notice and without liability to the affected user.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section id="section-7" className="p-6 rounded-2xl bg-[#0d0d12] border border-[#1e1e28] space-y-3">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <span className="text-[#f5d77f]">7.</span> Licence Grant by Creators
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-[#a3a3b5]">
              <p>
                <strong>7.1</strong> By uploading, posting, or otherwise submitting any content to the Platform, you (as Creator) grant The Mirage a worldwide, non-exclusive, royalty-free, transferable and sub-licensable licence to host, store, reproduce, adapt (for technical and formatting purposes), display, perform, distribute, communicate to the public, promote and otherwise use the content in connection with the operation, marketing, improvement and protection of the Platform and related services.
              </p>
              <p>
                <strong>7.2</strong> This licence continues for as long as the content remains on the Platform and for a reasonable period thereafter as needed for backup, archival, legal and operational purposes. You retain ownership of your content subject to this licence.
              </p>
              <p>
                <strong>7.3</strong> You represent and warrant that you have all rights necessary to grant the licence described above and that the content does not infringe the rights of any third party.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section id="section-8" className="p-6 rounded-2xl bg-[#12121a] border border-[#d4af37]/40 space-y-4">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <span className="text-[#f5d77f]">8.</span> Payments, Fees, Subscriptions and International Payouts
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-[#cbd5e1]">
              <p>
                <strong>8.1</strong> Fans may purchase subscriptions, pay-per-view content, tips, private messages and other paid features offered by Creators on the Platform.
              </p>
              <p>
                <strong>8.2</strong> <span className="text-[#f5d77f]/80 text-[11px] block sm:inline font-mono sm:ml-1">[Subject to Client &amp; Legal Counsel Approval]</span> Unless a different written agreement has been concluded with a particular Creator, platform fees and payment processing costs are deducted from gross transaction amounts in accordance with the applicable platform policies and Creator agreement in effect at the time of each transaction. Applicable payout terms, net earnings calculations, and schedule details are provided directly to Creators within their authenticated account portal.
              </p>
              <p>
                <strong>8.3</strong> All prices are displayed in the currency indicated on the Platform at the time of purchase. You are responsible for any applicable taxes, bank charges or currency-conversion fees.
              </p>
              <p>
                <strong>8.4</strong> We aim to offer practical payout options for Creators in as many countries as reasonably possible. The specific methods, currencies, minimum thresholds and processing times available to you are shown in your Creator dashboard and may be updated from time to time.
              </p>
              <p>
                <strong>8.5</strong> Payouts are subject to successful identity and age verification, compliance checks, and any temporary holds required for chargeback risk, fraud prevention or legal process. We process verified payout requests on a regular schedule.
              </p>
              <p>
                <strong>8.6</strong> Creators are solely responsible for determining and fulfilling any tax, reporting or registration obligations that apply to their earnings under the laws of their country of residence or any other relevant jurisdiction.
              </p>
              <p>
                <strong>8.7</strong> Subscriptions renew automatically at the end of each billing period unless the Fan cancels the subscription through the account settings before the renewal date. Cancellation stops future charges but does not entitle the Fan to a refund for the current period already paid.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section id="section-9" className="p-6 rounded-2xl bg-[#0d0d12] border border-[#1e1e28] space-y-3">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <span className="text-[#f5d77f]">9.</span> Refunds, Chargebacks and Payment Disputes
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-[#a3a3b5]">
              <p>
                <strong>9.1</strong> All sales on the Platform are final. The Mirage does not provide refunds except in cases of proven technical error, duplicate billing, or where a refund is required by applicable law.
              </p>
              <p>
                <strong>9.2</strong> If you believe a charge was made in error, you must contact our support team first and allow us a reasonable opportunity to investigate and resolve the issue before initiating a chargeback or payment dispute with your bank or payment provider.
              </p>
              <p>
                <strong>9.3</strong> Initiating a chargeback or dispute without first contacting us may result in immediate suspension of your account and forfeiture of remaining balances or access rights. Creators may be held financially responsible for chargebacks that arise from their content, conduct or failure to deliver promised material.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section id="section-10" className="p-6 rounded-2xl bg-[#0d0d12] border border-[#1e1e28] space-y-3">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <span className="text-[#f5d77f]">10.</span> Acceptable Use Policy
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-[#a3a3b5]">
              <p>In addition to the content rules set out above, you agree that you will not, directly or indirectly:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the Platform for any unlawful purpose or in violation of any local, national or international law;</li>
                <li>Attempt to gain unauthorised access to any account, system, network or data belonging to The Mirage or any other user;</li>
                <li>Use bots, scrapers, crawlers, scripts or other automated means to access, collect data from, or interact with the Platform without our prior written consent;</li>
                <li>Interfere with, disrupt, or place an unreasonable load on the Platform or its infrastructure;</li>
                <li>Harass, threaten, stalk, blackmail, defame, or otherwise abuse other users or our staff;</li>
                <li>Impersonate any person or entity, or misrepresent your identity or affiliation;</li>
                <li>Attempt to circumvent or manipulate the payment systems, fee calculations, ranking algorithms or security measures of the Platform;</li>
                <li>Upload or transmit viruses, malware, spyware or any other malicious code;</li>
                <li>Engage in any activity that could damage, disable, overburden or impair the Platform or another user’s experience or data.</li>
              </ul>
            </div>
          </section>

          {/* Section 11 & 12 */}
          <section id="section-11" className="p-6 rounded-2xl bg-[#0d0d12] border border-[#1e1e28] space-y-3">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <span className="text-[#f5d77f]">11.</span> Intellectual Property Rights
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-[#a3a3b5]">
              <p>
                <strong>11.1</strong> The Mirage name, logo, trademarks, trade dress, website and application design, software, code, databases and all related materials are owned by The Mirage or its licensors and are protected by intellectual property laws. You may not use, copy, modify or distribute any of these assets without our prior written permission.
              </p>
              <p>
                <strong>11.2</strong> Except for the limited licence granted by Creators under Section 7, nothing in these Terms transfers any intellectual property rights from The Mirage to you, or from you to The Mirage beyond the scope of that licence.
              </p>
            </div>
          </section>

          <section id="section-12" className="p-6 rounded-2xl bg-[#0d0d12] border border-[#1e1e28] space-y-3">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <span className="text-[#f5d77f]">12.</span> Copyright Policy and Notice-and-Takedown Procedure
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-[#a3a3b5]">
              <p>
                <strong>12.1</strong> The Mirage respects the intellectual property rights of others and expects users to do the same. We respond to clear notices of alleged copyright infringement.
              </p>
              <p>
                <strong>12.2</strong> If you believe that content available on the Platform infringes your copyright, please send a written notice to our designated contact containing: (a) identification of the copyrighted work claimed to have been infringed; (b) identification of the material claimed to be infringing; (c) your contact details; (d) a good-faith statement that use is unauthorised; (e) a statement under penalty of perjury that information is accurate; and (f) physical or electronic signature.
              </p>
              <p>
                <strong>12.3</strong> Upon receipt of a valid notice we may remove or disable access to the allegedly infringing material and terminate repeat infringers.
              </p>
            </div>
          </section>

          {/* Section 13 & 14 */}
          <section id="section-13" className="p-6 rounded-2xl bg-[#0d0d12] border border-[#1e1e28] space-y-3">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <span className="text-[#f5d77f]">13.</span> Age Verification and Record-Keeping Requirements
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-[#a3a3b5]">
              <p>
                <strong>13.1</strong> All persons depicted in any visual content on The Mirage were at least eighteen (18) years of age at the time the content was created.
              </p>
              <p>
                <strong>13.2</strong> Creators are required to create and retain records that confirm the age and identity of every person appearing in their content. These records should include government-issued photographic identification and signed consent or model-release forms.
              </p>
              <p>
                <strong>13.3</strong> Upon request by The Mirage or by any competent authority, Creators must promptly produce the relevant records. Failure to maintain or produce adequate records may result in immediate removal of content and permanent account termination.
              </p>
            </div>
          </section>

          <section id="section-14" className="p-6 rounded-2xl bg-[#0d0d12] border border-[#1e1e28] space-y-3">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <span className="text-[#f5d77f]">14.</span> Anti-Slavery and Anti-Trafficking Policy
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-[#a3a3b5]">
              <p>
                <strong>14.1</strong> The Mirage maintains a zero-tolerance policy toward human trafficking, sexual exploitation, forced labour and modern slavery in any form.
              </p>
              <p>
                <strong>14.2</strong> We prohibit any content, activity or account that involves or promotes the exploitation of any person. We cooperate fully with law-enforcement and regulatory agencies worldwide.
              </p>
              <p>
                <strong>14.3</strong> Any user who becomes aware of content or behaviour that may involve trafficking or exploitation must report it immediately through the available reporting tools.
              </p>
            </div>
          </section>

          {/* Section 15 & 16 */}
          <section id="section-15" className="p-6 rounded-2xl bg-[#0d0d12] border border-[#1e1e28] space-y-3">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <span className="text-[#f5d77f]">15.</span> Safety, Reporting and Complaints Procedure
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-[#a3a3b5]">
              <p>
                <strong>15.1</strong> We provide in-platform reporting tools that allow users to flag content or accounts that appear to violate these Terms. Reports can also be submitted by email to the address listed in the Contact section.
              </p>
              <p>
                <strong>15.2</strong> We review reports in a timely manner and take action we consider appropriate, including content removal, account restriction, permanent termination, and referral to authorities.
              </p>
              <p>
                <strong>15.3</strong> If you have a complaint about the Platform or another user, please contact us with full details. We investigate and respond within a reasonable time.
              </p>
            </div>
          </section>

          <section id="section-16" className="p-6 rounded-2xl bg-[#0d0d12] border border-[#1e1e28] space-y-3">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <span className="text-[#f5d77f]">16.</span> Privacy and Data Protection
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-[#a3a3b5]">
              <p>
                <strong>16.1</strong> Your use of the Platform is also governed by our Privacy Policy, which describes how we collect, use, store, share and protect personal information. The Privacy Policy is incorporated into these Terms by reference.
              </p>
              <p>
                <strong>16.2</strong> By using the Platform you consent to the processing of your information as described in the Privacy Policy. You are responsible for ensuring that any personal information you provide about third parties (including model information) has been obtained lawfully.
              </p>
            </div>
          </section>

          {/* Section 17 & 18 */}
          <section id="section-17" className="p-6 rounded-2xl bg-[#0d0d12] border border-[#1e1e28] space-y-3">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <span className="text-[#f5d77f]">17.</span> Disclaimers of Warranties
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-[#a3a3b5]">
              <p>
                <strong>17.1</strong> THE PLATFORM AND ALL CONTENT, MATERIALS AND SERVICES ARE PROVIDED ON AN “AS IS” AND “AS AVAILABLE” BASIS WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED, STATUTORY OR OTHERWISE.
              </p>
              <p>
                <strong>17.2</strong> We do not warrant that the Platform will be uninterrupted, timely, secure, error-free, or free of viruses or other harmful components.
              </p>
              <p>
                <strong>17.3</strong> You access, view and interact with adult content entirely at your own risk. The Mirage does not endorse, guarantee, or assume responsibility for the accuracy, quality, legality or safety of any Creator or content.
              </p>
            </div>
          </section>

          <section id="section-18" className="p-6 rounded-2xl bg-[#0d0d12] border border-[#1e1e28] space-y-3">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <span className="text-[#f5d77f]">18.</span> Limitation of Liability
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-[#a3a3b5]">
              <p>
                <strong>18.1</strong> TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE MIRAGE AND ITS DIRECTORS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, REVENUE OR DATA.
              </p>
              <p>
                <strong>18.2</strong> OUR TOTAL AGGREGATE LIABILITY TO YOU FOR ALL CLAIMS SHALL NOT EXCEED THE TOTAL AMOUNT YOU HAVE PAID TO US IN THE TWELVE (12) MONTHS IMMEDIATELY PRECEDING THE CLAIM, OR USD 100, WHICHEVER IS GREATER.
              </p>
            </div>
          </section>

          {/* Section 19 & 20 */}
          <section id="section-19" className="p-6 rounded-2xl bg-[#0d0d12] border border-[#1e1e28] space-y-3">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <span className="text-[#f5d77f]">19.</span> Indemnification
            </h2>
            <p className="text-xs sm:text-sm text-[#a3a3b5]">
              You agree to defend, indemnify and hold harmless The Mirage and its owners, officers, directors, employees, agents and partners from and against any claims, damages, losses, liabilities, costs and expenses arising from: (a) your use of the Platform; (b) your content; (c) your violation of these Terms; or (d) any infringement of third-party rights.
            </p>
          </section>

          <section id="section-20" className="p-6 rounded-2xl bg-[#0d0d12] border border-[#1e1e28] space-y-3">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <span className="text-[#f5d77f]">20.</span> Account Suspension and Termination
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-[#a3a3b5]">
              <p>
                <strong>20.1</strong> We may suspend, restrict or permanently terminate your account and access at any time, with or without notice, for violation of these Terms, suspected illegal activity, chargeback abuse, or extended inactivity.
              </p>
              <p>
                <strong>20.2</strong> Upon termination, your right to use the Platform ceases immediately. Provisions regarding ownership, licences, disclaimers, liability and arbitration shall survive.
              </p>
            </div>
          </section>

          {/* Section 21: Governing Law & Arbitration */}
          <section id="section-21" className="p-6 rounded-2xl bg-[#12121c] border border-[#d4af37]/30 space-y-3">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <span className="text-[#f5d77f]">21.</span> Governing Law, Informal Resolution and Binding Arbitration
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-[#cbd5e1]">
              <p>
                <strong>21.1 Governing Law:</strong> These Terms and any dispute arising out of them shall be governed by the laws of the Republic of South Africa, without regard to conflict-of-law principles.
              </p>
              <p>
                <strong>21.2 Informal Resolution First:</strong> You and The Mirage agree to first attempt to resolve any dispute informally and in good faith within thirty (30) days of written notice.
              </p>
              <p>
                <strong>21.3 Binding Arbitration:</strong> If unresolved, disputes shall be submitted to final and binding arbitration administered by the Arbitration Foundation of Southern Africa (AFSA) or under UNCITRAL rules. The seat of arbitration shall be Johannesburg, South Africa. Language: English.
              </p>
              <p>
                <strong>21.4 Individual Arbitration Only:</strong> Class, collective, consolidated or representative actions are strictly waived. All proceedings are conducted on an individual basis only.
              </p>
              <p>
                <strong>21.5 Exceptions:</strong> Either party may seek provisional injunctive relief from a competent court to protect intellectual property rights or preserve status quo.
              </p>
            </div>
          </section>

          {/* Section 22: General Provisions */}
          <section id="section-22" className="p-6 rounded-2xl bg-[#0d0d12] border border-[#1e1e28] space-y-3">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <span className="text-[#f5d77f]">22.</span> General Provisions
            </h2>
            <div className="space-y-2 text-xs sm:text-sm text-[#a3a3b5]">
              <p>
                <strong>22.1 Severability:</strong> If any provision is held unenforceable, remaining provisions continue in full force.
              </p>
              <p>
                <strong>22.2 Entire Agreement:</strong> These Terms and the Privacy Policy constitute the entire agreement between you and The Mirage.
              </p>
              <p>
                <strong>22.3 No Waiver:</strong> Failure to enforce any right does not waive future enforcement.
              </p>
              <p>
                <strong>22.4 Non-Assignment:</strong> You may not assign your rights without our written consent.
              </p>
            </div>
          </section>

          {/* Section 23: Contact Information */}
          <section id="section-23" className="p-6 rounded-2xl bg-[#14141e] border border-[#d4af37]/40 space-y-4">
            <h2 className="text-lg font-serif font-bold text-white flex items-center gap-2">
              <span className="text-[#f5d77f]">23.</span> Contact Information & Legal Notices
            </h2>
            <p className="text-xs sm:text-sm text-[#cbd5e1] leading-relaxed">
              If you have questions about these Terms, need to send a legal notice, copyright complaint, safety report or dispute notice, please contact our international legal compliance team:
            </p>
            <div className="p-4 rounded-xl bg-[#0a0a0e] border border-[#262634] space-y-2">
              <div className="flex items-center gap-2 text-sm text-[#f5d77f]">
                <Mail className="w-4 h-4" />
                <span className="font-semibold">compliance@themirage.vip / legal@themirage.vip</span>
              </div>
              <p className="text-xs text-[#8c8c9e]">
                Please use a clear subject line: <em>“Dispute Notice”</em>, <em>“Copyright Notice”</em>, <em>“Safety Report”</em>, or <em>“Creator Support”</em>.
              </p>
              <p className="text-xs text-red-300">
                For urgent safety matters involving potential exploitation or harm to minors, please mark the subject line <strong>“URGENT SAFETY”</strong> for top priority handling.
              </p>
            </div>
          </section>
        </div>

        {/* Footer Acknowledgement Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#181824] via-[#111118] to-[#181824] border border-[#d4af37]/40 text-center space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-[#d4af37]">
            The Mirage • Built for Creators Everywhere
          </p>
          <p className="text-xs text-[#94a3af]">
            BY CREATING AN ACCOUNT OR USING THE MIRAGE PLATFORM YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD AND AGREE TO BE BOUND BY THESE TERMS OF SERVICE, INCLUDING THE BINDING ARBITRATION PROVISIONS IN SECTION 21.
          </p>
        </div>
      </div>
    </div>
  );
}

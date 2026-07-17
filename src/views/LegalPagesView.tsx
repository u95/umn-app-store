import React, { useState } from 'react';
import { Mail, Shield, FileText, Info, AlertTriangle, AlertCircle, Sparkles, Send, Copy, Check } from 'lucide-react';

interface LegalPagesViewProps {
  page: string; // 'about' | 'privacy' | 'terms' | 'disclaimer' | 'dmca' | 'contact'
  onNavigate: (page: string) => void;
}

export default function LegalPagesView({ page, onNavigate }: LegalPagesViewProps) {
  const [copiedAdUnit, setCopiedAdUnit] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAdUnit(label);
    setTimeout(() => setCopiedAdUnit(null), 2000);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setFormSubmitted(true);
    setTimeout(() => {
      setContactForm({ name: '', email: '', subject: '', message: '' });
      setFormSubmitted(false);
    }, 4000);
  };

  const getPageIcon = () => {
    switch (page) {
      case 'about': return <Info className="w-12 h-12 text-emerald-500" />;
      case 'privacy': return <Shield className="w-12 h-12 text-blue-500" />;
      case 'terms': return <FileText className="w-12 h-12 text-purple-500" />;
      case 'disclaimer': return <AlertTriangle className="w-12 h-12 text-amber-500" />;
      case 'dmca': return <AlertCircle className="w-12 h-12 text-red-500" />;
      case 'contact': return <Mail className="w-12 h-12 text-teal-500" />;
      default: return <Info className="w-12 h-12 text-emerald-500" />;
    }
  };

  const getPageTitle = () => {
    switch (page) {
      case 'about': return 'About UMN App Store';
      case 'privacy': return 'Privacy Policy';
      case 'terms': return 'Terms & Conditions';
      case 'disclaimer': return 'Disclaimer';
      case 'dmca': return 'DMCA & Copyright Policy';
      case 'contact': return 'Contact Us';
      default: return 'Information';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      {/* Back button or nav indicator */}
      <div className="mb-6">
        <button 
          onClick={() => onNavigate('home')}
          className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold hover:underline flex items-center gap-1 cursor-pointer"
        >
          &larr; Back to Google Play Home
        </button>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-6 mb-8">
          {getPageIcon()}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
              {getPageTitle()}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              UMN App Store - Production-Ready Resource (Last updated: July 17, 2026)
            </p>
          </div>
        </div>

        <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300 space-y-6 text-sm leading-relaxed">
          {/* ABOUT US CONTENT */}
          {page === 'about' && (
            <>
              <p className="text-base text-zinc-800 dark:text-zinc-200 font-medium">
                Welcome to the <strong>UMN App Store</strong>, the premier secure mobile distribution repository engineered specifically for the UMN Ministry, college chaplains, student leaders, and global users.
              </p>
              <p>
                Our mission is to establish a unified, high-integrity platform to host, share, and manage Android APK applications with zero friction. Inspired by the sleek, modern design guidelines of Google Play Store, our interface delivers quick, high-speed access to curated theological resources, church tools, scripture trivia, and productivity utilities.
              </p>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-8">Why UMN App Store?</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Verified Secure Hosting:</strong> All APK applications featured on our network are compiled in sandboxed environments, checked for security, and stored securely using GitHub Releases or Google Drive secure cloud vectors.</li>
                <li><strong>Dynamic Offline PWA:</strong> Built as a modern Progressive Web App, you can install the UMN App Store directly on your Android phone, tablet, or desktop to search and download apps offline.</li>
                <li><strong>Publisher Workspace Console:</strong> Empowering certified developers with a unified administrative dashboard to publish updates, configure app metadata, upload screenshots, and monitor download counts in real-time.</li>
              </ul>
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 p-5 rounded-xl mt-6">
                <h4 className="text-emerald-800 dark:text-emerald-400 font-bold mb-1">Our Commitment</h4>
                <p className="text-emerald-700 dark:text-emerald-300 text-xs leading-normal">
                  We strive to empower christian developers and ministry teams with a free, open-source alternative to standard commercial distribution stores, eliminating developer registration obstacles while maintaining supreme compliance and integrity.
                </p>
              </div>
            </>
          )}

          {/* PRIVACY POLICY CONTENT */}
          {page === 'privacy' && (
            <>
              <p>
                At UMN App Store, accessible from our GitHub Pages deployment and standalone PWA client, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by UMN App Store and how we use it.
              </p>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-6">Log Files</h3>
              <p>
                UMN App Store follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this as part of hosting services' analytics. The information collected by log files includes internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable.
              </p>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-6">Cookies and Web Beacons</h3>
              <p>
                Like any other website, UMN App Store uses "cookies". These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
              </p>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-6">Google DoubleClick DART Cookie</h3>
              <p>
                Google is one of the third-party vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.website.com and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL: <a href="https://policies.google.com/technologies/ads" className="text-emerald-600 hover:underline" target="_blank" rel="noopener noreferrer">https://policies.google.com/technologies/ads</a>.
              </p>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-6">Children's Information</h3>
              <p>
                Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity. UMN App Store does not knowingly collect any Personal Identifiable Information from children under the age of 13.
              </p>
            </>
          )}

          {/* TERMS & CONDITIONS */}
          {page === 'terms' && (
            <>
              <p>
                Welcome to UMN App Store! These terms and conditions outline the rules and regulations for the use of UMN App Store's Website.
              </p>
              <p>
                By accessing this website we assume you accept these terms and conditions. Do not continue to use UMN App Store if you do not agree to take all of the terms and conditions stated on this page.
              </p>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-6">License & App Distribution</h3>
              <p>
                Unless otherwise stated, UMN App Store and/or its licensors own the intellectual property rights for all material and apps on UMN App Store. All intellectual property rights are reserved. You may access this from UMN App Store for your personal, non-commercial use subjected to restrictions set in these terms and conditions.
              </p>
              <p>You must not:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Republish modified premium APKs under deceptive brand names.</li>
                <li>Sell, rent or sub-license application material without respective developer permissions.</li>
                <li>Use malicious software or inject scrapers to disrupt database endpoints.</li>
              </ul>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-6">User Comments & Reviews</h3>
              <p>
                Parts of this website offer an opportunity for users to post and exchange opinions and reviews of the listed apps. UMN App Store does not filter, edit, publish or review Comments prior to their presence on the website. Comments do not reflect the views and opinions of UMN App Store, its agents, or affiliates.
              </p>
            </>
          )}

          {/* DISCLAIMER CONTENT */}
          {page === 'disclaimer' && (
            <>
              <p>
                If you require any more information or have any questions about our site's disclaimer, please feel free to contact us by email at <span className="font-semibold text-emerald-600">umnministry@gmail.com</span>.
              </p>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-6">Disclaimers for UMN App Store</h3>
              <p>
                All the information and APKs on this website - UMN App Store - are published in good faith and for general information purpose only. UMN App Store does not make any warranties about the completeness, reliability, and accuracy of this information. Any action you take upon the information you find on this website is strictly at your own risk.
              </p>
              <p>
                Please be aware that while we review apps to the best of our ability, installing third-party APKs requires enabling "Unknown Sources" on Android devices. We are not liable for any system instabilities, cache losses, or software compatibility issues arising from installing compiled packages on your device.
              </p>
              <p>
                From our website, you can visit other websites by following hyperlinks to such external sites. While we strive to provide only quality links to useful and ethical websites, we have no control over the content and nature of these sites.
              </p>
              <div className="border-l-4 border-amber-500 bg-amber-500/10 p-4 rounded-r-xl text-xs text-amber-800 dark:text-amber-300">
                <strong>Important Consent:</strong> By using our website, you hereby consent to our disclaimer and agree to its terms.
              </div>
            </>
          )}

          {/* DMCA POLICY */}
          {page === 'dmca' && (
            <>
              <p>
                UMN App Store respects the intellectual property rights of others. In accordance with the Digital Millennium Copyright Act ("DMCA"), we will respond quickly to claims of copyright infringement committed using our service that are reported to our designated copyright agent.
              </p>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-6">Filing an Infringement Notification</h3>
              <p>
                If you are a copyright owner, authorized to act on behalf of one, or authorized to act under any exclusive right under copyright, please report alleged copyright infringements taking place on or through the site by completing a DMCA Notice of Alleged Infringement and delivering it to our designated email.
              </p>
              <p>Your notification must include the following details:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Identification of the copyrighted work that you claim has been infringed.</li>
                <li>Identification of the material or link you claim is infringing (including the exact app page link).</li>
                <li>Your contact address, telephone number, and email address.</li>
                <li>A statement by you that you have a good faith belief that the disputed use of the material is not authorized.</li>
                <li>A statement by you, made under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner.</li>
              </ul>
              <p className="mt-4">
                Please submit your DMCA takedown requests to: <a href="mailto:umnministry@gmail.com" className="text-red-500 hover:underline font-semibold">umnministry@gmail.com</a>. Upon verification of the claim, the infringing APK and related screenshots will be immediately purged from our servers and database within 48 business hours.
              </p>
            </>
          )}

          {/* CONTACT US FORM */}
          {page === 'contact' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-4">
              <div className="md:col-span-5 space-y-6">
                <p>
                  Have any questions, feedback, or custom app requests? Reach out directly to the UMN development team. We welcome collaboration with other church developers.
                </p>
                
                <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
                  <Mail className="w-5 h-5 text-emerald-500" />
                  <div>
                    <h4 className="text-xs text-zinc-400 font-bold uppercase">Official Email</h4>
                    <a href="mailto:umnministry@gmail.com" className="text-sm font-semibold hover:underline text-emerald-600 dark:text-emerald-400">
                      umnministry@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  <div>
                    <h4 className="text-xs text-zinc-400 font-bold uppercase">Response Window</h4>
                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Within 24-48 Hours
                    </p>
                  </div>
                </div>
              </div>

              <div className="md:col-span-7">
                {formSubmitted ? (
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 p-8 rounded-2xl text-center space-y-3">
                    <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold animate-bounce">
                      ✓
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Message Sent Successfully!</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-normal max-w-sm mx-auto">
                      Thank you for contacting the UMN App Store team. We have received your query and our chaplain support network will get back to you shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Your Name</label>
                      <input 
                        type="text" 
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-zinc-900 dark:text-white"
                        placeholder="John Doe"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Email Address</label>
                        <input 
                          type="email" 
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-zinc-900 dark:text-white"
                          placeholder="johndoe@gmail.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Subject</label>
                        <input 
                          type="text" 
                          value={contactForm.subject}
                          onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-zinc-900 dark:text-white"
                          placeholder="App Upload Inquiry"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-1">Message Body</label>
                      <textarea 
                        required
                        rows={4}
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-zinc-900 dark:text-white resize-none"
                        placeholder="Please elaborate on your questions or custom requirements here..."
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Secure Message</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ADMOB COMPLIANT ADVERTISING MODULE */}
      <div className="mt-12 bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 tracking-wider uppercase mb-4">
          <Sparkles className="w-4 h-4 text-emerald-500" />
          <span>Developer AdMob Ready Showcase & Implementation Guide</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Active Ad Placement Mockups</h3>
            
            {/* Banner Ad Placement */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl relative overflow-hidden">
              <span className="absolute top-0 right-0 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-bl">AdMob Banner</span>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center text-zinc-400 font-bold text-xs">320x50</div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Advertise on UMN App Store</h4>
                  <p className="text-[10px] text-zinc-400">Reach thousands of student users on campus daily.</p>
                </div>
              </div>
            </div>

            {/* Interstitial Ad Placement Info */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl relative overflow-hidden">
              <span className="absolute top-0 right-0 bg-purple-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-bl">AdMob Interstitial</span>
              <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Full-Screen Transition Ads</h4>
              <p className="text-[10px] text-zinc-400 mt-0.5">Triggers dynamically during file downloads or app switches.</p>
            </div>
          </div>

          <div className="space-y-3 bg-zinc-900 text-zinc-300 p-4 rounded-xl font-mono text-[11px] overflow-x-auto relative">
            <div className="flex justify-between items-center mb-2 text-white">
              <span className="font-bold text-[10px] text-zinc-400">INTEGRATION CODE (JAVA/KOTLIN)</span>
              <button 
                onClick={() => handleCopy(adMobCode, 'kotlin')}
                className="text-xs hover:text-emerald-400 flex items-center gap-1 cursor-pointer bg-zinc-800 px-2 py-1 rounded"
              >
                {copiedAdUnit === 'kotlin' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedAdUnit === 'kotlin' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="text-emerald-400">
{`// Initialize Mobile Ads SDK
MobileAds.initialize(this) {}

// Banner Ad Implementation
val adView = AdView(this)
adView.adUnitId = "ca-app-pub-3940256099942544/6300978111"
adView.setAdSize(AdSize.BANNER)
binding.adContainer.addView(adView)
val adRequest = AdRequest.Builder().build()
adView.loadAd(adRequest)`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

const adMobCode = `// Initialize Mobile Ads SDK
MobileAds.initialize(this) {}

// Banner Ad Implementation
val adView = AdView(this)
adView.adUnitId = "ca-app-pub-3940256099942544/6300978111"
adView.setAdSize(AdSize.BANNER)
binding.adContainer.addView(adView)
val adRequest = AdRequest.Builder().build()
adView.loadAd(adRequest)`;

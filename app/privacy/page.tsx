import MinimalNav from '@/components/MinimalNav';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';

export default function PrivacyPage() {
  return (
    <>
      <MinimalNav />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 pb-12">
        <PageHeader
          lines={['Privacy Policy']}
          subtext="How we handle your data"
        />
        
        <div className="mt-8 space-y-6 text-slate-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-purple-300 mb-3">Information Collection</h2>
            <p className="text-slate-400">
              This website does not collect, store, or process any personal information from visitors. 
              We do not use cookies, tracking pixels, or any other tracking technologies.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-purple-300 mb-3">Data Sources</h2>
            <p className="text-slate-400">
              All fighter statistics and event data displayed on this site are sourced from publicly 
              available UFC statistics and ESPN. We do not collect or store any user-generated data.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-purple-300 mb-3">Third-Party Services</h2>
            <p className="text-slate-400">
              This website may be hosted on third-party platforms which may have their own privacy 
              policies. We recommend reviewing those policies if you have concerns about how your 
              browsing data is handled.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-purple-300 mb-3">Changes to This Policy</h2>
            <p className="text-slate-400">
              We reserve the right to update this privacy policy at any time. Changes will be posted 
              on this page with an updated revision date.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-purple-300 mb-3">Contact</h2>
            <p className="text-slate-400">
              If you have any questions about this privacy policy, please contact us through the 
              information provided on the homepage.
            </p>
          </section>

          <p className="text-xs text-slate-500 mt-8">
            Last updated: November 19, 2025
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

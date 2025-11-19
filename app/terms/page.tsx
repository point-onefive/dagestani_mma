import MinimalNav from '@/components/MinimalNav';
import Footer from '@/components/Footer';
import PageHeader from '@/components/PageHeader';

export default function TermsPage() {
  return (
    <>
      <MinimalNav />
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 pb-12">
        <PageHeader
          lines={['Terms of Service']}
          subtext="Please read these terms carefully"
        />
        
        <div className="mt-8 space-y-6 text-slate-300 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-purple-300 mb-3">Acceptance of Terms</h2>
            <p className="text-slate-400">
              By accessing and using this website, you accept and agree to be bound by the terms 
              and provisions of this agreement. If you do not agree to these terms, please do not 
              use this website.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-purple-300 mb-3">Use of Information</h2>
            <p className="text-slate-400">
              The information provided on this website is for general informational and entertainment 
              purposes only. While we strive to keep the information accurate and up-to-date, we make 
              no representations or warranties of any kind, express or implied, about the completeness, 
              accuracy, reliability, suitability, or availability of the information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-purple-300 mb-3">No Betting or Financial Advice</h2>
            <p className="text-slate-400">
              <strong>This website does not provide betting, gambling, or financial advice.</strong> Any 
              statistics, predictions, or analysis presented are for informational purposes only and should 
              not be construed as recommendations for betting or gambling activities. Users are solely 
              responsible for their own decisions and should conduct independent research before making 
              any betting or financial decisions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-purple-300 mb-3">Responsible Gambling</h2>
            <p className="text-slate-400">
              If you choose to engage in sports betting or gambling, please do so responsibly. Gambling 
              can be addictive and may lead to financial loss. Never bet more than you can afford to lose. 
              If you believe you have a gambling problem, please seek help from appropriate resources.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-purple-300 mb-3">Data Accuracy</h2>
            <p className="text-slate-400">
              While we make every effort to ensure the accuracy of fighter statistics and event data, 
              we cannot guarantee that all information is complete, current, or error-free. Data is 
              sourced from publicly available UFC statistics and ESPN, and may be subject to changes 
              or corrections.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-purple-300 mb-3">Limitation of Liability</h2>
            <p className="text-slate-400">
              In no event shall the website operators be liable for any direct, indirect, incidental, 
              special, or consequential damages arising out of or in any way connected with the use of 
              this website or the information contained herein, including but not limited to damages 
              from betting or gambling losses.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-purple-300 mb-3">Changes to Terms</h2>
            <p className="text-slate-400">
              We reserve the right to modify these terms at any time. Changes will be effective 
              immediately upon posting to this page. Your continued use of the website following any 
              changes indicates your acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-purple-300 mb-3">Intellectual Property</h2>
            <p className="text-slate-400">
              All content on this website, including but not limited to text, graphics, logos, and 
              data compilations, is the property of the website operators or its content suppliers 
              and is protected by copyright laws. UFC and ESPN are registered trademarks of their 
              respective owners.
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

import { Link } from 'react-router-dom';
import { ArrowLeftRight, Eye, PiggyBank, ReceiptText, ShieldCheck, Wallet } from 'lucide-react';

const WORKFLOWS = [
  { icon: Wallet, text: 'View your bank accounts and balances' },
  { icon: ReceiptText, text: 'Review the activity on each account' },
  { icon: PiggyBank, text: 'Make deposits into your accounts' },
  { icon: ArrowLeftRight, text: 'Transfer money between accounts' },
];

const FEATURES = [
  { icon: Eye, title: 'Account overview', text: 'See every account you hold in one place, with its balance and status.' },
  { icon: ReceiptText, title: 'Transaction history', text: 'Open any account to read its recorded activity with dates and reference IDs.' },
  { icon: ShieldCheck, title: 'Secure account access', text: 'Sign in with your email and password. Sessions use signed tokens that expire.' },
];

const STEPS = [
  { title: 'Create a customer account', text: 'Register with your name, email, phone number and a password.' },
  { title: 'Sign in securely', text: 'Log in with your email and password to start a session.' },
  { title: 'Manage your banking activity', text: 'View accounts, make deposits and transfer money where supported.' },
];

// Fully static and public: it never calls a protected backend endpoint.
export default function HomePage() {
  return (
    <>
      <section className="ledger border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-5 md:py-24">
          <div className="md:col-span-3">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">Welcome to Banko</h1>
            <p className="mt-5 max-w-xl text-lg">
              Banko is a digital banking system. A simpler place to view your accounts and manage your digital banking activity.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/register" className="btn btn-primary px-6 py-3 text-base">Register Now</Link>
              <Link to="/login" className="btn btn-secondary px-6 py-3 text-base">Login</Link>
            </div>
          </div>
          <div className="card p-6 md:col-span-2">
            <h2 className="text-base font-bold">What you can do</h2>
            <ul className="mt-4 space-y-3">
              {WORKFLOWS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight">Features</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title}>
              <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
              <h3 className="mt-3 font-bold">{title}</h3>
              <p className="muted mt-1 text-sm">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-20 border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <h2 className="text-2xl font-bold tracking-tight">How it works</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map(({ title, text }, i) => (
              <li key={title} className="card p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white dark:bg-indigo-500">{i + 1}</span>
                <h3 className="mt-3 font-bold">{title}</h3>
                <p className="muted mt-1 text-sm">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}

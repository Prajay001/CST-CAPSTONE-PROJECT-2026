import { Link } from 'react-router-dom'
import logo from '../assets/logo-icon.svg'
import '../styles/landing-page.css'

function Landing() {
    return (
        <div className="land-page">
            <header className="land-header">
                <div className="land-brand">
                    <img src={logo} alt="" width="36" height="36" />
                    <span className="land-brand-name">Subscription Sniper</span>
                </div>
                <nav aria-label="Main navigation">
                    <Link className="land-btn land-btn-outline" to="/login">
                        Log In
                    </Link>
                </nav>
            </header>

            <main>
                <section className="land-hero">
                    <h1 className="land-title">
                        Stop paying for subscriptions you forgot about.
                    </h1>
                    <p className="land-text">
                        Subscription Sniper tracks every recurring bill in one place, shows
                        what it really costs you each month, and warns you before the next
                        charge hits.
                    </p>
                    <div className="land-actions">
                        <Link className="land-btn land-btn-solid" to="/register">
                            Get Started
                        </Link>
                        <Link className="land-btn land-btn-outline" to="/login">
                            Log In
                        </Link>
                    </div>
                </section>

                <section className="land-features" aria-label="Features">
                    <article className="land-card">
                        <h2 className="land-card-title">Burn rate</h2>
                        <p className="land-card-text">
                            See your total monthly spending and a yearly projection at a glance.
                        </p>
                    </article>
                    <article className="land-card">
                        <h2 className="land-card-title">48-hour alerts</h2>
                        <p className="land-card-text">
                            Get a warning when a bill is due today, tomorrow or the day after.
                        </p>
                    </article>
                    <article className="land-card">
                        <h2 className="land-card-title">Search and filter</h2>
                        <p className="land-card-text">
                            Find any subscription fast by name, category or billing date.
                        </p>
                    </article>
                </section>
            </main>

            <footer className="land-footer">
                <p>Subscription Sniper &copy; 2026 - CST Capstone Project</p>
            </footer>
        </div>
    )
}

export default Landing
